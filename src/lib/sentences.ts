/**
 * Split a string into sentences while preserving the absolute character
 * offsets of each sentence within the original text. The offsets are needed
 * so we can map a SpeechSynthesis `charIndex` (which is relative to the
 * spoken utterance) back to a specific sentence for highlighting.
 */
export interface SentenceSpan {
  text: string;
  start: number; // inclusive
  end: number; // exclusive
}

export function splitSentences(input: string): SentenceSpan[] {
  if (!input) return [];
  const spans: SentenceSpan[] = [];
  // Match a run of non-terminator chars followed by terminators (. ! ?) and
  // optional trailing whitespace. Falls back to the remaining tail.
  const regex = /[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(input)) !== null) {
    const raw = match[0];
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const start = match.index;
    spans.push({ text: trimmed, start, end: start + raw.length });
  }
  return spans;
}

/**
 * Given sentence spans and a character index inside the original text,
 * return the index of the sentence that contains that character. Returns
 * -1 when no sentence matches.
 */
export function sentenceIndexAt(spans: SentenceSpan[], charIndex: number): number {
  for (let i = 0; i < spans.length; i++) {
    if (charIndex < spans[i].end) return i;
  }
  return spans.length > 0 ? spans.length - 1 : -1;
}
