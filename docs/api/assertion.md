# Assertion - Type Guards

Runtime checks that narrow TypeScript types. Import from `@pivanov/utils/assertion` or `@pivanov/utils`.

## Primitive guards

### `isBoolean(value)`
Returns true if `value` is a JS boolean.

### `isNumber(value)`
Returns true if `value` is a number (including `NaN`).

### `isString(value)`
Returns true if `value` is a string.

### `isFunction(value)`
Returns true for any callable (arrow, async, generator, class constructor).

```ts
import { isBoolean, isNumber, isString, isFunction } from '@pivanov/utils/assertion';

isBoolean(true);        // true
isNumber(Number.NaN);   // true
isString('');           // true
isFunction(() => {});   // true
```

## Object guards

### `isObject(value)`
Narrow - matches **plain objects only** (literal `{}` or `Object.create(null)`). Rejects arrays, class instances, `Date`, `Map`, `Set`, etc.

### `isRecord(value)`
Loose - matches any non-null object reference, including arrays and instances.

```ts
import { isObject, isRecord } from '@pivanov/utils/assertion';

isObject({});             // true
isObject([]);             // false
isObject(new Date());     // false

isRecord({});             // true
isRecord([]);             // true
isRecord(new Date());     // true
```

## Nullish guards

### `isNull(value)` · `isUndefined(value)`
Single-value checks.

### `isNil(value)`
True for both `null` and `undefined`.

### `isDefined(value)`
True for anything except `undefined`. Particularly useful as a filter predicate - the return type narrows the array's element type:

```ts
import { isDefined } from '@pivanov/utils/assertion';

const maybe: (number | undefined)[] = [1, undefined, 2];
const clean: number[] = maybe.filter(isDefined);
```

## Built-in constructor guards

### `isArray<T>(value)`
Generic-friendly `Array.isArray`.

### `isDate(value)` · `isRegExp(value)` · `isError(value)`
`instanceof` checks with type narrowing.

### `isMap<K, V>(value)` · `isSet<T>(value)`
Generic guards for `Map` and `Set`.

### `isPromise<T>(value)`
Matches native Promises and any thenable - checks for a callable `then` property per the Promises/A+ spec.

```ts
import { isArray, isDate, isError, isPromise, isMap, isSet } from '@pivanov/utils/assertion';

isArray<string>(['a']);              // true, narrowed to string[]
isDate(new Date());                  // true
isError(new TypeError());            // true
isPromise({ then: () => {} });       // true
isMap(new Map());                    // true
isSet(new Set());                    // true
```

## Meta guards

### `isPrimitive(value)`
True for `string | number | boolean | bigint | symbol | null | undefined`.

### `isEmpty(value)`
Universal emptiness check:

| Input | Empty if |
|---|---|
| `string` | length === 0 |
| `Array` | length === 0 |
| `Map` / `Set` | size === 0 |
| plain object | no own enumerable keys |
| `null` / `undefined` | always |
| anything else | never |

```ts
import { isEmpty } from '@pivanov/utils/assertion';

isEmpty('');            // true
isEmpty([]);            // true
isEmpty({});            // true
isEmpty(new Map());     // true
isEmpty(null);          // true
isEmpty(0);             // false
```
