/**
 * Type guard for `boolean`.
 *
 * @example
 * ```ts
 * isBoolean(true); // true
 * isBoolean('true'); // false
 * ```
 */
export const isBoolean = (value: unknown): value is boolean => {
  return typeof value === "boolean";
};

/**
 * Type guard for `number` (including `NaN`).
 *
 * @example
 * ```ts
 * isNumber(42); // true
 * isNumber('42'); // false
 * ```
 */
export const isNumber = (value: unknown): value is number => {
  return typeof value === "number";
};

/**
 * Type guard for `string`.
 *
 * @example
 * ```ts
 * isString('hello'); // true
 * ```
 */
export const isString = (value: unknown): value is string => {
  return typeof value === "string";
};

/**
 * Type guard for `function` (any callable).
 *
 * @example
 * ```ts
 * isFunction(() => {}); // true
 * ```
 */
export const isFunction = (value: unknown): value is CallableFunction => {
  return typeof value === "function";
};

/**
 * Type guard for plain objects (literal `{}` or `Object.create(null)`).
 * Rejects arrays, Dates, Maps, Sets, class instances, etc.
 *
 * @example
 * ```ts
 * isObject({}); // true
 * isObject([]); // false
 * isObject(new Date()); // false
 * ```
 */
export const isObject = (value: unknown): value is Record<string, unknown> => {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
};

/**
 * Type guard for any non-null object (loose - accepts arrays, instances, etc.).
 * Use this when you only need "is it an object reference?".
 *
 * @example
 * ```ts
 * isRecord([]); // true
 * isRecord({}); // true
 * isRecord(new Date()); // true
 * isRecord(null); // false
 * ```
 */
export const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

/**
 * Type guard for `undefined`.
 */
export const isUndefined = (value: unknown): value is undefined => {
  return value === undefined;
};

/**
 * Type guard for `null`.
 */
export const isNull = (value: unknown): value is null => {
  return value === null;
};

/**
 * Type guard for `null` or `undefined`.
 *
 * @example
 * ```ts
 * isNil(null); // true
 * isNil(undefined); // true
 * isNil(0); // false
 * ```
 */
export const isNil = (value: unknown): value is null | undefined => {
  return value === null || value === undefined;
};

/**
 * Type guard: value is not `undefined`. Useful as a filter predicate.
 *
 * @example
 * ```ts
 * [1, undefined, 2].filter(isDefined); // [1, 2] typed as number[]
 * ```
 */
export const isDefined = <T>(value: T | undefined): value is T => {
  return value !== undefined;
};

/**
 * Type guard for arrays. Thin wrapper over `Array.isArray` with a
 * generic-friendly signature.
 */
export const isArray = <T = unknown>(value: unknown): value is T[] => {
  return Array.isArray(value);
};

/**
 * Type guard for `Date` instances.
 */
export const isDate = (value: unknown): value is Date => {
  return value instanceof Date;
};

/**
 * Type guard for `RegExp`.
 */
export const isRegExp = (value: unknown): value is RegExp => {
  return value instanceof RegExp;
};

/**
 * Type guard for `Error` (and subclasses).
 */
export const isError = (value: unknown): value is Error => {
  return value instanceof Error;
};

/**
 * Type guard for thenable / Promise-like values. Checks for a callable
 * `then` property - aligns with the Promises/A+ spec.
 */
export const isPromise = <T = unknown>(value: unknown): value is Promise<T> => {
  return value !== null && (typeof value === "object" || typeof value === "function") && typeof (value as { then?: unknown }).then === "function";
};

/**
 * Type guard for `Map`.
 */
export const isMap = <K = unknown, V = unknown>(value: unknown): value is Map<K, V> => {
  return value instanceof Map;
};

/**
 * Type guard for `Set`.
 */
export const isSet = <T = unknown>(value: unknown): value is Set<T> => {
  return value instanceof Set;
};

/**
 * Type guard for JS primitives (string, number, boolean, bigint, symbol,
 * null, undefined).
 */
export const isPrimitive = (value: unknown): value is string | number | boolean | bigint | symbol | null | undefined => {
  if (value === null || value === undefined) {
    return true;
  }
  const t = typeof value;
  return t === "string" || t === "number" || t === "boolean" || t === "bigint" || t === "symbol";
};

/**
 * Checks whether a collection or string is empty.
 *
 * - String: length === 0
 * - Array: length === 0
 * - Map/Set: size === 0
 * - Plain object: no own enumerable string keys
 * - null / undefined: true
 *
 * @example
 * ```ts
 * isEmpty([]); // true
 * isEmpty({}); // true
 * isEmpty(''); // true
 * isEmpty(new Map()); // true
 * isEmpty([1]); // false
 * ```
 */
export const isEmpty = (value: unknown): boolean => {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value === "string" || Array.isArray(value)) {
    return value.length === 0;
  }
  if (value instanceof Map || value instanceof Set) {
    return value.size === 0;
  }
  if (typeof value === "object") {
    return Object.keys(value as object).length === 0;
  }
  return false;
};
