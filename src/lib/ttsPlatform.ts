/** Mobile / iOS speechSynthesis helpers */

export function isIOSSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (ua.includes("Mac") && "ontouchend" in document);
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
export function waitForVoices(timeoutMs = 1500): Promise<SpeechSynthesisVoice[]> {
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
