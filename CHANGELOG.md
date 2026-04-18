# Changelog

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
