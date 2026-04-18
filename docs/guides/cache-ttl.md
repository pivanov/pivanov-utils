# Cache with TTL

Using the browser Cache API for time-bound client-side storage.

## Basic TTL round-trip

```ts
import {
  storageSetItemWithTTL,
  storageGetItemWithTTL,
} from '@pivanov/utils/tools';

const CACHE = 'my-app';

// Store for 10 minutes
await storageSetItemWithTTL(CACHE, 'token', 'abc123', 10 * 60 * 1000);

// Later
const token = await storageGetItemWithTTL<string>(CACHE, 'token');
if (token) {
  api.setAuthToken(token);
}
```

## Stale-while-revalidate

```ts
import {
  storageGetItemWithTTL,
  storageSetItemWithTTL,
} from '@pivanov/utils/tools';

async function loadUser(id: string) {
  const CACHE = 'user-cache';
  const cached = await storageGetItemWithTTL<User>(CACHE, id);
  if (cached) {
    return cached;
  }

  const fresh = await fetch(`/api/users/${id}`).then((r) => r.json());
  await storageSetItemWithTTL(CACHE, id, fresh, 5 * 60 * 1000);
  return fresh;
}
```

## Bulk expiry with key patterns

Group related keys with a prefix so you can sweep them:

```ts
import {
  storageSetItemWithTTL,
  storageClearByPrefix,
} from '@pivanov/utils/tools';

await storageSetItemWithTTL('session', 'draft-email', 'hi...', 60_000);
await storageSetItemWithTTL('session', 'draft-subject', 'hello', 60_000);

// On logout, drop every draft
await storageClearByPrefix('session', 'draft-');
```

## Combining with retry

```ts
import { retry } from '@pivanov/utils/promise';
import { storageGetItemWithTTL, storageSetItemWithTTL } from '@pivanov/utils/tools';

async function resilientFetch(url: string) {
  const cached = await storageGetItemWithTTL<unknown>('api', url);
  if (cached) {
    return cached;
  }
  const value = await retry(() => fetch(url).then((r) => r.json()), {
    attempts: 3,
    backoff: 500,
  });
  await storageSetItemWithTTL('api', url, value, 30_000);
  return value;
}
```

## Known limitations

- The Cache API is not available in Node. Wrap calls in `isBrowser()` or check `typeof caches !== 'undefined'`.
- Serialization goes through `JSON.stringify`. `Date`, `Map`, `Set`, `undefined`, and `Symbol` values are lossy on round-trip. `BigInt` is auto-stringified.
- TTL entries are stored as `{ __ttl: true, v, exp }`. Don't mix TTL and non-TTL reads on the same key.
- Expiry is checked on read only. Expired entries stay in storage until the next `storageGetItemWithTTL` call for that key.
