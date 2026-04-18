# @pivanov/utils

<p align="center">
  <i>A focused collection of TypeScript utilities for modern web development.</i>
  <br /><br />
  <img src="https://img.shields.io/npm/v/@pivanov/utils?logo=npm" alt="NPM Version" />
  &nbsp;
  <img src="https://img.shields.io/npm/dw/@pivanov/utils" alt="Weekly Downloads" />
  &nbsp;
  <img src="https://github.com/pivanov/pivanov-utils/actions/workflows/ci.yml/badge.svg?branch=main" alt="CI Status" />
  &nbsp;
  <img src="https://codecov.io/github/pivanov/pivanov-utils/graph/badge.svg?token=EPRKTP7D79" alt="Coverage Status" />
</p>

## Features

- **Fully typed** - strict TypeScript across every module, literal-type preserving where it matters
- **Tree-shakeable** - ESM + CJS + per-module subpath exports, `"sideEffects": false`
- **Zero dependencies** - React is an optional peer dep only for the `useEventBus` hook
- **Well tested** - 200+ tests, real edge cases (circular refs, typed arrays, Buffers, symbols)

## Installation

```bash
bun add @pivanov/utils
```

```bash
npm install @pivanov/utils
```

```bash
yarn add @pivanov/utils
```

```bash
pnpm add @pivanov/utils
```

## Quick start

```ts
import { camelCase, snakeCase, slugify } from '@pivanov/utils/string';
import { pick, groupBy, deepMerge } from '@pivanov/utils/object';
import { isString, isNil, isDefined } from '@pivanov/utils/assertion';
import { sleep, timeout, retry, parallelLimit } from '@pivanov/utils/promise';
import { deepClone, isEqual, busDispatch, useEventBus } from '@pivanov/utils/tools';
```

## What's inside

| Module | Surface |
|---|---|
| `assertion` | `isString`, `isNumber`, `isBoolean`, `isFunction`, `isObject`, `isRecord`, `isNull`, `isUndefined`, `isNil`, `isDefined`, `isArray`, `isDate`, `isRegExp`, `isError`, `isPromise`, `isMap`, `isSet`, `isPrimitive`, `isEmpty` |
| `object` | `pick`, `omit`, `pickBy`, `omitBy`, `merge`, `deepMerge`, `mapValues`, `mapKeys`, `groupBy`, `invert`, `hasOwn`, `keysOf`, `entriesOf`, `fromEntries` |
| `promise` | `sleep`, `timeout`, `retry`, `defer`, `parallelLimit` - all AbortSignal-aware where relevant |
| `string` | `camelCase`, `pascalCase`, `kebabCase`, `snakeCase`, `titleCase`, `slugify`, `capitalize`, `uncapitalize`, `capitalizeFirstLetter`, `truncate`, `escapeHtml`, `escapeRegExp`, `words`, `lines` |
| `tools/deepClone` | Rich deep clone (prototypes, getters/setters, symbols, Buffers, TypedArrays, circular refs) |
| `tools/isEqual` | Deep equality with cycle detection; compares RegExp, Error, TypedArrays, ArrayBuffer |
| `tools/dom` | `isBrowser`, `checkVisibility`, `isInViewport`, `setStyleProperties`, `calculateRenderedTextWidth` |
| `tools/cache-api` | Typed wrapper over the browser Cache API, with TTL support |
| `tools/eventBus` | `busDispatch`, `busSubscribe`, `busOnce`, `useEventBus` - typed topics, optional error handler |
| `types` | `TDict`, `TObjType`, `DeepPartial`, `DeepReadonly`, `Mutable`, `Prettify` |

See the full **[API documentation](https://pivanov.github.io/pivanov-utils/)**.

## Tree shaking

Subpath imports give the smallest bundles:

```ts
import { camelCase } from '@pivanov/utils/string';
import { deepClone } from '@pivanov/utils/tools';
```

Top-level imports tree-shake fine in modern bundlers:

```ts
import { camelCase, deepClone } from '@pivanov/utils';
```

## A few highlights

### Async that cancels

```ts
import { sleep, timeout, retry } from '@pivanov/utils/promise';

const ctrl = new AbortController();
await sleep(1000, ctrl.signal);                          // cancellable
await timeout(fetch('/slow'), 3000);                     // race with timer
await retry(() => fetch('/api'), { attempts: 5, backoff: (n) => 100 * 2 ** n });
```

### Typed event bus

```ts
import { busDispatch, useEventBus, type IEventBus } from '@pivanov/utils/tools';

interface UserLoggedIn extends IEventBus<{ id: number; name: string }> {
  topic: 'user:logged-in';
}

useEventBus<UserLoggedIn>('user:logged-in', (user) => console.log(user.name));
busDispatch<UserLoggedIn>('user:logged-in', { id: 1, name: 'Ada' });
```

See the [Typed Events guide](https://pivanov.github.io/pivanov-utils/guides/typed-events) for an event-map pattern at scale.

### Cache with TTL

```ts
import {
  storageSetItemWithTTL,
  storageGetItemWithTTL,
} from '@pivanov/utils/tools';

await storageSetItemWithTTL('app', 'token', 'abc123', 10 * 60 * 1000);

const token = await storageGetItemWithTTL<string>('app', 'token');
// null if missing or expired; expired entries are deleted on read
```

### Deep clone that actually preserves shape

```ts
import { deepClone } from '@pivanov/utils/tools';

class User {
  constructor(public name: string) {}
  greet() { return `hi ${this.name}`; }
}

const clone = deepClone(new User('Ada'));
clone instanceof User; // true
clone.greet();         // 'hi Ada'
```

## Compatibility

- Modern browsers (ES2022)
- Bun, Node 18+ (ESM or CJS)
- Cache API requires browser support (Chrome 40+, Firefox 41+, Safari 11.1+)
- React hook requires React 18+

## Development

```bash
bun install
bun test                # run tests
bun run test:coverage   # with coverage (lcov)
bun run typecheck
bun run lint
bun run build           # ESM + CJS + .d.ts
bun run docs:dev        # run VitePress docs site locally
```

## Sponsors

Supported by [LogicStar AI](https://logicstar.ai/)

## License

MIT © [Pavel Ivanov](https://github.com/pivanov)
