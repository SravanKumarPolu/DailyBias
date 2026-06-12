import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { safeStorage } from "@/lib/safeStorage";
import {
  isTTSSupported,
  pickBestVoice,
  RATE_KEY,
  readStoredVolume,
  VOICE_KEY,
} from "@/hooks/useTTSSettings";
import { shouldUseKeepAlive, waitForVoices, isMobileBrowser } from "@/lib/ttsPlatform";
import {
  trackTTSPlaybackStarted,
  trackTTSPlaybackPaused,
  trackTTSPlaybackResumed,
  trackTTSPlaybackStopped,
  trackTTSPlaybackCompleted,
} from "@/lib/analytics";

export type TTSState = "idle" | "playing" | "paused";
export type PlaybackMode = "all" | "section" | null;

export interface TTSControls {
  state: TTSState;
  playbackMode: PlaybackMode;
  activeSection: string | null;
  /**
   * Character index within the *original section text* that is currently
   * being spoken. When playing the queue we strip the spoken label prefix
   * so this index always refers to the section body, making it safe to
   * use for sentence highlighting.
   */
  activeCharIndex: number;
  queueProgress: number; // 0..1, only meaningful during playAll
  isQueue: boolean;
  play: (text: string, sectionId: string) => void;
  playAll: (sections: { id: string; text: string; spokenPrefix?: string }[]) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

interface QueueItem {
  id: string;
  text: string;
  spokenPrefix?: string;
}

export function useTTS(): TTSControls {
  const [state, setState] = useState<TTSState>("idle");
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [activeCharIndex, setActiveCharIndex] = useState(0);
  const [queueProgress, setQueueProgress] = useState(0);
  const [isQueue, setIsQueue] = useState(false);
  const queueRef = useRef<QueueItem[]>([]);
  const queueIndexRef = useRef(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const keepAliveRef = useRef<number | null>(null);
  const startLockRef = useRef(false);
  const lastErrorToastRef = useRef<number>(0);
  const intentionalCancelRef = useRef(false);
  const playbackSessionIdRef = useRef(0);
  // Track if component is unmounting to prevent error toasts during cleanup
  const isUnmountingRef = useRef(false);
  // Store current text for mobile resume fallback
  const currentTextRef = useRef<string>("");
  // Store resume context for mobile fallback
  const resumeContextRef = useRef<{
    playbackMode: PlaybackMode;
    activeSection: string | null;
    queueIndex: number;
    activeCharIndex: number;
  } | null>(null);

  // Chrome on desktop silently pauses speech after ~15 seconds. Periodically
  // nudging pause/resume keeps long sections playing smoothly.
  const startKeepAlive = useCallback(() => {
    if (!shouldUseKeepAlive()) return;
    if (keepAliveRef.current != null) return;
    keepAliveRef.current = window.setInterval(() => {
      const s = window.speechSynthesis;
      if (s.speaking && !s.paused) {
        s.pause();
        s.resume();
      }
    }, 10000);
  }, []);

  const stopKeepAlive = useCallback(() => {
    if (keepAliveRef.current != null) {
      clearInterval(keepAliveRef.current);
      keepAliveRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      console.log('[TTS] Component unmounting, cleaning up speech');
      isUnmountingRef.current = true;
      intentionalCancelRef.current = true;
      stopKeepAlive();
      if (isTTSSupported()) {
        window.speechSynthesis.cancel();
      }
    };
  }, [stopKeepAlive]);

  // Eagerly trigger voice enumeration so the first click already has the
  // best voice picked instead of falling back to a robotic default.
  // Also listen for voiceschanged to handle cases where voices load asynchronously.
  useEffect(() => {
    if (!isTTSSupported()) return;
    
    const synth = window.speechSynthesis;
    const loadVoices = () => {
      synth.getVoices();
    };
    
    loadVoices();
    synth.addEventListener("voiceschanged", loadVoices);
    
    return () => {
      synth.removeEventListener("voiceschanged", loadVoices);
    };
  }, []);

  // Helper function to cancel speech and wait for cleanup
  const cancelAndWait = useCallback(async () => {
    const synth = window.speechSynthesis;
    intentionalCancelRef.current = true;
    console.log('[TTS] Canceling previous speech');
    synth.cancel();
    utteranceRef.current = null;
    // Wait 100ms for the cancel to take effect on all platforms
    await new Promise(resolve => setTimeout(resolve, 100));
  }, []);

  const speakText = useCallback(async (
    text: string,
    sectionId: string,
    options: {
      onEnd?: () => void;
      onError?: () => void;
      onProgress?: (ratio: number) => void;
      /** Number of leading characters in `text` to ignore when reporting
       *  charIndex back to consumers (e.g. spoken section label prefix). */
      charIndexOffset?: number;
      sessionId?: number;
    } = {},
  ) => {
    const { onEnd, onError, onProgress, charIndexOffset = 0, sessionId } = options;
    if (!isTTSSupported()) {
      toast.error("Text-to-speech not supported", {
        description:
          "This browser doesn't support speech synthesis. Try Chrome, Safari, or Edge.",
      });
      setState("idle");
      setActiveSection(null);
      return;
    }

    const availableVoices = await waitForVoices();
    if (!availableVoices.length) {
      toast.error("No voices available", {
        description:
          "Wait a moment and tap again, or install a system text-to-speech voice.",
      });
      setState("idle");
      setActiveSection(null);
      return;
    }

    if (startLockRef.current) return;
    startLockRef.current = true;

    // Store current text for mobile resume fallback
    currentTextRef.current = text;

    const synth = window.speechSynthesis;
    intentionalCancelRef.current = true;
    console.log('[TTS] Canceling previous speech before starting new speech');
    synth.cancel();
    utteranceRef.current = null;

    const utterance = new SpeechSynthesisUtterance(text);
    const storedRate = parseFloat(safeStorage.getItem(RATE_KEY) ?? "0.9");
    utterance.rate = Number.isFinite(storedRate) ? storedRate : 0.9;
    utterance.pitch = 1.02;
    utterance.volume = readStoredVolume();
    const storedVoiceURI = safeStorage.getItem(VOICE_KEY);
    const chosen = pickBestVoice(availableVoices, storedVoiceURI);
    if (chosen) {
      utterance.voice = chosen;
      utterance.lang = chosen.lang;
    }

    const total = text.length;
    utterance.onboundary = (e: SpeechSynthesisEvent) => {
      // Skip setState if component is unmounting to avoid render-phase warnings
      if (isUnmountingRef.current) {
        return;
      }
      // Validate charIndex to prevent invalid/negative values
      // Allow values up to total length (SpeechSynthesis may send index at end)
      if (!Number.isFinite(e.charIndex) || e.charIndex < 0) {
        return;
      }
      const adjusted = Math.max(0, e.charIndex - charIndexOffset);
      // Only check lower bound - upper bound can be at or beyond text length
      if (adjusted < 0) {
        return;
      }
      setActiveCharIndex(adjusted);
      if (onProgress && total > 0) {
        onProgress(Math.min(1, e.charIndex / total));
      }
    };

    const releaseLock = () => {
      startLockRef.current = false;
    };

    const cleanup = () => {
      stopKeepAlive();
      utteranceRef.current = null;
      releaseLock();
    };

    utterance.onstart = () => {
      // Verify this callback is still for the current session
      if (sessionId !== undefined && playbackSessionIdRef.current !== sessionId) {
        console.log('[TTS] Ignoring stale onstart callback from old session');
        return;
      }
      console.log('[TTS] Speech started for section:', sectionId);
      startKeepAlive();
      // Reset intentional cancel flag after speech successfully starts
      intentionalCancelRef.current = false;
    };
    utterance.onend = () => {
      // Verify this callback is still for the current session
      if (sessionId !== undefined && playbackSessionIdRef.current !== sessionId) {
        console.log('[TTS] Ignoring stale onend callback from old session');
        return;
      }
      console.log('[TTS] Speech ended for section:', sectionId);
      cleanup();
      onProgress?.(1);
      onEnd?.();
    };
    utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
      // Verify this callback is still for the current session
      if (sessionId !== undefined && playbackSessionIdRef.current !== sessionId) {
        console.log('[TTS] Ignoring stale onerror callback from old session');
        return;
      }
      const errorType = e.error;
      console.log('[TTS] Speech error for section:', sectionId, 'error:', errorType, 'intentionalCancel:', intentionalCancelRef.current, 'isUnmounting:', isUnmountingRef.current);
      cleanup();

      // If component is unmounting, ignore all errors silently without setState
      // setState during unmounting can cause "Cannot update a component while rendering" warnings
      if (isUnmountingRef.current) {
        console.log('[TTS] Component is unmounting, ignoring error:', errorType);
        cleanup();
        onError?.();
        return;
      }

      // Expected lifecycle events - ignore and don't show toast
      if (errorType === "interrupted" || errorType === "canceled") {
        // If this was an intentional cancel (stop, section switch), ignore silently
        // If it was unexpected, log but don't show toast
        if (!intentionalCancelRef.current) {
          console.warn("TTS interrupted unexpectedly:", errorType);
        }
        // Skip setState if component is unmounting to avoid render-phase warnings
        if (!isUnmountingRef.current) {
          setState("idle");
          setPlaybackMode(null);
          setActiveSection(null);
          setActiveCharIndex(0);
          setIsQueue(false);
          setQueueProgress(0);
          queueRef.current = [];
          queueIndexRef.current = 0;
        }
        onError?.();
        return;
      }

      // Real errors - log and show toast
      console.warn("[TTS] Real error, showing toast:", errorType);
      // Skip setState if component is unmounting to avoid render-phase warnings
      if (!isUnmountingRef.current) {
        setState("idle");
        setPlaybackMode(null);
        setActiveSection(null);
        setActiveCharIndex(0);
        setIsQueue(false);
        setQueueProgress(0);
        queueRef.current = [];
        queueIndexRef.current = 0;

        // Show toast only for real errors, prevent duplicate toasts
        const now = Date.now();
        if (now - lastErrorToastRef.current > 2000) {
          if (isMobileBrowser()) {
            toast.error("Playback interrupted", {
              description: "Mobile browser interrupted playback. Try a shorter section.",
            });
          } else {
            toast.error("Speech playback failed", {
              description: "Please try again. If the problem persists, your browser may not support text-to-speech.",
            });
          }
          lastErrorToastRef.current = now;
        }
      }
      onError?.();
    };

    utteranceRef.current = utterance;
    setActiveSection(sectionId);
    setActiveCharIndex(0);
    setState("playing");

    // Speak synchronously — setTimeout breaks iOS user-gesture requirement.
    try {
      console.log('[TTS] Starting speech for section:', sectionId);
      synth.speak(utterance);
    } catch (error) {
      console.error("TTS speak() error:", error, 'isUnmounting:', isUnmountingRef.current);
      cleanup();
      setState("idle");
      setActiveSection(null);
      // If component is unmounting, don't show toast
      if (!isUnmountingRef.current) {
        // Show toast for real errors, prevent duplicate toasts
        const now = Date.now();
        if (now - lastErrorToastRef.current > 2000) {
          if (isMobileBrowser()) {
            toast.error("Playback interrupted", {
              description: "Mobile browser interrupted playback. Try a shorter section.",
            });
          } else {
            toast.error("Speech playback failed", {
              description: "Please try again. If the problem persists, your browser may not support text-to-speech.",
            });
          }
          lastErrorToastRef.current = now;
        }
      }
    } finally {
      releaseLock();
    }
  }, [startKeepAlive, stopKeepAlive]);

  const playNextInQueue = useCallback(() => {
    const queue = queueRef.current;
    const idx = queueIndexRef.current;
    console.log('[TTS] playNextInQueue called, index:', idx, 'of', queue.length);
    if (idx >= queue.length) {
      console.log('[TTS] Queue completed');
      // Skip setState if component is unmounting to avoid render-phase warnings
      if (!isUnmountingRef.current) {
        setState("idle");
        setPlaybackMode(null);
        setActiveSection(null);
        setActiveCharIndex(0);
        setIsQueue(false);
        setQueueProgress(1);
        queueRef.current = [];
        queueIndexRef.current = 0;
        trackTTSPlaybackCompleted({ playback_mode: "all" });
      }
      return;
    }
    const item = queue[idx];
    queueIndexRef.current = idx + 1;
    const base = queue.length > 0 ? idx / queue.length : 0;
    const slice = queue.length > 0 ? 1 / queue.length : 0;
    // Skip setState if component is unmounting to avoid render-phase warnings
    if (!isUnmountingRef.current) {
      setQueueProgress(base);
    }
    console.log('[TTS] Playing queue item:', item.id, 'at index:', idx);
    void speakText(item.text, item.id, {
      onEnd: () => {
        console.log('[TTS] Queue item onEnd:', item.id);
        // Skip setState if component is unmounting to avoid render-phase warnings
        if (!isUnmountingRef.current) {
          setQueueProgress(base + slice);
          playNextInQueue();
        }
      },
      onError: () => {
        console.log('[TTS] Queue item onError:', item.id, 'intentionalCancel:', intentionalCancelRef.current, 'isUnmounting:', isUnmountingRef.current);
        // If component is unmounting, ignore all errors silently without setState
        if (isUnmountingRef.current) {
          console.log('[TTS] Component is unmounting, ignoring queue error');
          return;
        }
        // If this was an intentional cancel (section switch), stop cleanly without toast
        if (intentionalCancelRef.current) {
          console.log('[TTS] Queue error was intentional, skipping toast');
          setState("idle");
          setPlaybackMode(null);
          setActiveSection(null);
          setActiveCharIndex(0);
          setIsQueue(false);
          setQueueProgress(0);
          queueRef.current = [];
          queueIndexRef.current = 0;
          return;
        }
        // Real error - show toast
        console.log('[TTS] Queue error was unexpected, showing toast');
        setState("idle");
        setPlaybackMode(null);
        setActiveSection(null);
        setActiveCharIndex(0);
        setIsQueue(false);
        setQueueProgress(0);
        queueRef.current = [];
        queueIndexRef.current = 0;
        toast.error("Playback interrupted", {
          description: "An error occurred while playing. Tap Listen All to try again.",
        });
      },
      onProgress: (ratio) => {
        // Skip setState if component is unmounting to avoid render-phase warnings
        if (!isUnmountingRef.current) {
          setQueueProgress(base + slice * ratio);
        }
      },
      charIndexOffset: item.spokenPrefix?.length ?? 0,
    });
  }, [speakText]);

  const play = useCallback(async (text: string, sectionId: string) => {
    console.log('[TTS] Play called for section:', sectionId);
    // Increment session ID to invalidate old callbacks
    playbackSessionIdRef.current += 1;
    const sessionId = playbackSessionIdRef.current;
    
    // Cancel any existing speech and wait
    await cancelAndWait();
    
    queueRef.current = [];
    queueIndexRef.current = 0;
    setIsQueue(false);
    setQueueProgress(0);
    setPlaybackMode("section");
    trackTTSPlaybackStarted({ playback_mode: "section", bias_id: sectionId });
    void speakText(text, sectionId, {
      sessionId,
      onEnd: () => {
        console.log('[TTS] Play onEnd for section:', sectionId);
        // Skip setState if component is unmounting to avoid render-phase warnings
        if (!isUnmountingRef.current) {
          setState("idle");
          setPlaybackMode(null);
          setActiveSection(null);
          setActiveCharIndex(0);
          trackTTSPlaybackCompleted({ playback_mode: "section", bias_id: sectionId });
        }
      },
    });
  }, [cancelAndWait, speakText]);

  const playAll = useCallback(async (sections: QueueItem[]) => {
    console.log('[TTS] PlayAll called with', sections.length, 'sections');
    // Increment session ID to invalidate old callbacks
    playbackSessionIdRef.current += 1;
    const sessionId = playbackSessionIdRef.current;
    
    // Cancel any existing speech and wait
    await cancelAndWait();
    
    queueRef.current = sections;
    queueIndexRef.current = 0;
    setIsQueue(true);
    setQueueProgress(0);
    setPlaybackMode("all");
    trackTTSPlaybackStarted({ playback_mode: "all" });
    playNextInQueue();
  }, [cancelAndWait, playNextInQueue]);

  const pause = useCallback(() => {
    console.log('[TTS] Pause called');
    const synth = window.speechSynthesis;
    // Don't pause if not speaking or if initialization is in progress
    if (!synth.speaking || startLockRef.current) return;
    
    // Store resume context for mobile fallback
    resumeContextRef.current = {
      playbackMode,
      activeSection,
      queueIndex: queueIndexRef.current,
      activeCharIndex,
    };
    
    synth.pause();
    setState("paused");
    if (playbackMode) {
      trackTTSPlaybackPaused({ playback_mode: playbackMode });
    }
  }, [playbackMode, activeSection, activeCharIndex]);

  const resume = useCallback(async () => {
    console.log('[TTS] Resume called');
    const synth = window.speechSynthesis;
    // Don't resume if not paused or if initialization is in progress
    if (!synth.paused || !synth.speaking || startLockRef.current) return;
    
    // Mobile: skip speechSynthesis.resume(), use cancel-and-restart instead
    if (isMobileBrowser()) {
      console.log('[TTS] Mobile resume: using cancel-and-restart');
      const context = resumeContextRef.current;
      
      if (context) {
        // Cancel current speech and wait
        await cancelAndWait();
        
        // Restart from stored context
        if (context.playbackMode === "section" && context.activeSection && currentTextRef.current) {
          // Restart current section from beginning
          console.log('[TTS] Restarting section:', context.activeSection);
          void play(currentTextRef.current, context.activeSection);
        } else if (context.playbackMode === "all") {
          // Restart Listen All from current queue index
          console.log('[TTS] Restarting Listen All from queue index:', context.queueIndex);
          queueIndexRef.current = context.queueIndex;
          setIsQueue(true);
          setQueueProgress(context.queueIndex / (queueRef.current.length || 1));
          setPlaybackMode("all");
          trackTTSPlaybackResumed({ playback_mode: "all" });
          playNextInQueue();
        }
      } else {
        // No context available, reset to idle
        console.log('[TTS] No resume context, resetting to idle');
        setState("idle");
        setPlaybackMode(null);
        setActiveSection(null);
      }
      return;
    }
    
    // Desktop: use normal speechSynthesis.resume()
    synth.resume();
    setState("playing");
    if (playbackMode) {
      trackTTSPlaybackResumed({ playback_mode: playbackMode });
    }
  }, [playbackMode, play, cancelAndWait, playNextInQueue]);

  const stop = useCallback(() => {
    console.log('[TTS] Stop called');
    const currentPlaybackMode = playbackMode;
    stopKeepAlive();
    intentionalCancelRef.current = true;
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    // Release the start lock to allow new speech to start immediately
    startLockRef.current = false;
    queueRef.current = [];
    queueIndexRef.current = 0;
    setState("idle");
    setPlaybackMode(null);
    setActiveSection(null);
    setActiveCharIndex(0);
    setIsQueue(false);
    setQueueProgress(0);
    // Clear resume context
    resumeContextRef.current = null;
    currentTextRef.current = "";
    if (currentPlaybackMode) {
      trackTTSPlaybackStopped({ playback_mode: currentPlaybackMode });
    }
    // Reset intentional cancel flag after a brief delay
    setTimeout(() => {
      intentionalCancelRef.current = false;
    }, 100);
  }, [stopKeepAlive, playbackMode]);

  return { state, playbackMode, activeSection, activeCharIndex, queueProgress, isQueue, play, playAll, pause, resume, stop };
}
