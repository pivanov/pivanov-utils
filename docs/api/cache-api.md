# Cache API

Typed wrapper over the browser [Cache API](https://developer.mozilla.org/en-US/docs/Web/API/Cache). Import from `@pivanov/utils/tools` or `@pivanov/utils`.

::: info
The Cache API is available in modern browsers (Chrome 40+, Firefox 41+, Safari 11.1+) and in service workers. It's not available in Node out of the box.
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
} from '@pivanov/utils/tools';

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
} from '@pivanov/utils/tools';

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
