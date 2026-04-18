/**
 * Deeply compares two values for structural equality.
 *
 * Supports: primitives (with NaN-equals-NaN), Arrays, Sets, Maps, Dates,
 * RegExp (source + flags), Errors (name + message), TypedArrays,
 * ArrayBuffer/DataView (byte-wise), and plain objects. Handles circular
 * references via cycle tracking.
 *
 * Sets with non-primitive members use order-independent deep comparison
 * (O(n²) worst case).
 *
 * @example
 * ```ts
 * isEqual({ a: 1, b: 2 }, { b: 2, a: 1 }); // true
 * isEqual([1, 2, 3], [1, 2, 3]); // true
 * isEqual(new Set([{ id: 1 }]), new Set([{ id: 1 }])); // true
 * isEqual(/foo/gi, /foo/gi); // true
 * isEqual(new Uint8Array([1, 2]), new Uint8Array([1, 2])); // true
 * ```
 */
export const isEqual = <T, K>(obj: T | T[], objToCompare: K | K[]): boolean => {
  return internalIsEqual(obj, objToCompare, new WeakMap());
};

const internalIsEqual = (a: unknown, b: unknown, seen: WeakMap<object, WeakSet<object>>): boolean => {
  if (Object.is(a, b)) {
    return true;
  }

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  if (a instanceof RegExp && b instanceof RegExp) {
    return a.source === b.source && a.flags === b.flags;
  }

  if (a instanceof Error && b instanceof Error) {
    return a.name === b.name && a.message === b.message;
  }

  if (a instanceof ArrayBuffer && b instanceof ArrayBuffer) {
    if (a.byteLength !== b.byteLength) {
      return false;
    }
    return compareByteViews(new Uint8Array(a), new Uint8Array(b));
  }

  if (ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
    if (a.constructor !== b.constructor) {
      return false;
    }
    if (a.byteLength !== b.byteLength) {
      return false;
    }
    const aBytes = new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
    const bBytes = new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
    return compareByteViews(aBytes, bBytes);
  }

  if (typeof a === "object" && a !== null && typeof b === "object" && b !== null) {
    const visited = seen.get(a);
    if (visited?.has(b)) {
      return true;
    }
    if (visited) {
      visited.add(b);
    } else {
      seen.set(a, new WeakSet([b]));
    }
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (!internalIsEqual(a[i], b[i], seen)) {
        return false;
      }
    }
    return true;
  }

  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size) {
      return false;
    }
    const remaining = Array.from(b);
    for (const item of a) {
      const idx = remaining.findIndex((candidate) => internalIsEqual(item, candidate, seen));
      if (idx === -1) {
        return false;
      }
      remaining.splice(idx, 1);
    }
    return true;
  }

  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) {
      return false;
    }
    for (const [key, val] of a) {
      if (!b.has(key) || !internalIsEqual(val, b.get(key), seen)) {
        return false;
      }
    }
    return true;
  }

  if (a !== null && typeof a === "object" && b !== null && typeof b === "object") {
    const left = a as Record<string, unknown>;
    const right = b as Record<string, unknown>;
    const keys = Object.keys(left);
    if (keys.length !== Object.keys(right).length) {
      return false;
    }
    for (const key of keys) {
      if (!internalIsEqual(left[key], right[key], seen)) {
        return false;
      }
    }
    return true;
  }

  return false;
};

const compareByteViews = (a: Uint8Array, b: Uint8Array): boolean => {
  // Callers pre-check byteLength, so a.length === b.length is guaranteed.
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
};
