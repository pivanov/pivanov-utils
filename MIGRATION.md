# Migration guide: 0.0.3 → 1.0.0

For the vast majority of 0.0.3 callers, upgrading is a drop-in. A few call sites warrant a look.

## Pin 0.0.3 if you need the old behavior

```bash
npm install @pivanov/utils@0.0.3
```

## `merge` and `deepMerge` are now pure

**0.0.3**: `merge(target, patch)` mutated `target` and returned it.
**1.0.0**: returns a new object; `target` is untouched.

```ts
// 0.0.3 code that relied on mutation:
const state = { a: 1 };
merge(state, { b: 2 });
// state was { a: 1, b: 2 }

// 1.0.0 equivalent:
const state = { a: 1 };
const next = merge(state, { b: 2 });
// state is still { a: 1 }; next is { a: 1, b: 2 }

// Or, to keep the mutation pattern explicitly:
Object.assign(state, { b: 2 });
```

Most `merge`/`deepMerge` callers already use the return value, in which case no change is needed.

## `isEqual` for Sets of objects

**0.0.3**: `isEqual(new Set([{id:1}]), new Set([{id:1}]))` returned `false` (used `Set.has`, which only works for primitive members).
**1.0.0**: returns `true` - structural comparison with order-independent matching.

This is a bug fix. If you happened to rely on the old behavior, you can't get it back with a flag - use reference identity explicitly instead:

```ts
// If you actually wanted reference-identity Set comparison:
const sameRefs = (a: Set<unknown>, b: Set<unknown>) =>
  a.size === b.size && [...a].every((v) => b.has(v));
```

## `checkVisibility` is stricter by default

**0.0.3**: checked only vertical viewport intersection.
**1.0.0**: also requires the element to be attached, not `display:none`, not `visibility:hidden`, `opacity > 0`, and intersect both viewport axes.

```ts
// 0.0.3-equivalent behavior in 1.0.0:
checkVisibility(el, {
  checkDisplay: false,
  checkVisibility: false,
  checkOpacity: false,
});

// Or use the new dedicated function:
isInViewport(el, { horizontal: false });
```

## `sleep` return type

**0.0.3**: typed as `Promise<null>` (actual runtime value was always `undefined`).
**1.0.0**: `Promise<void>`.

Runtime is unchanged. The only thing that can break is explicit type annotations:

```ts
// 0.0.3:
const p: Promise<null> = sleep(100);

// 1.0.0:
const p: Promise<void> = sleep(100);
// or just: const p = sleep(100);
```

## Removed types

`TBooleanish` and `TObjType` were removed. Replace as follows:

```ts
// TBooleanish was: boolean | 'true' | 'false'
type MyBooleanish = boolean | 'true' | 'false';

// TObjType<T>. Use TDict (string keys) or declare inline:
import type { TDict } from '@pivanov/utils/types';
type Lookup = TDict<string>;
// Or: type Lookup = { [key: string | number]: string };
```

## New APIs you might want to adopt

- **`storageClearByPrefix` / `storageClearBySuffix`** replace the boolean-flag form. The original `storageClearByPrefixOrSuffix` still works but is marked `@deprecated`.
- **`isNil` / `isDefined` / `isEmpty`** simplify common nullish/collection checks.
- **`timeout`, `retry`, `defer`, `parallelLimit`** - async utilities that didn't exist in 0.0.3.
- **`DeepPartial`, `DeepReadonly`, `Prettify`, `Mutable`** - common utility types.
- **`busOnce`** - fire-once subscription.
- **`subscribe(topic, fn, { onError })`** - custom error handling for listeners.
- **TTL support** in `cache-api` via `storageSetItemWithTTL` / `storageGetItemWithTTL`.

## If you hit an unexpected break

Please [open an issue](https://github.com/pivanov/pivanov-utils/issues). If it's not covered above, it's probably worth fixing or documenting.
