export type TCloneable = object | number | string | boolean | symbol | bigint | null | undefined;

type Constructor<T> = new (...args: unknown[]) => T;

export const deepClone = <T extends TCloneable>(obj: T): T => {
  return internalDeepClone(obj, new WeakMap());
};

const internalDeepClone = <T extends TCloneable>(
  obj: T,
  seen: WeakMap<object, unknown>,
): T => {
  if (obj === null || typeof obj !== 'object') {
    // Fast path for primitives and null
    return obj;
  }

  // Early circular check
  const seenVal = seen.get(obj);
  if (seenVal) return seenVal as T;

  // Ultra-fast array path
  if (Array.isArray(obj)) {
    const len = obj.length;
    // Skip sparse array check for small arrays
    if (len < 32) {
      const arr = new Array(len);
      seen.set(obj, arr);
      for (let i = 0; i < len; i++) {
        if (i in obj) arr[i] = internalDeepClone(obj[i] as TCloneable, seen);
      }
      return arr as unknown as T;
    }

    // For larger arrays, check if dense
    const arr = new Array(len);
    seen.set(obj, arr);

    if (Object.keys(obj).length === len) {
      // Dense array fast path with manual unrolling
      let i = 0;
      const remainder = len % 8;
      const limit = len - remainder;

      // Process 8 elements at a time
      while (i < limit) {
        arr[i] = internalDeepClone(obj[i] as TCloneable, seen);
        arr[i + 1] = internalDeepClone(obj[i + 1] as TCloneable, seen);
        arr[i + 2] = internalDeepClone(obj[i + 2] as TCloneable, seen);
        arr[i + 3] = internalDeepClone(obj[i + 3] as TCloneable, seen);
        arr[i + 4] = internalDeepClone(obj[i + 4] as TCloneable, seen);
        arr[i + 5] = internalDeepClone(obj[i + 5] as TCloneable, seen);
        arr[i + 6] = internalDeepClone(obj[i + 6] as TCloneable, seen);
        arr[i + 7] = internalDeepClone(obj[i + 7] as TCloneable, seen);
        i += 8;
      }

      // Handle remaining elements
      while (i < len) {
        arr[i] = internalDeepClone(obj[i] as TCloneable, seen);
        i++;
      }
    } else {
      // Sparse array path
      for (let i = 0; i < len; i++) {
        if (i in obj) arr[i] = internalDeepClone(obj[i] as TCloneable, seen);
      }
    }
    return arr as unknown as T;
  }

  // Fast built-in type handling
  if (obj instanceof Date || obj instanceof RegExp) {
    const Ctor = obj.constructor as Constructor<Date | RegExp>;
    return new Ctor(obj) as T;
  }

  interface BufferLike {
    buffer: ArrayBuffer;
    byteLength: number;
    byteOffset?: number;
    length?: number;
    BYTES_PER_ELEMENT?: number;
  }

  // Handle Buffer and TypedArray
  if (typeof Buffer !== 'undefined') {
    try {
      if (Buffer.isBuffer(obj)) {
        return Buffer.from(obj) as unknown as T;
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      // If Buffer.isBuffer throws a non-Error, continue with regular cloning
    }
  }

  // Handle TypedArrays and DataView
  if (ArrayBuffer.isView(obj)) {
    const TypedArray = obj.constructor as Constructor<ArrayBufferView>;
    if ('buffer' in obj) {
      const view = obj as {
        buffer: ArrayBuffer;
        byteOffset: number;
        byteLength: number;
      };
      const newBuffer = view.buffer.slice(
        view.byteOffset,
        view.byteOffset + view.byteLength,
      );
      return new TypedArray(newBuffer) as unknown as T;
    }
    const dataView = obj as DataView;
    return new TypedArray(new ArrayBuffer(dataView.byteLength)) as unknown as T;
  }

  if (obj instanceof ArrayBuffer) {
    return obj.slice(0) as unknown as T;
  }

  // Handle Buffer-like objects
  if (
    obj &&
    typeof obj === 'object' &&
    'buffer' in obj &&
    'byteLength' in obj
  ) {
    const bufferLike = obj as BufferLike;
    if (typeof Buffer === 'undefined') {
      // When Buffer is not available, create a Uint8Array with the same data
      const view = new Uint8Array(
        bufferLike.buffer,
        bufferLike.byteOffset || 0,
        bufferLike.byteLength,
      );
      const copy = new Uint8Array(view.length);
      copy.set(view);
      return copy as unknown as T;
    }
    const result = {
      buffer:
        bufferLike.buffer instanceof ArrayBuffer
          ? bufferLike.buffer.slice(0)
          : new ArrayBuffer(bufferLike.byteLength),
      byteLength: bufferLike.byteLength,
      byteOffset: bufferLike.byteOffset || 0,
      length: bufferLike.length || bufferLike.byteLength,
      BYTES_PER_ELEMENT: bufferLike.BYTES_PER_ELEMENT || 1,
    };
    return result as unknown as T;
  }

  // Set handling
  if (obj instanceof Set) {
    const set = new Set();
    seen.set(obj, set);
    const values = Array.from(obj);
    const len = values.length;
    for (let i = 0; i < len; i++) {
      set.add(internalDeepClone(values[i] as TCloneable, seen));
    }
    return set as unknown as T;
  }

  // Map handling
  if (obj instanceof Map) {
    const map = new Map();
    seen.set(obj, map);
    const entries = Array.from(obj);
    const len = entries.length;
    for (let i = 0; i < len; i++) {
      const [key, value] = entries[i];
      map.set(key, internalDeepClone(value as TCloneable, seen));
    }
    return map as unknown as T;
  }

  // Fast plain object path
  if (Object.getPrototypeOf(obj) === Object.prototype) {
    const target = {} as Record<string | symbol, unknown>;
    seen.set(obj, target);

    // Handle symbols first to ensure getters/setters are preserved
    const symbols = Object.getOwnPropertySymbols(obj);
    const symLen = symbols.length;
    if (symLen > 0) {
      for (let i = 0; i < symLen; i++) {
        const sym = symbols[i];
        const desc = Object.getOwnPropertyDescriptor(obj, sym);
        if (desc?.enumerable) {
          Object.defineProperty(target, sym, desc);
        }
      }
    }

    const descriptors = Object.getOwnPropertyDescriptors(obj);
    const keys = Object.keys(obj);
    const len = keys.length;

    // Check for getters/setters
    let hasAccessors = false;
    for (let i = 0; i < len; i++) {
      const desc = descriptors[keys[i]];
      if (desc.get || desc.set) {
        hasAccessors = true;
        break;
      }
    }

    if (hasAccessors) {
      // Handle objects with getters/setters
      for (let i = 0; i < len; i++) {
        const key = keys[i];
        const descriptor = descriptors[key];
        if (descriptor.enumerable) {
          if (descriptor.get || descriptor.set) {
            Object.defineProperty(target, key, descriptor);
          } else {
            const clonedValue = internalDeepClone(
              descriptor.value as TCloneable,
              seen,
            );
            Object.defineProperty(target, key, {
              ...descriptor,
              value: clonedValue,
            });
          }
        }
      }
    } else {
      // Fast path for plain objects without getters/setters
      let i = 0;
      const remainder = len % 8;
      const limit = len - remainder;

      while (i < limit) {
        const k1 = keys[i];
        const k2 = keys[i + 1];
        const k3 = keys[i + 2];
        const k4 = keys[i + 3];
        const k5 = keys[i + 4];
        const k6 = keys[i + 5];
        const k7 = keys[i + 6];
        const k8 = keys[i + 7];

        const source = obj as Record<string, unknown>;
        target[k1] = internalDeepClone(source[k1] as TCloneable, seen);
        target[k2] = internalDeepClone(source[k2] as TCloneable, seen);
        target[k3] = internalDeepClone(source[k3] as TCloneable, seen);
        target[k4] = internalDeepClone(source[k4] as TCloneable, seen);
        target[k5] = internalDeepClone(source[k5] as TCloneable, seen);
        target[k6] = internalDeepClone(source[k6] as TCloneable, seen);
        target[k7] = internalDeepClone(source[k7] as TCloneable, seen);
        target[k8] = internalDeepClone(source[k8] as TCloneable, seen);
        i += 8;
      }

      while (i < len) {
        const key = keys[i++];
        target[key] = internalDeepClone(
          (obj as Record<string, unknown>)[key] as TCloneable,
          seen,
        );
      }
    }

    return target as unknown as T;
  }

  // Complex object handling (with prototype/getters/setters)
  const proto = Object.getPrototypeOf(obj);
  const target = Object.create(proto) as T;
  seen.set(obj, target);

  const descriptors = Object.getOwnPropertyDescriptors(obj);
  const keys = Object.keys(descriptors);
  const len = keys.length;

  for (let i = 0; i < len; i++) {
    const key = keys[i];
    const descriptor = descriptors[key];
    if (!descriptor.enumerable) continue;

    if (descriptor.get || descriptor.set) {
      Object.defineProperty(target, key, descriptor);
    } else {
      const clonedValue = internalDeepClone(
        descriptor.value as TCloneable,
        seen,
      );
      Object.defineProperty(target, key, {
        ...descriptor,
        value: clonedValue,
      });
    }
  }

  const symbols = Object.getOwnPropertySymbols(obj);
  const symLen = symbols.length;
  for (let i = 0; i < symLen; i++) {
    const sym = symbols[i];
    const descriptor = Object.getOwnPropertyDescriptor(obj, sym);
    if (!descriptor?.enumerable) continue;
    Object.defineProperty(target, sym, descriptor);
  }

  return target;
};
