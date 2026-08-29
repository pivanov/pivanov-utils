import { createCacheKey, openCache } from "./internal";

/**
 * `JSON.stringify` replacer that converts `BigInt` values to strings.
 *
 * @example
 * ```ts
 * JSON.stringify({ id: 9007199254740993n }, stringifyBigIntValues);
 * ```
 */
export const stringifyBigIntValues = (_key: string, value: unknown): unknown => {
  return typeof value === "bigint" ? value.toString() : value;
};

/**
 * Stores a JSON-serializable value in the browser Cache API.
 *
 * Note: values are serialized via `JSON.stringify`. `Date`, `Map`, `Set`,
 * `undefined`, and `Symbol` values are lossy. `BigInt` is auto-stringified.
 */
export const storageSetItem = async (cacheName: string, key: string, value: unknown): Promise<void> => {
  const cache = await openCache(cacheName);
  const serializedValue = JSON.stringify(value, stringifyBigIntValues);
  const response = new Response(serializedValue, {
    headers: { "Content-Type": "application/json" },
  });
  const cacheKey = createCacheKey(key);
  await cache.put(new Request(cacheKey), response);
};

/**
 * Retrieves a value from the Cache API. Returns `null` if not found.
 */
export const storageGetItem = async <T>(cacheName: string, key: string): Promise<T | null> => {
  const cache = await openCache(cacheName);
  const cacheKey = createCacheKey(key);
  const response = await cache.match(new Request(cacheKey));
  if (!response) {
    return null;
  }
  const serializedValue = await response.text();
  return JSON.parse(serializedValue) as T;
};

interface ITTLEnvelope<T> {
  __ttl: true;
  v: T;
  /** Unix ms timestamp when the entry becomes invalid. */
  exp: number;
}

const isTTLEnvelope = <T>(value: unknown): value is ITTLEnvelope<T> => {
  return (
    typeof value === "object" && value !== null && (value as ITTLEnvelope<T>).__ttl === true && typeof (value as ITTLEnvelope<T>).exp === "number"
  );
};

/**
 * Stores a value with a TTL (time-to-live in milliseconds). After the TTL
 * elapses, reads via `storageGetItemWithTTL` will return `null` and delete
 * the expired entry.
 *
 * Wire format is a self-describing envelope: `{ __ttl: true, v, exp }`.
 * Entries stored this way are only correctly read via the `WithTTL` variants.
 *
 * @example
 * ```ts
 * await storageSetItemWithTTL('my-cache', 'token', 'abc123', 60_000);
 * const token = await storageGetItemWithTTL<string>('my-cache', 'token');
 * ```
 */
export const storageSetItemWithTTL = async (cacheName: string, key: string, value: unknown, ttlMs: number): Promise<void> => {
  const envelope: ITTLEnvelope<unknown> = {
    __ttl: true,
    v: value,
    exp: Date.now() + ttlMs,
  };
  await storageSetItem(cacheName, key, envelope);
};

/**
 * Reads a value previously stored with `storageSetItemWithTTL`. Returns
 * `null` if absent or expired; expired entries are deleted.
 */
export const storageGetItemWithTTL = async <T>(cacheName: string, key: string): Promise<T | null> => {
  const raw = await storageGetItem<unknown>(cacheName, key);
  if (!isTTLEnvelope<T>(raw)) {
    return null;
  }
  if (Date.now() >= raw.exp) {
    await storageRemoveItem(cacheName, key);
    return null;
  }
  return raw.v;
};

/**
 * Removes a single key. Returns `true` if the key existed and was deleted.
 */
export const storageRemoveItem = async (cacheName: string, key: string): Promise<boolean> => {
  const cache = await openCache(cacheName);
  const cacheKey = createCacheKey(key);
  return cache.delete(new Request(cacheKey));
};

/**
 * Clears every entry in the named cache.
 */
export const storageClear = async (cacheName: string): Promise<void> => {
  const cache = await openCache(cacheName);
  const keys = await cache.keys();
  for (const request of keys) {
    await cache.delete(request);
  }
};

/**
 * Clears every cache entry whose key matches `str` as prefix or suffix.
 *
 * @deprecated Prefer `storageClearByPrefix` / `storageClearBySuffix` for
 *   readability. This function will remain through v1.x.
 */
export const storageClearByPrefixOrSuffix = async (cacheName: string, str: string, isPrefix = true): Promise<void> => {
  const cache = await openCache(cacheName);
  const keys = await cache.keys();
  for (const request of keys) {
    const urlParts = request.url.split("/");
    const key = urlParts[urlParts.length - 1] || "";
    if ((isPrefix && key.startsWith(str)) || (!isPrefix && key.endsWith(str))) {
      await cache.delete(request);
    }
  }
};

/**
 * Clears every cache entry whose key starts with `prefix`.
 */
export const storageClearByPrefix = async (cacheName: string, prefix: string): Promise<void> => {
  await storageClearByPrefixOrSuffix(cacheName, prefix, true);
};

/**
 * Clears every cache entry whose key ends with `suffix`.
 */
export const storageClearBySuffix = async (cacheName: string, suffix: string): Promise<void> => {
  await storageClearByPrefixOrSuffix(cacheName, suffix, false);
};

/**
 * Checks whether a key exists in the cache.
 */
export const storageExists = async (cacheName: string, key: string): Promise<boolean> => {
  const cache = await openCache(cacheName);
  const cacheKey = createCacheKey(key);
  const response = await cache.match(new Request(cacheKey));
  return response !== undefined;
};

/**
 * Returns every key currently stored in the cache.
 */
export const storageGetAllKeys = async (cacheName: string): Promise<string[]> => {
  const cache = await openCache(cacheName);
  const keys = await cache.keys();
  return keys.map((request) => {
    const urlParts = request.url.split("/");
    return urlParts[urlParts.length - 1] || "";
  });
};

/**
 * Calculates the size in bytes of the cache, or of a single entry.
 */
export const storageCalculateSize = async (cacheName: string, cacheKey?: string): Promise<number> => {
  const cache = await openCache(cacheName);

  if (cacheKey) {
    const normalizedKey = createCacheKey(cacheKey);
    const response = await cache.match(new Request(normalizedKey));
    if (response) {
      const body = await response.clone().arrayBuffer();
      return body.byteLength;
    }
    return 0;
  }

  const keys = await cache.keys();
  let totalSize = 0;
  for (const request of keys) {
    const response = await cache.match(request);
    if (response) {
      const body = await response.clone().arrayBuffer();
      totalSize += body.byteLength;
    }
  }
  return totalSize;
};
