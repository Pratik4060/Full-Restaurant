const transientKeys = new Set([
  "loading",
  "mutating",
  "deleting",
  "error",
  "optimisticStatusById",
  "pendingStatusById",
  "rollbackStatusById",
]);

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const mergeCachedValue = <T,>(fallback: T, cached: unknown): T => {
  if (Array.isArray(fallback)) {
    return (Array.isArray(cached) ? cached : fallback) as T;
  }

  if (isPlainObject(fallback)) {
    const result: Record<string, unknown> = { ...fallback };
    const cachedObject = isPlainObject(cached) ? cached : {};

    for (const key of Object.keys(fallback)) {
      if (transientKeys.has(key)) {
        result[key] = fallback[key];
        continue;
      }

      result[key] = mergeCachedValue(result[key], cachedObject[key]);
    }

    return result as T;
  }

  return (cached ?? fallback) as T;
};

export const readCachedJson = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return mergeCachedValue(fallback, JSON.parse(raw));
  } catch {
    return fallback;
  }
};

export const writeCachedJson = (key: string, value: unknown) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota / serialization failures.
  }
};
