# Getting Started

## Installation

::: code-group
```bash [bun]
bun add @pivanov/utils
```
```bash [npm]
npm install @pivanov/utils
```
```bash [yarn]
yarn add @pivanov/utils
```
```bash [pnpm]
pnpm add @pivanov/utils
```
:::

::: info React hook
If you plan to use `useEventBus`, make sure `react` and `react-dom` are installed (they're peer dependencies).
:::

## First steps

```ts
import { camelCase } from '@pivanov/utils/string';
import { pick } from '@pivanov/utils/object';
import { isString } from '@pivanov/utils/assertion';
import { sleep, retry } from '@pivanov/utils/promise';

camelCase('foo-bar');                         // 'fooBar'
pick({ name: 'John', age: 30 }, ['name']);    // { name: 'John' }
isString('hello');                            // true

await sleep(500);
const result = await retry(fetchData, { attempts: 3, backoff: 1000 });
```

## Choosing your imports

Subpath imports produce the smallest bundles:

```ts
import { camelCase, snakeCase } from '@pivanov/utils/string';
import { deepClone } from '@pivanov/utils/tools';
```

Top-level imports tree-shake fine in modern bundlers because the package declares `"sideEffects": false`:

```ts
import { camelCase, deepClone } from '@pivanov/utils';
```

## Type guards, typed

Every type guard narrows its argument properly - no more `as` casts in happy-path code:

```ts
import { isString, isDefined } from '@pivanov/utils/assertion';

function processMaybe(value: string | undefined) {
  if (isString(value)) {
    return value.toUpperCase(); // typed as string
  }
}

// isDefined works as an array filter too:
const values: (number | undefined)[] = [1, undefined, 2];
const clean: number[] = values.filter(isDefined);
```

## Async, ergonomic

```ts
import { timeout, retry, defer, parallelLimit } from '@pivanov/utils/promise';

// 1. Timeout a slow promise
await timeout(fetch('/slow'), 3000);

// 2. Retry with exponential backoff
await retry(() => fetch('/api'), {
  attempts: 5,
  backoff: (n) => 100 * 2 ** n,
});

// 3. Externally-resolvable promise (Promise.withResolvers, polyfilled)
const { promise, resolve } = defer<string>();

// 4. Bounded concurrency
const bodies = await parallelLimit(urls, 4, (url) => fetch(url));
```

## React + Event Bus

```tsx
import { busDispatch, useEventBus } from '@pivanov/utils/tools';

type UserLoggedIn = {
  topic: 'user:logged-in';
  message: { id: number; name: string };
};

function Header() {
  useEventBus<UserLoggedIn>('user:logged-in', (user) => {
    console.log(`Welcome ${user.name}!`);
  });
  return <header>...</header>;
}

busDispatch<UserLoggedIn>('user:logged-in', { id: 1, name: 'Ada' });
```

See the [Typed Events guide](/guides/typed-events) for a scalable event-map pattern.

## Next steps

- Browse the [API Reference](/api/assertion) for every exported function.
- Read the [Async Patterns](/guides/async-patterns) guide for retry/timeout/cancellation recipes.
- Learn the [Cache with TTL](/guides/cache-ttl) pattern for client-side caching.
