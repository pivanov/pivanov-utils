# Changelog

## 1.0.1

Service-worker-safe cache entry point.

### New entry point

**`@pivanov/utils/cache`** - the Cache Storage helpers, on their own.

The helpers previously shipped only through `@pivanov/utils/tools`, whose bundle
carries React (`useEventBus`), the event bus and the DOM helpers. A service
worker that wanted `storageGetItem` had to pull all of it in. The new entry point
is built from a dedicated, unsplit Bun build containing nothing but the cache
implementation, and a release-time check asserts the ESM and CJS artifacts hold
no `react`, `react-dom`, `useEffect` or event-bus references.

`@pivanov/utils/tools` and the root export keep exposing every cache helper, so
existing imports are unaffected.

### New raw response layer

JSON serialization is wrong for a script, a stylesheet or a font. These helpers
store a `Response` byte for byte, preserving body, status and headers:

- `cachePutResponse(cacheName, request, response)` - caches a **clone**, so the
  caller's response stays readable and can still be returned to the page
- `cacheMatchResponse(cacheName, request, options?)` - a fresh `Response`, or
  `undefined` on a miss
- `cacheHasResponse(cacheName, request, options?)`
- `cacheDeleteResponse(cacheName, request, options?)`
- `cacheResponseKeys(cacheName)` - the request URLs held in a cache, for
  revision cleanup

Match, has and delete accept the standard `CacheQueryOptions`, so
`{ ignoreSearch: true }` works across cache-busting query strings.

### New cache management helpers

- `cacheNames()` - every cache name in the origin
- `cacheExists(cacheName)` - existence without creating the cache
- `cacheDelete(cacheName)` - drop a whole cache
- `cacheClear(cacheName)` - empty a cache, keep the cache

### Other

- `isCacheStorageSupported()` - guard cache access during SSR or in Node. Every
  helper now throws a descriptive error instead of a bare `ReferenceError` when
  `caches` is absent.
- The cache implementation moved from `src/tools/cache-api` to `src/cache`. This
  is internal: no import path in the published package changed.
- `bun run verify:dist` verifies the built package against `package.json#exports`
  and is wired into `prepublishOnly`.

## 1.0.0

First stable release. Focus: **major additive expansion, documentation site, and modernized build** - with near-full backward compatibility for 0.0.3 callers.

### New modules and helpers

**`assertion`** - new guards:
- `isArray<T>`, `isDate`, `isRegExp`, `isError`, `isPromise<T>`, `isMap<K,V>`, `isSet<T>`
- `isNil`, `isDefined` (as array filter predicate), `isPrimitive`, `isEmpty`
- `isRecord` - loose counterpart to `isObject`

**`object`** - new helpers:
- `pickBy`, `omitBy` - predicate-based shaping
- `mapValues`, `mapKeys` - object transforms
- `groupBy`, `invert`
- `hasOwn` (typed `Object.hasOwn`)
- `keysOf`, `entriesOf`, `fromEntries` - typed iteration helpers

**`promise`** - new utilities:
- `timeout(promise, ms, reason?)`
- `retry(fn, { attempts, backoff, signal, shouldRetry })`
- `defer<T>()` - polyfill for `Promise.withResolvers`
- `parallelLimit(items, n, fn)` - bounded concurrency, preserves order
- `sleep` now accepts an optional `AbortSignal`

**`string`** - new utilities:
- `snakeCase`, `titleCase`
- `truncate(str, n, ellipsis?)`
- `escapeHtml`, `escapeRegExp`
- `words`, `lines`

**`tools/isEqual`** - expanded support:
- RegExp compared by source + flags
- Error compared by name + message
- TypedArrays compared by constructor + bytes
- ArrayBuffer/DataView byte-wise
- Circular references handled (previously caused infinite recursion)
- Sets of non-primitives now use structural deep equality instead of `set.has()` (which was broken for objects)

**`tools/cache-api`** - TTL storage + readable split APIs:
- `storageSetItemWithTTL(name, key, value, ttlMs)` - stores with expiry
- `storageGetItemWithTTL<T>(name, key)` - returns `null` if missing/expired; expired entries deleted on read
- `storageClearByPrefix(name, prefix)`
- `storageClearBySuffix(name, suffix)`
- `storageClearByPrefixOrSuffix` is **deprecated** (still works; will remain through v1.x)

**`tools/eventBus`**:
- `busOnce(topic, listener, options?)` - fires once, auto-unsubscribes
- `busSubscribe` now accepts `{ onError }` for custom listener error handling

**`tools/dom`**:
- `isInViewport(element, { vertical?, horizontal? })` - pure geometry check, no CSS
- `calculateRenderedTextWidth` uses a cached canvas - up to ~100× fewer DOM allocations in hot loops
- `checkVisibility` broadened to also check `display`, `visibility`, `opacity`, and both viewport axes - each toggleable via options

**`types`** - new utility types:
- `DeepPartial<T>`, `DeepReadonly<T>`, `Mutable<T>`, `Prettify<T>`

### Bug fixes

- `isEqual` no longer infinite-loops on circular references
- `isEqual` correctly compares Sets containing non-primitive values
- `calculateRenderedTextWidth` handles missing 2D context without throwing
- `merge`/`deepMerge` are pure (return new objects; target is not mutated). Call with an empty target to preserve the old mutation pattern when needed: `merge({}, a, b)`

### Documentation

- New VitePress documentation site at https://pivanov.github.io/pivanov-utils/
- Per-module API pages
- Guides for typed events, async patterns, and cache-with-TTL

### Infrastructure

- Build toolchain migrated to **Bun**: `bun build` for ESM + CJS, `tsc` for `.d.ts`
- Removed Rollup + terser + dts plugin chain
- Removed Vitest; tests now run on `bun test`
- Removed `husky` (CI enforces quality)
- Removed dead deps: `@vercel/ncc`, `evt`, `glob`, `tslib`
- `tsconfig.json` modernized: `target: ES2022`, `moduleResolution: Bundler`, `isolatedModules`
- Added per-module subpath exports with dual ESM/CJS type-marker `package.json` files in `dist/`
- CI: single Bun-based workflow (ubuntu + macos)

### Removed

- `TBooleanish` type (narrow, not broadly useful)
- `TObjType` - overlaps `TDict` (kept); use `TDict` going forward

### Notes on "breaking" changes

For almost all 0.0.3 callers, this release is drop-in. The cases where behavior differs at runtime:

1. **`merge`/`deepMerge` are now pure.** Calls that relied on `target` being mutated will not see the mutation. Fix: `merge({}, target, patch)` or use the return value.
2. **`isEqual` on Sets of non-primitive values** now returns `true` when structurally equal (was always `false`). This is a correctness fix aligned with the function's name.
3. **`checkVisibility`** now rejects `display:none`, `visibility:hidden`, `opacity:0`, and horizontal clipping. Pass `{ checkDisplay: false, checkVisibility: false, checkOpacity: false }` to restore the pure vertical-viewport behavior - or use `isInViewport(el, { horizontal: false })`.
4. **`sleep`** return type changed from `Promise<null>` to `Promise<void>` (runtime always resolved to `undefined`).
5. **Removed types**: `TBooleanish`, `TObjType`. Use `TDict` or inline types.

See [MIGRATION.md](./MIGRATION.md) for code snippets.
