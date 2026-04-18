# Async Patterns

Recipes built from `sleep`, `timeout`, `retry`, `defer`, and `parallelLimit`.

## Cancellable fetch with timeout

```ts
import { timeout, sleep } from '@pivanov/utils/promise';

async function cancellableFetch(url: string, ms: number, signal?: AbortSignal) {
  const ctrl = new AbortController();
  signal?.addEventListener('abort', () => ctrl.abort(signal.reason));

  return timeout(fetch(url, { signal: ctrl.signal }), ms);
}
```

## Retry with exponential backoff and jitter

```ts
import { retry } from '@pivanov/utils/promise';

const jitter = (ms: number) => ms * (0.75 + Math.random() * 0.5);

const data = await retry(() => fetch('/api').then((r) => r.json()), {
  attempts: 5,
  backoff: (n) => jitter(100 * 2 ** n),
});
```

## Retry only on specific errors

```ts
import { retry } from '@pivanov/utils/promise';

await retry(
  () => callApi(),
  {
    attempts: 3,
    shouldRetry: (err) => {
      // Don't retry on 4xx - only network / 5xx
      if (err instanceof HttpError && err.status < 500) {
        return false;
      }
      return true;
    },
  },
);
```

## Defer to coordinate handlers

```ts
import { defer } from '@pivanov/utils/promise';

const waitForConnect = () => {
  const { promise, resolve, reject } = defer<void>();
  socket.once('connect', () => resolve());
  socket.once('error', (err) => reject(err));
  return promise;
};

await waitForConnect();
```

## Bulk fetch with bounded concurrency

```ts
import { parallelLimit } from '@pivanov/utils/promise';

const urls = [...];
const responses = await parallelLimit(urls, 6, async (url) => {
  const res = await fetch(url);
  return res.json();
});
```

::: tip
`parallelLimit` preserves input order - `responses[i]` corresponds to `urls[i]`.
:::

## Polling until a condition

```ts
import { sleep } from '@pivanov/utils/promise';

async function pollUntil<T>(
  check: () => Promise<T | null>,
  intervalMs: number,
  signal?: AbortSignal,
): Promise<T> {
  while (true) {
    signal?.throwIfAborted();
    const result = await check();
    if (result !== null) {
      return result;
    }
    await sleep(intervalMs, signal);
  }
}
```

## Cancellable sleep

```ts
import { sleep } from '@pivanov/utils/promise';

const ctrl = new AbortController();

setTimeout(() => ctrl.abort(new Error('user navigated away')), 200);

try {
  await sleep(1000, ctrl.signal);
} catch (err) {
  // err is the abort reason
}
```

## Timing out any user-land promise

```ts
import { timeout } from '@pivanov/utils/promise';

try {
  await timeout(doExpensiveThing(), 5000);
} catch (err) {
  if (err instanceof Error && err.message.includes('timed out')) {
    // handle slow path
  }
}
```
