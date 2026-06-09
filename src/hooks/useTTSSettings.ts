import { useEffect, useState, useCallback } from "react";
import { safeStorage } from "@/lib/safeStorage";

export const VOICE_KEY = "tts.voiceURI";
export const RATE_KEY = "tts.rate";
export const VOLUME_KEY = "tts.volume";

export const DEFAULT_VOLUME = 0.5;
export const VOLUME_STEP = 0.1;

export const RATE_PRESETS = [0.75, 0.9, 1, 1.25, 1.5] as const;
export type RatePreset = (typeof RATE_PRESETS)[number];

export type TTSAvailability =
  | "loading" // browser supports TTS, voices may still be enumerating
  | "ready" // at least one voice available
  | "no-voices" // supported but no voices installed/exposed
  | "unsupported"; // speechSynthesis not in window

export const isTTSSupported = (): boolean =>
  typeof window !== "undefined" && "speechSynthesis" in window;

/** Clamp and round volume to one decimal between 0 and 1. */
export function clampVolume(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_VOLUME;
  return Math.min(1, Math.max(0, Math.round(value * 10) / 10));
}

export function readStoredVolume(): number {
  if (typeof window === "undefined") return DEFAULT_VOLUME;
  const raw = safeStorage.getItem(VOLUME_KEY);
  if (raw == null) return DEFAULT_VOLUME;
  return clampVolume(parseFloat(raw));
}

/**
 * Curated list of premium / natural-sounding voices, ordered by preference.
 * Soft female voices first, then high-quality neutral fallbacks. Matched as
 * case-insensitive substrings against `voice.name`.
 */
const PREMIUM_VOICE_PATTERNS: string[] = [
  // Apple (iOS / macOS) — Siri / enhanced female voices
  "samantha",
  "ava",
  "allison",
  "serena",
  "karen",
  "moira",
  "tessa",
  "fiona",
  // Google (Android / Chrome) — natural female voices
  "google uk english female",
  "google us english",
  "google english female",
  // Microsoft (Edge / Windows) — Neural female voices
  "aria",
  "jenny",
  "libby",
  "sonia",
  "michelle",
  "natasha",
  // Generic markers of higher-quality engines
  "neural",
  "natural",
  "premium",
  "enhanced",
  "online",
];

const ROBOTIC_VOICE_PATTERNS = ["espeak", "pico", "compact", "novelty"];

const isEnglish = (v: SpeechSynthesisVoice) =>
  v.lang?.toLowerCase().startsWith("en");

const looksFemale = (v: SpeechSynthesisVoice) => {
  const n = v.name.toLowerCase();
  // Heuristic — most TTS APIs don't expose gender, but common female voice
  // names cluster around these tokens.
  return /female|samantha|ava|allison|serena|karen|moira|tessa|fiona|aria|jenny|libby|sonia|michelle|natasha|zira|hazel|susan|victoria|kate|amy|emma|salli|joanna|kimberly/.test(
    n,
  );
};

function scoreVoice(v: SpeechSynthesisVoice): number {
  const name = v.name.toLowerCase();
  if (ROBOTIC_VOICE_PATTERNS.some((p) => name.includes(p))) return -100;

  let score = 0;
  // Prefer English first, then en-US/en-GB specifically.
  if (isEnglish(v)) score += 20;
  if (/en[-_](us|gb)/i.test(v.lang)) score += 5;

  // Curated premium voices — earlier in the list = bigger boost.
  const idx = PREMIUM_VOICE_PATTERNS.findIndex((p) => name.includes(p));
  if (idx >= 0) score += 60 - idx;

  if (looksFemale(v)) score += 15;
  // Local voices tend to be higher fidelity on Apple / Windows.
  if (v.localService) score += 3;
  if (v.default) score += 2;
  return score;
}

/**
 * Pick the best available voice. Preference order:
 *   1. Exact match on the user's stored voiceURI (if still available).
 *   2. Highest-scoring voice using the curated premium-voice ranking
 *      (favors natural, calm, soft female voices across platforms).
 *   3. Default / first English / first voice as last-resort fallback.
 * Returns null when no voices are available.
 */
export function pickBestVoice(
  voices: SpeechSynthesisVoice[],
  preferredURI?: string | null,
): SpeechSynthesisVoice | null {
  if (!voices.length) return null;
  if (preferredURI) {
    const match = voices.find((v) => v.voiceURI === preferredURI);
    if (match) return match;
  }
  const ranked = [...voices]
    .map((v) => ({ v, s: scoreVoice(v) }))
    .sort((a, b) => b.s - a.s);
  if (ranked[0] && ranked[0].s > 0) return ranked[0].v;
  return (
    voices.find((v) => v.default) ||
    voices.find(isEnglish) ||
    voices[0]
  );
}

export function useVoices(): SpeechSynthesisVoice[] {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  useEffect(() => {
    if (!isTTSSupported()) return;
    const load = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length) setVoices(v);
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);
  return voices;
}

/**
 * Tracks whether TTS is usable. Distinguishes the early "loading" window
 * (some browsers populate voices asynchronously) from a definitive
 * "no-voices" state, so the UI can show a friendly message instead of
 * silently doing nothing.
 */
export function useTTSAvailability(): TTSAvailability {
  const voices = useVoices();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!isTTSSupported()) return;
    if (voices.length) return;
    const t = setTimeout(() => setTimedOut(true), 1500);
    return () => clearTimeout(t);
  }, [voices.length]);

  if (!isTTSSupported()) return "unsupported";
  if (voices.length > 0) return "ready";
  return timedOut ? "no-voices" : "loading";
}

export function useTTSSettings() {
  const [voiceURI, setVoiceURIState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return safeStorage.getItem(VOICE_KEY);
  });
  const [rate, setRateState] = useState<number>(() => {
    if (typeof window === "undefined") return 0.9;
    const v = parseFloat(safeStorage.getItem(RATE_KEY) ?? "0.9");
    return Number.isFinite(v) ? v : 0.9;
  });
  const [volume, setVolumeState] = useState<number>(() => readStoredVolume());

  const setVoiceURI = useCallback((uri: string | null) => {
    setVoiceURIState(uri);
    if (uri) safeStorage.setItem(VOICE_KEY, uri);
    else safeStorage.removeItem(VOICE_KEY);
  }, []);

  const setRate = useCallback((r: number) => {
    setRateState(r);
    safeStorage.setItem(RATE_KEY, String(r));
  }, []);

  const setVolume = useCallback((v: number) => {
    const next = clampVolume(v);
    setVolumeState(next);
    safeStorage.setItem(VOLUME_KEY, String(next));
  }, []);

  return { voiceURI, setVoiceURI, rate, setRate, volume, setVolume };
}
