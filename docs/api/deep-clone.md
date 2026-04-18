# deepClone

High-fidelity deep clone. Import from `@pivanov/utils/tools` or `@pivanov/utils`.

```ts
import { deepClone } from '@pivanov/utils/tools';

const copy = deepClone(original);
```

## What's handled

| Type | Cloning behavior |
|---|---|
| Primitives (`string`, `number`, `bigint`, `symbol`, `boolean`) | Returned as-is |
| `null` / `undefined` | Returned as-is |
| `Array` (dense + sparse) | New array, elements recursively cloned |
| Plain object | New object, properties recursively cloned |
| Class instance | New instance, **prototype preserved**, properties recursively cloned |
| `Date` | New instance with the same time |
| `RegExp` | New instance with same source + flags |
| `Map` / `Set` | New collection, entries recursively cloned |
| `ArrayBuffer` | Byte-wise copy |
| `TypedArray` (Uint8, Int32, etc.) | New instance, new underlying buffer |
| `DataView` | New instance, new underlying buffer |
| `Buffer` (Node) | `Buffer.from(...)` copy |
| Getters / setters | Descriptors preserved as accessors |
| Symbol-keyed properties (enumerable) | Copied |
| Non-enumerable properties | Dropped |
| Circular references | Preserved via internal `WeakMap` |

## Examples

```ts
import { deepClone } from '@pivanov/utils/tools';

// Nested plain objects
const copy = deepClone({ nested: { array: [1, 2, { value: 3 }] } });

// Preserves class prototypes
class User {
  constructor(public name: string) {}
  greet() { return `hi ${this.name}`; }
}
const original = new User('Ada');
const cloned = deepClone(original);
cloned instanceof User;   // true
cloned.greet();           // 'hi Ada'

// Circular references
const obj: any = { value: 1 };
obj.self = obj;
const circ = deepClone(obj);
circ.self === circ;       // true

// Maps, Sets, Dates, TypedArrays
deepClone(new Map([['a', 1]]));
deepClone(new Set([1, 2, 3]));
deepClone(new Date());
deepClone(new Uint8Array([1, 2, 3]));
```

## Relationship to `structuredClone`

The global `structuredClone` (Node 17+, all modern browsers) covers a subset of what `deepClone` does:

| Feature | `structuredClone` | `deepClone` |
|---|---|---|
| Date, Map, Set, RegExp, TypedArrays | ✓ | ✓ |
| Circular references | ✓ | ✓ |
| Class prototypes preserved | ✗ | ✓ |
| Getters/setters preserved | ✗ (evaluated to data) | ✓ |
| Symbol-keyed properties | ✗ | ✓ |
| Node `Buffer` preserved | ✗ (becomes Uint8Array) | ✓ |
| Functions | throws | throws |

If you only need the first three rows, `structuredClone` is fine and built in. Reach for `deepClone` when the richer semantics matter.
