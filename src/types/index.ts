/**
 * A dictionary with string keys and values of type T.
 */
export type TDict<T = unknown> = Record<string, T>;

/**
 * Object with string or number keys and values of type T.
 */
export type TObjType<T = unknown> = { [key: string | number]: T };

/**
 * Recursively applies `Partial` to every nested object property. Primitives
 * and arrays pass through unchanged.
 *
 * @example
 * ```ts
 * type A = DeepPartial<{ a: { b: { c: number } } }>;
 * // { a?: { b?: { c?: number } } }
 * ```
 */
export type DeepPartial<T> = T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;

/**
 * Recursively applies `Readonly` to every nested object property.
 *
 * @example
 * ```ts
 * type Config = DeepReadonly<{ flags: { debug: boolean } }>;
 * // { readonly flags: { readonly debug: boolean } }
 * ```
 */
export type DeepReadonly<T> = T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> } : T;

/**
 * Removes `readonly` modifiers from every property (top level only).
 *
 * @example
 * ```ts
 * const tuple = [1, 2, 3] as const;
 * type T = Mutable<typeof tuple>; // number[]
 * ```
 */
export type Mutable<T> = { -readonly [K in keyof T]: T[K] };

/**
 * Flattens an intersection or mapped type into a single object literal so it
 * shows up clean in IDE tooltips. Pure type-level; no runtime impact.
 *
 * @example
 * ```ts
 * type A = { a: number };
 * type B = { b: string };
 * type C = Prettify<A & B>; // { a: number; b: string }
 * ```
 */
export type Prettify<T> = { [K in keyof T]: T[K] } & {};
