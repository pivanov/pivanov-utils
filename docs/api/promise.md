# Promise

Async primitives. Import from `@pivanov/utils/promise` or `@pivanov/utils`.

## `sleep(ms, signal?)`

Waits for `ms` milliseconds. Optionally accepts an `AbortSignal` - when the signal aborts, the promise rejects with the signal's reason and the timer is cleared.

```ts
import { sleep } from '@pivanov/utils/promise';

await sleep(1000);

// Cancellable
const ctrl = new AbortController();
setTimeout(() => ctrl.abort(), 50);
await sleep(1000, ctrl.signal); // rejects after 50ms
```

## `timeout(promise, ms, reason?)`

Races a promise against a timer. Rejects with `reason` (or a default `Error`) if the promise doesn't settle in time. The original promise continues executing - `timeout` just gives up waiting.

```ts
import { timeout } from '@pivanov/utils/promise';

await timeout(fetch('/slow'), 3000);

await timeout(
  work(),
  5000,
  new Error('operation took too long'),
);
```

## `retry(fn, options?)`

Runs `fn` and retries on rejection. Re-throws the last error when all attempts are exhausted.

```ts
import { retry } from '@pivanov/utils/promise';

// Fixed delay between attempts
await retry(() => fetch('/api'), { attempts: 3, backoff: 500 });

// Exponential backoff
await retry(work, {
  attempts: 5,
  backoff: (n) => 100 * 2 ** n,
});

// Cancellable
const ctrl = new AbortController();
await retry(work, { attempts: 10, signal: ctrl.signal });

// Opt-out for certain errors
await retry(work, {
  attempts: 3,
  shouldRetry: (err) => !(err instanceof ValidationError),
});
```

### Options

| Option | Type | Default | Purpose |
|---|---|---|---|
| `attempts` | `number` | `3` | Maximum tries (including the first) |
| `backoff` | `number \| (n) => number` | `0` | Delay between attempts. Function form receives the 1-indexed attempt number |
| `signal` | `AbortSignal` | - | Cancels pending retries |
| `shouldRetry` | `(err, n) => boolean` | - | Return false to stop retrying early |

## `defer<T>()`

Creates a promise with externally-controlled `resolve`/`reject`. Equivalent to `Promise.withResolvers` (ES2024), polyfilled.

```ts
import { defer } from '@pivanov/utils/promise';

const { promise, resolve, reject } = defer<string>();

someEmitter.once('data', (value) => resolve(value));
someEmitter.once('error', (err) => reject(err));

const value = await promise;
```

## `parallelLimit(items, concurrency, fn)`

Maps each item through `fn` with bounded concurrency. Results preserve input order.

```ts
import { parallelLimit } from '@pivanov/utils/promise';

// Fetch 100 URLs, 4 at a time
const responses = await parallelLimit(
  urls,
  4,
  (url) => fetch(url),
);
```

If any task rejects, the returned promise rejects as soon as the error surfaces - but already-started tasks continue running. For fully-coordinated cancellation, pass an `AbortSignal` through to your `fn`.
