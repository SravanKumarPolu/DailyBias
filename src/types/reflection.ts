/** Reflection text keyed by `${cycle}:${biasId}` inside debiasdaily.reflections.v1 */
export type ReflectionStore = Record<string, string>;

export function reflectionEntryKey(cycle: number, biasId: string): string {
  return `${cycle}:${biasId}`;
}

/** Legacy store used biasId only (no cycle prefix). */
export function isLegacyReflectionKey(key: string): boolean {
  return !/^\d+:.+/.test(key);
}
