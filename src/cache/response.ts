import { getCacheStorage, openCache } from "./internal";

/**
 * Anything the Cache Storage API accepts as a request key: an absolute URL
 * string, a `URL`, or a `Request`.
 */
export type CacheRequestKey = RequestInfo | URL;

/**
 * Stores a raw `Response` under `request`, byte for byte.
 *
 * Unlike {@link storageSetItem}, nothing is serialized: the body, status and
 * headers are preserved exactly, which is what a service worker needs when it
 * caches JavaScript, CSS, images or fonts.
 *
 * The response is cached as a **clone**, so the caller's `response` stays
 * readable afterwards and can still be returned to the page.
 *
 * @throws {TypeError} When `response.bodyUsed` is already `true`, since a
 *   consumed body cannot be cloned.
 *
 * @example
 * ```ts
 * const response = await fetch('/assets/app.abc123.js');
 * await cachePutResponse('assets-v1', '/assets/app.abc123.js', response);
 * return response; // still readable
 * ```
 */
export const cachePutResponse = async (cacheName: string, request: CacheRequestKey, response: Response): Promise<void> => {
  if (response.bodyUsed) {
    throw new TypeError("[@pivanov/utils/cache] cachePutResponse received a Response whose body has already been consumed.");
  }
  const cache = await openCache(cacheName);
  await cache.put(request, response.clone());
};

/**
 * Reads a raw `Response` back out of the cache, or `undefined` on a miss.
 *
 * The returned response is a fresh, unread `Response` each time, so callers may
 * consume its body without affecting the cached entry.
 *
 * @example
 * ```ts
 * const hit = await cacheMatchResponse('assets-v1', '/assets/app.abc123.js');
 * if (hit) {
 *   return hit;
 * }
 * ```
 */
export const cacheMatchResponse = async (cacheName: string, request: CacheRequestKey, options?: CacheQueryOptions): Promise<Response | undefined> => {
  const cache = await openCache(cacheName);
  return cache.match(request, options);
};

/**
 * Deletes a single cached response. Returns `true` when an entry was removed.
 */
export const cacheDeleteResponse = async (cacheName: string, request: CacheRequestKey, options?: CacheQueryOptions): Promise<boolean> => {
  const cache = await openCache(cacheName);
  return cache.delete(request, options);
};

/**
 * Reports whether a response is cached under `request`, without reading its
 * body.
 */
export const cacheHasResponse = async (cacheName: string, request: CacheRequestKey, options?: CacheQueryOptions): Promise<boolean> => {
  const cache = await openCache(cacheName);
  const response = await cache.match(request, options);
  return response !== undefined;
};

/**
 * Lists the request URLs currently stored in a cache.
 *
 * Each entry can be handed straight back to {@link cacheMatchResponse} or
 * {@link cacheDeleteResponse}, which makes this the building block for
 * revision cleanup.
 *
 * @example
 * ```ts
 * const stale = (await cacheResponseKeys('assets-v1')).filter((url) => !url.includes(revision));
 * await Promise.all(stale.map((url) => cacheDeleteResponse('assets-v1', url)));
 * ```
 */
export const cacheResponseKeys = async (cacheName: string): Promise<string[]> => {
  const cache = await openCache(cacheName);
  const requests = await cache.keys();
  return requests.map((request) => request.url);
};

/**
 * Removes every entry from a cache while keeping the cache itself.
 *
 * Use {@link cacheDelete} to drop the cache entirely.
 */
export const cacheClear = async (cacheName: string): Promise<void> => {
  const cache = await openCache(cacheName);
  const requests = await cache.keys();
  await Promise.all(requests.map((request) => cache.delete(request)));
};

/**
 * Lists the names of every cache in the current origin's Cache Storage.
 */
export const cacheNames = async (): Promise<string[]> => {
  return getCacheStorage().keys();
};

/**
 * Reports whether a cache with this name exists, without creating it.
 *
 * Note that {@link cacheMatchResponse} and friends open the cache on demand, so
 * prefer this check when the mere existence of the cache is the signal.
 */
export const cacheExists = async (cacheName: string): Promise<boolean> => {
  return getCacheStorage().has(cacheName);
};

/**
 * Deletes an entire cache. Returns `true` when a cache was removed.
 *
 * @example
 * ```ts
 * const outdated = (await cacheNames()).filter((name) => name !== `assets-${revision}`);
 * await Promise.all(outdated.map(cacheDelete));
 * ```
 */
export const cacheDelete = async (cacheName: string): Promise<boolean> => {
  return getCacheStorage().delete(cacheName);
};
