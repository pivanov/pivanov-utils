/**
 * Deeply compares two values for equality
 * Supports primitives, Arrays, Sets, Maps, Dates, and plain objects
 * @example
 * // Comparing arrays
 * isEqual([1, 2, 3], [1, 2, 3]); // true
 * isEqual([1, 2, 3], [1, 2, 4]); // false
 *
 * // Comparing objects
 * isEqual({ a: 1, b: 2 }, { a: 1, b: 2 }); // true
 * isEqual({ a: 1, b: 2 }, { b: 2, a: 1 }); // true
 *
 * // Comparing nested structures
 * isEqual(
 *   { users: [{ id: 1 }, { id: 2 }] },
 *   { users: [{ id: 1 }, { id: 2 }] }
 * ); // true
 *
 * // Comparing Sets
 * isEqual(new Set([1, 2]), new Set([1, 2])); // true
 *
 * // Comparing Maps
 * const map1 = new Map([['a', 1], ['b', 2]]);
 * const map2 = new Map([['a', 1], ['b', 2]]);
 * isEqual(map1, map2); // true
 *
 * // Comparing Dates
 * isEqual(new Date('2024-01-01'), new Date('2024-01-01')); // true
 */
export const isEqual = <T, K>(obj: T | T[], objToCompare: K | K[]): boolean => {
  // Handle Date objects
  if (obj instanceof Date && objToCompare instanceof Date) {
    return obj.getTime() === objToCompare.getTime();
  }

  // Handle Array objects
  if (Array.isArray(obj) && Array.isArray(objToCompare)) {
    if (obj.length !== objToCompare.length) {
      return false;
    }
    for (let i = 0; i < obj.length; i++) {
      if (!isEqual(obj[i], objToCompare[i])) {
        return false;
      }
    }

    return true;
  }

  // Handle Set objects
  if (obj instanceof Set && objToCompare instanceof Set) {
    if (obj.size !== objToCompare.size) {
      return false;
    }

    for (const item of obj) {
      if (!objToCompare.has(item)) {
        return false;
      }
    }

    return true;
  }

  // Handle Map objects
  if (obj instanceof Map && objToCompare instanceof Map) {
    if (obj.size !== objToCompare.size) {
      return false;
    }
    for (const [
      key,
      val,
    ] of obj) {
      if (!objToCompare.has(key) || !isEqual(val, objToCompare.get(key))) {
        return false;
      }
    }
    return true;
  }

  // Handle objects (excluding null, array, set, map)
  if (obj !== null && typeof obj === 'object' && !Array.isArray(obj)
    && objToCompare !== null && typeof objToCompare === 'object' && !Array.isArray(objToCompare)) {

    const objKeys = Object.keys(obj) as Array<keyof T>;
    const objToCompareKeys = Object.keys(objToCompare) as Array<keyof K>;

    if (objKeys.length !== objToCompareKeys.length) {
      return false;
    }

    for (const key of objKeys) {
      if (!isEqual(obj[key], objToCompare[key as unknown as keyof K])) {
        return false;
      }
    }

    return true;
  }

  // Handle primitives (string, number, boolean, undefined, symbol)
  return obj === objToCompare;
};
