/**
 * stringifyBigIntValues - A replacer function for JSON.stringify that converts BigInt values to strings.
 *
 * @param {string} _key - The key of the property being stringified.
 * @param {unknown} value - The value of the property being stringified.
 * @returns {unknown} - The value of the property being stringified.
 */

export const stringifyBigIntValues = (_key: string, value: unknown) => {
  return typeof value === 'bigint' ? value.toString() : value;
};

/**
 * Set a value in Cache API
 * @param cacheName The name of the cache
 * @param key The key under which the value will be stored
 * @param value The value to store
 * @throws Will throw an error if the operation fails
 */
export const storageSetItem = async (
  cacheName: string,
  key: string,
  value: unknown,
): Promise<void> => {
  const cache = await caches.open(cacheName);
  const serializedValue = JSON.stringify(value, stringifyBigIntValues);
  const response = new Response(serializedValue, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  await cache.put(key, response);
};

/**
 * Get a value from Cache API
 * @param cacheName The name of the cache
 * @param key The key of the value to retrieve
 * @returns The retrieved value, or null if not found
 * @throws Will throw an error if the operation fails
 */
export const storageGetItem = async <T>(
  cacheName: string,
  key: string,
): Promise<T | null> => {
  const cache = await caches.open(cacheName);
  const response = await cache.match(key);
  if (!response) {
    return null;
  }
  const serializedValue = await response.text();
  return JSON.parse(serializedValue) as T;
};

/**
 * Remove a value from Cache API
 * @param cacheName The name of the cache
 * @param key The key of the value to remove
 * @returns True if the key was found and deleted, false if the key wasn't found
 * @throws Will throw an error if the operation fails
 */
export const storageRemoveItem = async (
  cacheName: string,
  key: string,
): Promise<boolean> => {
  const cache = await caches.open(cacheName);
  return await cache.delete(key);
};

/**
 * Clear all values from Cache API
 * @param cacheName The name of the cache
 * @throws Will throw an error if the operation fails
 */
export const storageClear = async (cacheName: string): Promise<void> => {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (const request of keys) {
    await cache.delete(request);
  }
};

/**
 * Clear values from Cache API by prefix or suffix
 * @param cacheName The name of the cache
 * @param str The prefix or suffix to match keys against
 * @param isPrefix If true, match keys that start with `str`. If false, match keys that end with `str`.
 * @throws Will throw an error if the operation fails
 */
export const storageClearByPrefixOrSuffix = async (
  cacheName: string,
  str: string,
  isPrefix = true,
): Promise<void> => {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (const request of keys) {
    const urlParts = request.url.split('/');
    const key = urlParts[urlParts.length - 1] || '';
    if ((isPrefix && key.startsWith(str)) || (!isPrefix && key.endsWith(str))) {
      await cache.delete(request);
    }
  }
};

/**
 * Check if a key exists in Cache API
 * @param cacheName The name of the cache
 * @param key The key to check
 * @returns True if the key exists, false otherwise
 * @throws Will throw an error if the operation fails
 */
export const storageExists = async (
  cacheName: string,
  key: string,
): Promise<boolean> => {
  const cache = await caches.open(cacheName);
  const response = await cache.match(key);
  return response !== undefined;
};

/**
 * Get all keys from Cache API
 * @param cacheName The name of the cache
 * @returns An array of all keys in Cache API
 * @throws Will throw an error if the operation fails
 */
export const storageGetAllKeys = async (
  cacheName: string,
): Promise<string[]> => {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  return keys.map((request) => {
    const urlParts = request.url.split('/');
    return urlParts[urlParts.length - 1] || '';
  });
};

/**
 * Calculate the size of the Cache API for a given cacheName.
 * If cacheKey is provided, calculate the size of the specific cache entry.
 *
 * @param cacheName The name of the cache
 * @param cacheKey Optional. The key of the specific cache entry to calculate size for.
 * @returns The total size of the cache or the specific cache entry in bytes
 * @throws Will throw an error if the operation fails
 */
export const storageCalculateSize = async (
  cacheName: string,
  cacheKey?: string,
): Promise<number> => {
  const cache = await caches.open(cacheName);

  // If a specific cacheKey is provided, calculate the size of that entry
  if (cacheKey) {
    const response = await cache.match(cacheKey);
    if (response) {
      const clonedResponse = response.clone();
      const body = await clonedResponse.arrayBuffer();
      return body.byteLength;
    }
    return 0;
  }

  // If no cacheKey is provided, calculate the size of all cache entries
  const keys = await cache.keys();
  let totalSize = 0;

  for (const request of keys) {
    const response = await cache.match(request);
    if (response) {
      const clonedResponse = response.clone();
      const body = await clonedResponse.arrayBuffer();
      totalSize += body.byteLength;
    }
  }

  return totalSize;
};
