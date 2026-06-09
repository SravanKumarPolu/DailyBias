import { safeStorage } from "@/lib/safeStorage";
import {
  isLegacyReflectionKey,
  reflectionEntryKey,
  type ReflectionStore,
} from "@/types/reflection";

export const REFLECTION_STORAGE_KEY = "debiasdaily.reflections.v1";
export const REFLECTION_CHANGED_EVENT = "reflection-changed";

function writeReflectionStore(store: ReflectionStore): void {
  safeStorage.setItem(REFLECTION_STORAGE_KEY, JSON.stringify(store));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(REFLECTION_CHANGED_EVENT));
  }
}

/** Migrate biasId-only keys to `1:biasId`; persist when migration runs. */
export function migrateReflectionStore(store: ReflectionStore): {
  store: ReflectionStore;
  migrated: boolean;
} {
  let migrated = false;
  const next: ReflectionStore = {};

  for (const [key, value] of Object.entries(store)) {
    if (typeof value !== "string") continue;
    if (isLegacyReflectionKey(key)) {
      next[reflectionEntryKey(1, key)] = value;
      migrated = true;
    } else {
      next[key] = value;
    }
  }

  return { store: next, migrated };
}

export function readReflectionStore(): ReflectionStore {
  try {
    const raw = safeStorage.getItem(REFLECTION_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ReflectionStore;
    if (!parsed || typeof parsed !== "object") return {};

    const { store, migrated } = migrateReflectionStore(parsed);
    if (migrated) {
      writeReflectionStore(store);
    }
    return store;
  } catch {
    return {};
  }
}

export function getReflectionText(cycle: number, biasId: string): string {
  return readReflectionStore()[reflectionEntryKey(cycle, biasId)] ?? "";
}

export function saveReflectionText(
  cycle: number,
  biasId: string,
  value: string,
): { trimmed: string; hadContent: boolean } {
  const store = readReflectionStore();
  const key = reflectionEntryKey(cycle, biasId);
  const trimmed = value.trim();
  const hadContent = Boolean(store[key]?.trim());

  if (trimmed) {
    store[key] = trimmed;
  } else {
    delete store[key];
  }

  writeReflectionStore(store);
  return { trimmed, hadContent };
}

/** Count week entries with a non-empty reflection for the given cycle. */
export function countReflectionsInWeek(
  entries: { bias: { id: string } }[],
  cycle: number,
  store: ReflectionStore = readReflectionStore(),
): number {
  return entries.filter((entry) => {
    const text = store[reflectionEntryKey(cycle, entry.bias.id)];
    return Boolean(text?.trim());
  }).length;
}
