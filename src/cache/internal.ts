/**
 * Internal helpers shared by the `@pivanov/utils/cache` entry point.
 *
 * This module is deliberately dependency-free. The cache entry point is loaded
 * inside service workers, where React, the event bus and DOM helpers are either
 * unavailable or dead weight, so nothing here may reach outside `src/cache`.
 */
import { isCacheStorageSupported } from "./support";

/**
 * Returns the ambient `CacheStorage`, throwing a descriptive error when the
 * runtime does not provide one.
 */
export const getCacheStorage = (): CacheStorage => {
  if (!isCacheStorageSupported()) {
    throw new Error("[@pivanov/utils/cache] Cache Storage is not available in this environment.");
  }
  return caches;
};

/** Opens (or creates) a named cache. */
export const openCache = (cacheName: string): Promise<Cache> => {
  return getCacheStorage().open(cacheName);
};

/**
 * Normalizes a metadata key into an absolute URL. Keys that already look like
 * URLs are passed through untouched, so callers may address real resources.
 */
export const createCacheKey = (key: string): string => {
  if (key.startsWith("http://") || key.startsWith("https://")) {
    return key;
  }
  return `https://cache.internal/${key}`;
};
