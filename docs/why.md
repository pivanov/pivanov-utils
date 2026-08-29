# Why `@pivanov/utils`?

A small, opinionated TypeScript toolbox - the handful of helpers we reach for on every project, with no runtime dependencies and full type safety.

## What's inside

| Module | What it gives you |
|---|---|
| `assertion` | Type guards: `isString`, `isArray`, `isDate`, `isNil`, `isEmpty`, `isPromise`, and more |
| `object` | `pick`, `omit`, `merge`, `deepMerge`, `mapValues`, `groupBy`, `pickBy/omitBy`, typed `keysOf/entriesOf/fromEntries` |
| `promise` | `sleep` (with AbortSignal), `timeout`, `retry` (with backoff + cancellation), `defer`, `parallelLimit` |
| `string` | `camelCase`, `pascalCase`, `kebabCase`, `snakeCase`, `titleCase`, `slugify`, `escapeHtml`, `escapeRegExp`, `truncate`, `words`, `lines` |
| `tools/deepClone` | Rich deep clone - prototypes, getters/setters, symbols, Buffers, TypedArrays, circular refs |
| `tools/isEqual` | Deep structural equality with cycle detection; handles RegExp, Error, TypedArrays, ArrayBuffer |
| `tools/dom` | `isBrowser`, `checkVisibility`, `isInViewport`, `setStyleProperties`, `calculateRenderedTextWidth` |
| `cache` | Cache Storage helpers with BigInt-safe serialization, optional TTL, and raw `Response` caching - shipped as a standalone `@pivanov/utils/cache` entry point |
| `tools/eventBus` | Typed event bus with `busDispatch`, `busSubscribe`, `busOnce`, and the `useEventBus` React hook |
| `types` | `DeepPartial`, `DeepReadonly`, `Mutable`, `Prettify`, `TDict` |

## Design principles

### Zero runtime dependencies
Install just this one package. React is a peer dependency and only needed for the optional `useEventBus` hook.

### Tree-shakeable by construction
Per-module subpath exports plus `"sideEffects": false` means your bundler drops unused code.

```ts
import { camelCase } from '@pivanov/utils/string';
import { deepClone } from '@pivanov/utils/tools';
```

### Fully typed
Every function has generic signatures that preserve literal types where it matters. Type guards narrow their arguments. Utility types like `DeepPartial` and `DeepReadonly` are ready-made.

### Tested
200+ tests covering the happy path and real edge cases - circular references, concurrent timers, Buffer fallbacks, symbol-keyed properties, and more.

## When not to use it

- You already have `lodash` and don't want another dependency - `@pivanov/utils` isn't a full lodash replacement.
- You need specialized libraries (e.g., `mitt` for event bus, `dequal` for equality, `change-case` for strings). Those are excellent at exactly one thing. This library is broader but shallower.

## Drop it in

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

Head to [Getting Started](/getting-started) to begin.
