/**
 * Represents a boolean value that can be either a boolean or the string 'true' or 'false'
 * @example
 * const isEnabled: TBooleanish = 'true';
 * const isDisabled: TBooleanish = false;
 */
export type TBooleanish = boolean | 'true' | 'false';

/**
 * A dictionary type with string keys and values of type T
 * @example
 * const users: TDict<string> = {
 *   user1: 'John',
 *   user2: 'Jane'
 * };
 *
 * const scores: TDict<number> = {
 *   math: 95,
 *   science: 87
 * };
 */
export type TDict<T = unknown> = Record<string, T>;

/**
 * Type for objects with string or number keys and values of type T
 * @example
 * const numberDict: TObjType<number> = {
 *   age: 25,
 *   score: 100,
 *   1: 50
 * };
 *
 * const mixedDict: TObjType = {
 *   name: 'John',
 *   1: true,
 *   score: 42
 * };
 */
export type TObjType<T = unknown> = { [key: string | number]: T };
