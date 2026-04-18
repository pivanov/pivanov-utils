# Types

Utility types for everyday TypeScript work. Import from `@pivanov/utils/types` or `@pivanov/utils`.

## `TDict<T = unknown>`

Dictionary with string keys and values of type `T`.

```ts
import type { TDict } from '@pivanov/utils/types';

const scores: TDict<number> = { math: 95, science: 87 };
```

## `TObjType<T = unknown>`

Object with string or number keys. Useful when indexing by either kind of key.

```ts
import type { TObjType } from '@pivanov/utils/types';

const lookup: TObjType<string> = { 1: 'one', two: '2' };
```

## `DeepPartial<T>`

Recursively applies `Partial` to every nested object property. Primitives and arrays pass through unchanged.

```ts
import type { DeepPartial } from '@pivanov/utils/types';

type Config = {
  flags: {
    debug: boolean;
    verbose: boolean;
  };
  name: string;
};

const override: DeepPartial<Config> = {
  flags: {
    debug: true,
  },
};
```

## `DeepReadonly<T>`

Recursively applies `Readonly`. Useful for locking down config shapes.

```ts
import type { DeepReadonly } from '@pivanov/utils/types';

type Theme = {
  theme: {
    color: string;
  };
};

type Settings = DeepReadonly<Theme>;
// {
//   readonly theme: {
//     readonly color: string;
//   };
// }
```

## `Mutable<T>`

Removes `readonly` modifiers from every top-level property. Handy for stripping `as const` tuples.

```ts
import type { Mutable } from '@pivanov/utils/types';

const tuple = [1, 2, 3] as const;
type T = Mutable<typeof tuple>; // readonly number[] → number[]
```

## `Prettify<T>`

Pure type-level helper that flattens an intersection or mapped type into a single literal. No runtime impact, just nicer tooltips.

```ts
import type { Prettify } from '@pivanov/utils/types';

type A = {
  a: number;
};

type B = {
  b: string;
};

type Ugly = A & B;            // displayed as A & B
type Pretty = Prettify<A & B>; // displayed as { a: number; b: string }
```
