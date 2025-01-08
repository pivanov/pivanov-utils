/**
 * Type guard to check if a value is a boolean
 * @param value - The value to check
 * @returns True if the value is a boolean, false otherwise
 * @example
 * ```ts
 * isBoolean(true) // true
 * isBoolean(false) // true
 * isBoolean(0) // false
 * isBoolean('true') // false
 * ```
 */
export const isBoolean = (value: unknown): value is boolean => {
  return typeof value === 'boolean';
};

/**
 * Type guard to check if a value is a number
 * @param value - The value to check
 * @returns True if the value is a number, false otherwise
 * @example
 * ```ts
 * isNumber(42) // true
 * isNumber(3.14) // true
 * isNumber(NaN) // true
 * isNumber('42') // false
 * isNumber(null) // false
 * ```
 */
export const isNumber = (value: unknown): value is number => {
  return typeof value === 'number';
};

/**
 * Type guard to check if a value is a string
 * @param value - The value to check
 * @returns True if the value is a string, false otherwise
 * @example
 * ```ts
 * isString('hello') // true
 * isString('') // true
 * isString(42) // false
 * isString(null) // false
 * ```
 */
export const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};

/**
 * Type guard to check if a value is a function
 * @param value - The value to check
 * @returns True if the value is a callable function, false otherwise
 * @example
 * ```ts
 * isFunction(() => {}) // true
 * isFunction(function(){}) // true
 * isFunction(Math.max) // true
 * isFunction({}) // false
 * isFunction(null) // false
 * ```
 */
export const isFunction = (value: unknown): value is CallableFunction => {
  return typeof value === 'function';
};

/**
 * Type guard to check if a value is a plain object
 * @param value - The value to check
 * @returns True if the value is a non-null object and not an array, false otherwise
 * @example
 * ```ts
 * isObject({}) // true
 * isObject({ foo: 'bar' }) // true
 * isObject([]) // false
 * isObject(null) // false
 * isObject(42) // false
 * isObject('string') // false
 * ```
 */
export const isObject = (value: unknown): value is Record<string, unknown> => {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
};

/**
 * Type guard to check if a value is undefined
 * @param value - The value to check
 * @returns True if the value is undefined, false otherwise
 * @example
 * ```ts
 * isUndefined(undefined) // true
 * isUndefined(null) // false
 * isUndefined(0) // false
 * ```
 */
export const isUndefined = (value: unknown): value is undefined => {
  return value === undefined;
};

/**
 * Type guard to check if a value is null
 * @param value - The value to check
 * @returns True if the value is null, false otherwise
 * @example
 * ```ts
 * isNull(null) // true
 * isNull(undefined) // false
 * isNull(0) // false
 * ```
 */
export const isNull = (value: unknown): value is null => {
  return value === null;
};
