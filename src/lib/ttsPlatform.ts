/** Mobile / iOS speechSynthesis helpers */

export function isIOSSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  
  // Direct iOS device detection
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  
  // iPadOS 13+ detection: reports as Macintosh but has touch support
  if (ua.includes("Mac")) {
    // Check for touch support using maxTouchPoints (iPadOS has > 0)
    // Also check for ontouchend as a fallback, but verify it's actually present
    const hasTouchPoints = (navigator.maxTouchPoints ?? 0) > 0;
    const hasTouchEnd = typeof document.ontouchend === "function" || document.ontouchend !== undefined;
    return hasTouchPoints || hasTouchEnd;
  }
  
  return false;
}

export function isMobileBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  
  // iOS detection
  if (isIOSSafari()) return true;
  
  // Android detection
  if (/Android/i.test(ua)) return true;
  
  // Other mobile detection (Windows Phone, BlackBerry, etc.)
  if (/Mobile/i.test(ua) && !/iPad/i.test(ua)) return true;
  
  return false;
}

export function shouldUseKeepAlive(): boolean {
  // Chrome desktop bug only — disable on iOS and most mobile browsers.
  if (isIOSSafari()) return false;
  if (typeof navigator !== "undefined" && /Android|Mobile/i.test(navigator.userAgent)) {
    return false;
  }
  return true;
}

/** Wait for voices (mobile often returns [] until voiceschanged). */
export function waitForVoices(timeoutMs = 3000): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve([]);
      return;
    }

    const synth = window.speechSynthesis;
    const existing = synth.getVoices();
    if (existing.length > 0) {
      resolve(existing);
      return;
    }

    let done = false;
    const finish = (voices: SpeechSynthesisVoice[]) => {
      if (done) return;
      done = true;
      synth.removeEventListener("voiceschanged", onChange);
      clearTimeout(timer);
      resolve(voices);
    };

    const onChange = () => finish(synth.getVoices());
    synth.addEventListener("voiceschanged", onChange);
    synth.getVoices();

    const timer = window.setTimeout(() => finish(synth.getVoices()), timeoutMs);
  });
}
