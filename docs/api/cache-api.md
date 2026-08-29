# Cache Storage

Typed helpers over the browser [Cache API](https://developer.mozilla.org/en-US/docs/Web/API/Cache).

Import them from **`@pivanov/utils/cache`**. That entry point is built as its own bundle with no React, no event bus and no DOM helpers, so a service worker can import it without pulling in the rest of the package. The same helpers stay available from `@pivanov/utils/tools` and `@pivanov/utils` for callers that already import from there.

Two layers sit on top of Cache Storage:

- **JSON metadata** - the `storage*` helpers, with optional TTL envelopes. Values pass through `JSON.stringify`.
- **Raw responses** - `cachePutResponse` and friends. Body, status and headers survive byte for byte, which is what caching JavaScript, CSS, images and fonts requires.

::: info
The Cache API is available in modern browsers (Chrome 40+, Firefox 41+, Safari 11.1+) and in service workers. It's not available in Node out of the box - use `isCacheStorageSupported()` to guard access during SSR.
:::

## Core operations

### `storageSetItem(cacheName, key, value)`
Stores any JSON-serializable value. `BigInt` values are automatically stringified.

### `storageGetItem<T>(cacheName, key)`
Retrieves a value. Returns `null` if not found. Throws on malformed JSON.

### `storageRemoveItem(cacheName, key)`
Removes one key. Returns `true` if it existed.

### `storageExists(cacheName, key)`
Checks existence without fetching the value.

### `storageGetAllKeys(cacheName)`
Returns every key currently in the cache.

### `storageCalculateSize(cacheName, key?)`
Returns byte length of one entry or the whole cache.

### `storageClear(cacheName)`
Wipes the cache.

```ts
import {
  storageSetItem,
  storageGetItem,
  storageRemoveItem,
  storageExists,
  storageGetAllKeys,
  storageCalculateSize,
  storageClear,
} from '@pivanov/utils/cache';

const CACHE = 'my-app';

await storageSetItem(CACHE, 'user', { id: 1, name: 'Ada' });

const user = await storageGetItem<{ id: number; name: string }>(CACHE, 'user');

if (await storageExists(CACHE, 'user')) {
  // ...
}

await storageRemoveItem(CACHE, 'user');

const keys = await storageGetAllKeys(CACHE);
const size = await storageCalculateSize(CACHE);
await storageClear(CACHE);
```

## TTL (time-to-live)

### `storageSetItemWithTTL(cacheName, key, value, ttlMs)`
Stores a value that expires after `ttlMs` milliseconds.

### `storageGetItemWithTTL<T>(cacheName, key)`
Reads a TTL-wrapped value. Returns `null` if missing or expired; expired entries are deleted on read.

```ts
import {
  storageSetItemWithTTL,
  storageGetItemWithTTL,
} from '@pivanov/utils/cache';

// Store an auth token for 10 minutes
await storageSetItemWithTTL('app', 'token', 'abc123', 10 * 60 * 1000);

// Later
const token = await storageGetItemWithTTL<string>('app', 'token');
if (token) {
  // still valid
}
```

::: warning Wire format
TTL entries are stored as `{ __ttl: true, v, exp }`. They can only be read correctly via `storageGetItemWithTTL`. Mixing TTL and non-TTL APIs on the same key will produce incorrect results.
:::

## Clearing by key pattern

### `storageClearByPrefix(cacheName, prefix)`
### `storageClearBySuffix(cacheName, suffix)`

Clear every entry whose key starts with `prefix` or ends with `suffix`.

```ts
await storageClearByPrefix('app', 'temp-');
await storageClearBySuffix('app', '-draft');
```

::: details Legacy: storageClearByPrefixOrSuffix
The original `storageClearByPrefixOrSuffix(name, str, isPrefix)` remains available but is marked `@deprecated`. Prefer the split functions for readability.
:::

## Absolute URL keys

Keys that start with `http://` or `https://` are stored as-is - useful for caching fetch responses by URL. Bare keys are internally prefixed with `https://cache.internal/` so the Cache API's URL-based requirements are satisfied transparently.

```ts
await storageSetItem('api', 'https://api.example.com/users', data);
await storageGetItem('api', 'https://api.example.com/users');
```

## Raw responses

The `storage*` helpers serialize through JSON, which is wrong for a script or a
stylesheet. These helpers keep the `Response` intact instead.

### `cachePutResponse(cacheName, request, response)`
Stores a response under `request`, which may be a URL string, a `URL` or a
`Request`. The response is cached as a **clone**, so the one you pass in stays
readable and can still be returned to the page. Throws a `TypeError` if its body
has already been consumed.

### `cacheMatchResponse(cacheName, request, options?)`
Returns a fresh, unread `Response`, or `undefined` on a miss. `options` accepts
the standard [`CacheQueryOptions`](https://developer.mozilla.org/en-US/docs/Web/API/Cache/match#options),
so `{ ignoreSearch: true }` matches across cache-busting query strings.

### `cacheHasResponse(cacheName, request, options?)`
Reports presence without reading the body.

### `cacheDeleteResponse(cacheName, request, options?)`
Removes one entry. Returns `true` if something was removed.

### `cacheResponseKeys(cacheName)`
Returns the request URLs stored in the cache. Each one can be handed straight
back to `cacheMatchResponse` or `cacheDeleteResponse`.

```ts
import {
  cacheMatchResponse,
  cachePutResponse,
  cacheResponseKeys,
  cacheDeleteResponse,
} from '@pivanov/utils/cache';

const CACHE = 'assets-v3';

self.addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith((async () => {
    const hit = await cacheMatchResponse(CACHE, event.request);
    if (hit) {
      return hit;
    }

    const response = await fetch(event.request);
    await cachePutResponse(CACHE, event.request, response);
    return response;
  })());
});

// Revision cleanup inside one cache
const stale = (await cacheResponseKeys(CACHE)).filter((url) => !url.includes(revision));
await Promise.all(stale.map((url) => cacheDeleteResponse(CACHE, url)));
```

::: warning Don't mix the layers
An entry written with `cachePutResponse` is not readable via `storageGetItem`,
and vice versa. Pick one layer per key.
:::

## Cache management

### `cacheNames()`
Lists every cache name in the current origin's Cache Storage.

### `cacheExists(cacheName)`
Reports whether a cache exists, without creating it. The other helpers open the
cache on demand, so reach for this when the mere existence of the cache is the
signal.

### `cacheDelete(cacheName)`
Deletes an entire cache. Returns `true` if one was removed.

### `cacheClear(cacheName)`
Empties a cache but keeps the cache itself.

```ts
import { cacheDelete, cacheNames } from '@pivanov/utils/cache';

const outdated = (await cacheNames()).filter((name) => name !== `assets-${revision}`);
await Promise.all(outdated.map(cacheDelete));
```

## Environment support

### `isCacheStorageSupported()`
Returns `true` when the runtime exposes `caches`. Every helper throws a
descriptive error when it does not, so guard with this during SSR or in Node.

```ts
import { isCacheStorageSupported, cacheClear } from '@pivanov/utils/cache';

if (isCacheStorageSupported()) {
  await cacheClear('assets-v3');
}
```
