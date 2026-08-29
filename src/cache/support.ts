/**
 * Reports whether the Cache Storage API is reachable in the current realm.
 *
 * Use it to guard cache access during SSR, in Node, or in any runtime that does
 * not expose `caches`.
 *
 * @example
 * ```ts
 * if (isCacheStorageSupported()) {
 *   await cacheClear('assets-v1');
 * }
 * ```
 */
export const isCacheStorageSupported = (): boolean => {
  return typeof caches !== "undefined";
};
