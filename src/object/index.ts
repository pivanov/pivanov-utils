import { isObject } from "../assertion";
import type { TDict } from "../types";

/**
 * Creates a new object with the specified keys removed.
 *
 * @example
 * ```ts
 * omit({ name: 'John', age: 30 }, ['age']); // { name: 'John' }
 * ```
 */
export const omit = <T extends TDict, K extends keyof T>(object: T, keys: K[]): Omit<T, K> => {
  const result = { ...object };
  for (const key of keys) {
    delete result[key];
  }
  return result as Omit<T, K>;
};

/**
 * Creates a new object with only the specified keys.
 *
 * @example
 * ```ts
 * pick({ name: 'John', age: 30 }, ['name']); // { name: 'John' }
 * ```
 */
export const pick = <T extends TDict, K extends keyof T>(object: T, keys: K[]): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in object) {
      result[key] = object[key];
    }
  }
  return result;
};

/**
 * Returns a new object keeping entries where the predicate returns true.
 *
 * @example
 * ```ts
 * pickBy({ a: 1, b: 2, c: 3 }, (v) => v > 1); // { b: 2, c: 3 }
 * ```
 */
export const pickBy = <T extends TDict>(object: T, predicate: (value: T[keyof T], key: keyof T) => boolean): Partial<T> => {
  const result: Partial<T> = {};
  for (const key of Object.keys(object) as (keyof T)[]) {
    if (predicate(object[key], key)) {
      result[key] = object[key];
    }
  }
  return result;
};

/**
 * Returns a new object dropping entries where the predicate returns true.
 *
 * @example
 * ```ts
 * omitBy({ a: 1, b: null, c: 3 }, (v) => v === null); // { a: 1, c: 3 }
 * ```
 */
export const omitBy = <T extends TDict>(object: T, predicate: (value: T[keyof T], key: keyof T) => boolean): Partial<T> => {
  return pickBy(object, (value, key) => !predicate(value, key));
};

/**
 * Returns a new object with values mapped via the transform function.
 *
 * @example
 * ```ts
 * mapValues({ a: 1, b: 2 }, (v) => v * 2); // { a: 2, b: 4 }
 * ```
 */
export const mapValues = <T extends TDict, R>(object: T, mapper: (value: T[keyof T], key: keyof T) => R): Record<keyof T, R> => {
  const result = {} as Record<keyof T, R>;
  for (const key of Object.keys(object) as (keyof T)[]) {
    result[key] = mapper(object[key], key);
  }
  return result;
};

/**
 * Returns a new object with keys mapped via the transform function.
 *
 * @example
 * ```ts
 * mapKeys({ a: 1, b: 2 }, (_, k) => k.toUpperCase()); // { A: 1, B: 2 }
 * ```
 */
export const mapKeys = <T extends TDict>(object: T, mapper: (value: T[keyof T], key: keyof T) => string): Record<string, T[keyof T]> => {
  const result: Record<string, T[keyof T]> = {};
  for (const key of Object.keys(object) as (keyof T)[]) {
    result[mapper(object[key], key)] = object[key];
  }
  return result;
};

/**
 * Groups items by the key returned by the iteratee.
 *
 * @example
 * ```ts
 * groupBy(['apple', 'banana', 'cherry'], (s) => s[0]);
 * // { a: ['apple'], b: ['banana'], c: ['cherry'] }
 * ```
 */
export const groupBy = <T, K extends string | number>(items: readonly T[], iteratee: (item: T, index: number) => K): Record<K, T[]> => {
  const result = {} as Record<K, T[]>;
  items.forEach((item, index) => {
    const key = iteratee(item, index);
    if (result[key]) {
      result[key].push(item);
    } else {
      result[key] = [item];
    }
  });
  return result;
};

/**
 * Swaps keys with values. Values must be valid object keys.
 *
 * @example
 * ```ts
 * invert({ a: 'x', b: 'y' }); // { x: 'a', y: 'b' }
 * ```
 */
export const invert = <K extends string, V extends string | number | symbol>(object: Record<K, V>): Record<V, K> => {
  const result = {} as Record<V, K>;
  for (const key of Object.keys(object) as K[]) {
    result[object[key]] = key;
  }
  return result;
};

/**
 * Typed `Object.hasOwn`. Narrows the key into the object's own keys.
 *
 * @example
 * ```ts
 * if (hasOwn(obj, 'name')) obj.name; // narrowed
 * ```
 */
export const hasOwn = <T extends object, K extends PropertyKey>(object: T, key: K): object is T & Record<K, unknown> => {
  return Object.hasOwn(object, key);
};

/**
 * Typed `Object.keys`. Returns `(keyof T)[]` instead of `string[]`.
 *
 * Note: like `Object.keys`, the runtime keys are just the own enumerable
 * string keys, so this typing can be unsound if the object has extra runtime
 * properties not in its compile-time type.
 */
export const keysOf = <T extends object>(object: T): (keyof T)[] => {
  return Object.keys(object) as (keyof T)[];
};

/**
 * Typed `Object.entries`. Returns `[keyof T, T[keyof T]][]`.
 */
export const entriesOf = <T extends object>(object: T): [keyof T, T[keyof T]][] => {
  return Object.entries(object) as [keyof T, T[keyof T]][];
};

/**
 * Typed `Object.fromEntries` for tuple arrays with literal key types.
 */
export const fromEntries = <K extends PropertyKey, V>(entries: readonly (readonly [K, V])[]): Record<K, V> => {
  return Object.fromEntries(entries) as Record<K, V>;
};

/**
 * Shallow-merges multiple objects into a new object. Does not mutate inputs.
 *
 * @example
 * ```ts
 * merge({ a: 1 }, { b: 2 }, { c: 3 }); // { a: 1, b: 2, c: 3 }
 * ```
 */
export const merge = <T extends object>(target: T, ...sources: Partial<T>[]): T => {
  return Object.assign({}, target, ...sources);
};

/**
 * Recursively merges multiple objects into a new object. Does not mutate
 * inputs. Nested plain objects are merged; arrays and other values replace.
 *
 * @example
 * ```ts
 * deepMerge({ a: { b: 1 } }, { a: { c: 2 } }); // { a: { b: 1, c: 2 } }
 * ```
 */
export const deepMerge = <T extends object>(target: T, ...sources: Partial<T>[]): T => {
  const result: Record<string, unknown> = { ...(target as object) };

  for (const source of sources) {
    if (source === undefined) {
      continue;
    }
    for (const key of Object.keys(source)) {
      const sourceValue = (source as Record<string, unknown>)[key];
      const targetValue = result[key];

      if (isObject(sourceValue)) {
        result[key] = deepMerge(isObject(targetValue) ? targetValue : {}, sourceValue);
      } else {
        result[key] = sourceValue;
      }
    }
  }

  return result as T;
};
