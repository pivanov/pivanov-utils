# isEqual

Deep structural equality. Import from `@pivanov/utils/tools` or `@pivanov/utils`.

```ts
import { isEqual } from '@pivanov/utils/tools';

isEqual(a, b); // boolean
```

## What's compared

| Type | Comparison |
|---|---|
| Primitives | `Object.is` (so `NaN === NaN` is true) |
| `Date` | Same timestamp |
| `RegExp` | Same `source` and `flags` |
| `Error` | Same `name` and `message` |
| `Array` | Same length and each element deep-equal |
| `Set` | Same size and every element has a deep-equal match (order-independent, O(n²) worst case for non-primitives) |
| `Map` | Same size and every key matches a deep-equal value |
| `ArrayBuffer` / `TypedArray` / `DataView` | Byte-wise equal and same constructor |
| Plain objects | Same own enumerable string keys and each deep-equal |
| Circular references | Tracked via `WeakMap` - no infinite recursion |

## Examples

```ts
import { isEqual } from '@pivanov/utils/tools';

// Key order doesn't matter
isEqual({ a: 1, b: 2 }, { b: 2, a: 1 });      // true

// Deep arrays
isEqual([1, [2, 3]], [1, [2, 3]]);            // true

// Sets with objects - order-independent, deep
isEqual(
  new Set([{ id: 1 }, { id: 2 }]),
  new Set([{ id: 2 }, { id: 1 }])
); // true

// Maps
isEqual(new Map([['a', 1]]), new Map([['a', 1]])); // true

// RegExp
isEqual(/foo/gi, /foo/gi); // true
isEqual(/foo/g,  /foo/i);  // false

// Errors
isEqual(new Error('x'), new Error('x'));     // true
isEqual(new TypeError('x'), new Error('x')); // false (different constructors)

// TypedArrays
isEqual(new Uint8Array([1, 2]), new Uint8Array([1, 2])); // true

// NaN is equal to itself
isEqual(Number.NaN, Number.NaN); // true

// Circular
const a: any = {};
a.self = a;
const b: any = {};
b.self = b;
isEqual(a, b); // true - no infinite loop
```

## Known limitations

- **Symbol-keyed properties are not compared.** Aligns with `JSON.stringify` and most deep-equal libraries.
- **Prototype identity is not checked** for plain-object comparisons. Two instances of different classes with identical enumerable string keys compare equal.
- **Sets of non-primitive values are O(n²).** For large sets of complex objects, consider a Map keyed by a stable hash.
