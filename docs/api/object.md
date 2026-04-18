# Object

Immutable helpers for reshaping objects. Import from `@pivanov/utils/object` or `@pivanov/utils`.

All functions return new objects and leave inputs untouched.

## Picking & omitting

### `pick(object, keys)`
Returns a new object containing only the given keys.

### `omit(object, keys)`
Returns a new object with the given keys removed.

```ts
import { pick, omit } from '@pivanov/utils/object';

const user = { name: 'John', age: 30, email: 'john@example.com' };

pick(user, ['name', 'email']);
// { name: 'John', email: 'john@example.com' }

omit(user, ['email']);
// { name: 'John', age: 30 }
```

### `pickBy(object, predicate)` · `omitBy(object, predicate)`
Predicate-based picking/omitting. The predicate receives `(value, key)`.

```ts
import { pickBy, omitBy } from '@pivanov/utils/object';

pickBy({ a: 1, b: 2, c: 3 }, (v) => v > 1);    // { b: 2, c: 3 }
omitBy({ a: 1, b: null, c: 3 }, (v) => v === null); // { a: 1, c: 3 }
```

## Transforming

### `mapValues(object, mapper)` · `mapKeys(object, mapper)`
Transform values or keys while keeping the other side fixed.

```ts
import { mapValues, mapKeys } from '@pivanov/utils/object';

mapValues({ a: 1, b: 2 }, (v) => v * 2);
// { a: 2, b: 4 }

mapKeys({ a: 1, b: 2 }, (_, k) => k.toUpperCase());
// { A: 1, B: 2 }
```

### `groupBy(items, iteratee)`
Groups an array into an object keyed by the iteratee's return value.

```ts
import { groupBy } from '@pivanov/utils/object';

groupBy(['apple', 'avocado', 'banana'], (s) => s[0]);
// { a: ['apple', 'avocado'], b: ['banana'] }
```

### `invert(object)`
Swaps keys and values. Values must be valid object keys (`string | number | symbol`).

```ts
import { invert } from '@pivanov/utils/object';

invert({ a: 'x', b: 'y' });
// { x: 'a', y: 'b' }
```

## Merging

### `merge(target, ...sources)`
Shallow merge into a new object. Later sources win. Does not mutate inputs.

### `deepMerge(target, ...sources)`
Deep merge. Nested plain objects merge recursively; arrays and non-plain values replace. Does not mutate inputs.

```ts
import { merge, deepMerge } from '@pivanov/utils/object';

merge({ a: 1 }, { b: 2 }, { c: 3 });
// { a: 1, b: 2, c: 3 }

deepMerge(
  { user: { name: 'John', prefs: { theme: 'dark' } } },
  { user: { prefs: { fontSize: 14 } } }
);
// { user: { name: 'John', prefs: { theme: 'dark', fontSize: 14 } } }
```

::: tip
To get immutable behavior with an existing object, pass an empty target: `merge({}, a, b)`.
:::

## Typed iteration helpers

### `keysOf(object)` · `entriesOf(object)` · `fromEntries(entries)`
Typed counterparts to `Object.keys`, `Object.entries`, and `Object.fromEntries`. Returns exact key types instead of `string`.

```ts
import { keysOf, entriesOf, fromEntries } from '@pivanov/utils/object';

const user = { name: 'John', age: 30 };
const keys = keysOf(user);       // ('name' | 'age')[]
const entries = entriesOf(user); // ['name' | 'age', string | number][]
const rebuilt = fromEntries(entries);
```

::: warning Runtime vs compile-time
These helpers type the output from the compile-time type only. If the object has extra runtime keys, they'll be present at runtime but missing from the type.
:::

### `hasOwn(object, key)`
Typed `Object.hasOwn` that narrows the key into the object's own keys.

```ts
import { hasOwn } from '@pivanov/utils/object';

function processUser(user: { name?: string }) {
  if (hasOwn(user, 'name')) {
    user.name.toUpperCase(); // narrowed
  }
}
```
