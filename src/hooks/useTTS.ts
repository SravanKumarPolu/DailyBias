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

export type TTSState = "idle" | "playing" | "paused";

export interface TTSControls {
  state: TTSState;
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
    } = {},
  ) => {
    const { onEnd, onError, onProgress, charIndexOffset = 0 } = options;
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

    const synth = window.speechSynthesis;
    intentionalCancelRef.current = true;
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
      startKeepAlive();
    };
    utterance.onend = () => {
      cleanup();
      onProgress?.(1);
      onEnd?.();
    };
    utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
      cleanup();
      const errorType = e.error;

      // Expected lifecycle events - ignore and don't show toast
      if (errorType === "interrupted" || errorType === "canceled") {
        // If this was an intentional cancel (stop, section switch), ignore silently
        // If it was unexpected, log but don't show toast
        if (!intentionalCancelRef.current) {
          console.warn("TTS interrupted unexpectedly:", errorType);
        }
        setState("idle");
        setActiveSection(null);
        setActiveCharIndex(0);
        setIsQueue(false);
        setQueueProgress(0);
        queueRef.current = [];
        queueIndexRef.current = 0;
        onError?.();
        return;
      }

      // Real errors - log and show toast
      console.warn("TTS error:", errorType);
      setState("idle");
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
      onError?.();
    };

    utteranceRef.current = utterance;
    setActiveSection(sectionId);
    setActiveCharIndex(0);
    setState("playing");

    // Reset intentional cancel flag after starting new speech
    intentionalCancelRef.current = false;

    // Speak synchronously — setTimeout breaks iOS user-gesture requirement.
    try {
      synth.speak(utterance);
    } catch (error) {
      cleanup();
      setState("idle");
      setActiveSection(null);
      console.error("TTS speak() error:", error);
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
    } finally {
      releaseLock();
    }
  }, [startKeepAlive, stopKeepAlive]);

  const playNextInQueue = useCallback(() => {
    const queue = queueRef.current;
    const idx = queueIndexRef.current;
    if (idx >= queue.length) {
      setState("idle");
      setActiveSection(null);
      setActiveCharIndex(0);
      setIsQueue(false);
      setQueueProgress(1);
      queueRef.current = [];
      queueIndexRef.current = 0;
      return;
    }
    const item = queue[idx];
    queueIndexRef.current = idx + 1;
    const base = queue.length > 0 ? idx / queue.length : 0;
    const slice = queue.length > 0 ? 1 / queue.length : 0;
    setQueueProgress(base);
    void speakText(item.text, item.id, {
      onEnd: () => {
        setQueueProgress(base + slice);
        playNextInQueue();
      },
      onError: () => {
        // If an utterance fails in the queue, stop cleanly and show error
        setState("idle");
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
        setQueueProgress(base + slice * ratio);
      },
      charIndexOffset: item.spokenPrefix?.length ?? 0,
    });
  }, [speakText]);

  const play = useCallback((text: string, sectionId: string) => {
    queueRef.current = [];
    queueIndexRef.current = 0;
    setIsQueue(false);
    setQueueProgress(0);
    void speakText(text, sectionId, {
      onEnd: () => {
        setState("idle");
        setActiveSection(null);
        setActiveCharIndex(0);
      },
    });
  }, [speakText]);

  const playAll = useCallback((sections: QueueItem[]) => {
    queueRef.current = sections;
    queueIndexRef.current = 0;
    setIsQueue(true);
    setQueueProgress(0);
    playNextInQueue();
  }, [playNextInQueue]);

  const pause = useCallback(() => {
    const synth = window.speechSynthesis;
    // Don't pause if not speaking or if initialization is in progress
    if (!synth.speaking || startLockRef.current) return;
    synth.pause();
    setState("paused");
  }, []);

  const resume = useCallback(() => {
    const synth = window.speechSynthesis;
    // Don't resume if not paused or if initialization is in progress
    if (!synth.paused || !synth.speaking || startLockRef.current) return;
    synth.resume();
    setState("playing");
  }, []);

  const stop = useCallback(() => {
    stopKeepAlive();
    intentionalCancelRef.current = true;
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    // Release the start lock to allow new speech to start immediately
    startLockRef.current = false;
    queueRef.current = [];
    queueIndexRef.current = 0;
    setState("idle");
    setActiveSection(null);
    setActiveCharIndex(0);
    setIsQueue(false);
    setQueueProgress(0);
    // Reset intentional cancel flag after a brief delay
    setTimeout(() => {
      intentionalCancelRef.current = false;
    }, 100);
  }, [stopKeepAlive]);

  return { state, activeSection, activeCharIndex, queueProgress, isQueue, play, playAll, pause, resume, stop };
}
