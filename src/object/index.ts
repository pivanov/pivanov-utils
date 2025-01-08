import { isObject } from '../assertion';
import type { TDict } from '../types';

/**
 * Creates a new object with the specified keys removed.
 *
 * @param object - The source object
 * @param keys - Array of keys to remove from the object
 * @returns A new object without the specified keys
 *
 * @example
 * ```ts
 * const user = { name: 'John', age: 30, email: 'john@example.com' };
 *
 * omit(user, ['email', 'age'])
 * // { name: 'John' }
 *
 * // Preserves original object
 * omit(user, ['email'])
 * // { name: 'John', age: 30 }
 * // user is unchanged
 *
 * // Handles non-existent keys
 * omit(user, ['nonexistent'])
 * // { name: 'John', age: 30, email: 'john@example.com' }
 * ```
 *
 * @bestPractice
 * - Use when you need to create a new object without certain properties
 * - Prefer this over manually deleting properties when immutability is needed
 * - Consider using TypeScript's Omit utility type with this function
 * - For picking specific properties, use the pick function instead
 */
export const omit = <T extends TDict, K extends keyof T>(
  object: T,
  keys: K[],
) => {
  return keys.reduce(
    (acc, key) => {
      delete acc[key];
      return acc;
    },
    { ...object },
  ) as Omit<T, K>;
};

/**
 * Creates a new object with only the specified keys.
 *
 * @param object - The source object
 * @param keys - Array of keys to keep in the new object
 * @returns A new object containing only the specified keys
 *
 * @example
 * ```ts
 * const user = { name: 'John', age: 30, email: 'john@example.com' };
 *
 * pick(user, ['name', 'email'])
 * // { name: 'John', email: 'john@example.com' }
 *
 * // Handles missing keys
 * pick(user, ['name', 'nonexistent'])
 * // { name: 'John' }
 *
 * // Empty keys array
 * pick(user, [])
 * // {}
 * ```
 *
 * @bestPractice
 * - Use when you need to create a new object with only specific properties
 * - Useful for API responses where you only want to expose certain fields
 * - Consider using TypeScript's Pick utility type with this function
 * - For removing specific properties, use the omit function instead
 */
export const pick = <T extends TDict, K extends keyof T>(
  object: T,
  keys: K[],
) => {
  const result = {} as { [P in K]: T[P] };

  for (const key of keys) {
    if (key in object) {
      result[key] = object[key];
    }
  }

  return result;
};

/**
 * Merges multiple objects into a target object.
 * Performs a shallow merge.
 *
 * @param target - The target object to merge into
 * @param sources - The source objects to merge from
 * @returns The merged object (same reference as target)
 *
 * @example
 * ```ts
 * // Basic merge
 * merge({ a: 1 }, { b: 2 })
 * // { a: 1, b: 2 }
 *
 * // Multiple sources
 * merge({ a: 1 }, { b: 2 }, { c: 3 })
 * // { a: 1, b: 2, c: 3 }
 *
 * // Property override
 * merge({ a: 1, b: 1 }, { b: 2 }, { b: 3 })
 * // { a: 1, b: 3 }
 *
 * // Shallow merge (nested objects are referenced)
 * const obj = { nested: { a: 1 } };
 * merge({ x: 1 }, obj).nested === obj.nested
 * // true
 * ```
 *
 * @bestPractice
 * - Use for simple object merging where nested objects don't need to be cloned
 * - Be aware that nested objects are shared by reference
 * - For deep merging, use the deepMerge function instead
 * - Consider using the spread operator (...) for simpler cases
 */
export const merge = <T extends object>(
  target: T,
  ...sources: Partial<T>[]
): T => {
  return Object.assign(target, ...sources);
};

/**
 * Deep merges multiple objects into a target object.
 * Recursively merges nested objects and arrays.
 *
 * @param target - The target object to merge into
 * @param sources - The source objects to merge from
 * @returns The deep merged object (same reference as target)
 *
 * @example
 * ```ts
 * // Deep merge nested objects
 * deepMerge(
 *   { a: { b: 1, c: 2 } },
 *   { a: { d: 3 } },
 *   { a: { e: 4 } }
 * )
 * // { a: { b: 1, c: 2, d: 3, e: 4 } }
 *
 * // Handles nested property override
 * deepMerge(
 *   { a: { b: 1 } },
 *   { a: { b: 2 } }
 * )
 * // { a: { b: 2 } }
 *
 * // Mixed nested and top-level properties
 * deepMerge(
 *   { a: 1, b: { c: 2 } },
 *   { b: { d: 3 }, e: 4 }
 * )
 * // { a: 1, b: { c: 2, d: 3 }, e: 4 }
 *
 * // Handles undefined sources
 * deepMerge({ a: 1 }, undefined)
 * // { a: 1 }
 * ```
 *
 * @bestPractice
 * - Use when you need to merge objects with nested structures
 * - Be aware that this creates new objects for nested properties
 * - For simple flat objects, use the merge function instead
 * - Consider performance implications for deeply nested objects
 * - Handle circular references if they might occur in your data
 */
export const deepMerge = <T extends object>(
  target: T,
  ...sources: Partial<T>[]
): T => {
  if (!sources.length) return target;
  const source = sources.shift();
  if (source === undefined) return target;

  if (isObject(target) && isObject(source)) {
    for (const key of Object.keys(source)) {
      const sourceValue = source[key as keyof T];
      if (isObject(sourceValue)) {
        if (!target[key as keyof T]) {
          Object.assign(target, { [key]: {} });
        }
        const targetValue = target[key as keyof T];
        if (isObject(targetValue)) {
          deepMerge(targetValue as object, sourceValue as object);
        }
      } else {
        Object.assign(target, { [key]: sourceValue });
      }
    }
  }

  return deepMerge(target, ...sources);
};
