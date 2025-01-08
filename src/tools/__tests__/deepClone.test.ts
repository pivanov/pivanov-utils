import {
  describe,
  expect,
  it,
} from 'vitest';

import { deepClone } from '../deepClone';

describe('deepClone', () => {
  it('should handle primitive values', () => {
    expect(deepClone(null)).toBe(null);
    expect(deepClone(undefined)).toBe(undefined);
    expect(deepClone(42)).toBe(42);
    expect(deepClone('hello')).toBe('hello');
    expect(deepClone(true)).toBe(true);
    const sym = Symbol('test');
    expect(deepClone(sym)).toBe(sym);
    const big = BigInt(42);
    expect(deepClone(big)).toBe(big);
  });

  it('should handle circular references', () => {
    interface CircularRef {
      a: number;
      self?: CircularRef;
    }
    const obj: CircularRef = { a: 1 };
    obj.self = obj;
    const cloned = deepClone(obj);
    expect(cloned.a).toBe(1);
    expect(cloned.self).toBe(cloned);
  });

  it('should handle Buffer', () => {
    const buf = Buffer.from('test');
    const cloned = deepClone(buf);
    expect(Buffer.isBuffer(cloned)).toBe(true);
    expect(cloned.toString()).toBe('test');
    expect(cloned).not.toBe(buf);
  });

  it('should handle built-in types', () => {
    // Date
    const date = new Date();
    const clonedDate = deepClone(date);
    expect(clonedDate).toEqual(date);
    expect(clonedDate).not.toBe(date);

    // Set
    const set = new Set([
      1,
      2,
      3,
    ]);
    const clonedSet = deepClone(set);
    expect([...clonedSet]).toEqual([
      1,
      2,
      3,
    ]);
    expect(clonedSet).not.toBe(set);

    // Map
    const map = new Map([
      [
        'a',
        1,
      ],
      [
        'b',
        2,
      ],
    ]);
    const clonedMap = deepClone(map);
    expect([...clonedMap]).toEqual([
      [
        'a',
        1,
      ],
      [
        'b',
        2,
      ],
    ]);
    expect(clonedMap).not.toBe(map);

    // RegExp
    const regex = /test/gi;
    const clonedRegex = deepClone(regex);
    expect(clonedRegex.source).toBe(regex.source);
    expect(clonedRegex.flags).toBe(regex.flags);
    expect(clonedRegex).not.toBe(regex);

    // ArrayBuffer and TypedArray
    const arrayBuffer = new ArrayBuffer(4);
    const view = new Uint8Array(arrayBuffer);
    view.set([
      1,
      2,
      3,
      4,
    ]);
    const clonedBuffer = deepClone(arrayBuffer);
    expect(new Uint8Array(clonedBuffer)).toEqual(view);
    expect(clonedBuffer).not.toBe(arrayBuffer);

    const typedArray = new Uint8Array([
      1,
      2,
      3,
      4,
    ]);
    const clonedTypedArray = deepClone(typedArray);
    expect([...clonedTypedArray]).toEqual([
      1,
      2,
      3,
      4,
    ]);
    expect(clonedTypedArray).not.toBe(typedArray);
  });

  it('should handle arrays', () => {
    // Regular array
    const arr = [
      1,
      { a: 2 },
      [3],
    ];
    const clonedArr = deepClone(arr);
    expect(clonedArr).toEqual(arr);
    expect(clonedArr).not.toBe(arr);
    expect(clonedArr[1]).not.toBe(arr[1]);
    expect(clonedArr[2]).not.toBe(arr[2]);

    // Sparse array
    const sparse: string[] = [];
    sparse[1] = 'middle';
    const clonedSparse = deepClone(sparse);
    expect(clonedSparse).toEqual(sparse);
    expect(Object.keys(clonedSparse)).toEqual(['1']);
  });

  it('should handle custom class instances', () => {
    class Custom {
      constructor(public value: number) {}
      getValue() {
        return this.value;
      }
    }
    const instance = new Custom(42);
    const cloned = deepClone(instance);
    expect(cloned instanceof Custom).toBe(true);
    expect(cloned.value).toBe(42);
    expect(cloned.getValue()).toBe(42);
    expect(cloned).not.toBe(instance);
  });

  it('should handle objects with getters, setters and symbols', () => {
    const sym = Symbol('test');
    let value = 0;

    const obj = {
      // Regular property
      a: 1,
      // Getter only
      get value() {
        return value;
      },
      // Getter and setter
      get count() {
        return value;
      },
      set count(v: number) {
        value = v;
      },
      // Symbol property
      [sym]: 'symbol value',
    };

    const cloned = deepClone(obj);

    // Test regular property
    expect(cloned.a).toBe(1);

    // Test getter
    expect(cloned.value).toBe(0);

    // Test getter/setter
    expect(cloned.count).toBe(0);
    cloned.count = 42;
    expect(cloned.count).toBe(42);
    expect(value).toBe(42); // Setter should work

    // Test symbol
    expect(cloned[sym]).toBe('symbol value');

    // Verify descriptors are preserved
    const desc = Object.getOwnPropertyDescriptor(cloned, 'value');
    expect(desc?.get).toBeDefined();
    expect(desc?.set).toBeUndefined();
  });

  it('should handle nested objects with all types combined', () => {
    const date = new Date();
    const buffer = Buffer.from('test');
    const sym = Symbol('test');

    const original = {
      date,
      buffer,
      map: new Map([
        [
          'a',
          1,
        ],
      ]),
      set: new Set([
        1,
        2,
      ]),
      array: [
        1,
        { nested: true },
      ],
      [sym]: 'symbol',
      get computed() {
        return 42;
      },
    };

    const cloned = deepClone(original);

    expect(cloned).toEqual(original);
    expect(cloned.date).not.toBe(date);
    expect(cloned.buffer).not.toBe(buffer);
    expect(cloned.map).not.toBe(original.map);
    expect(cloned.set).not.toBe(original.set);
    expect(cloned.array).not.toBe(original.array);
    expect(cloned.array[1]).not.toBe(original.array[1]);
    expect(cloned[sym]).toBe('symbol');
    expect(cloned.computed).toBe(42);
  });

  it('should handle error cases in Buffer operations', () => {
    const buffer = Buffer.from('test');
    const originalIsBuffer = Buffer.isBuffer;

    try {
      (Buffer.isBuffer as unknown) = ((obj: unknown): obj is Buffer => {
        throw new Error('isBuffer error');
      });
      expect(() => deepClone(buffer)).toThrow('isBuffer error');
    } finally {
      Buffer.isBuffer = originalIsBuffer;
    }

    // Test with undefined Buffer
    const globalBuffer = global.Buffer;
    try {
      (global as unknown as Record<string, unknown>).Buffer = undefined;
      const result = deepClone(buffer);
      expect(Array.from(result)).toEqual(Array.from(buffer));
    } finally {
      (global as unknown as Record<string, unknown>).Buffer = globalBuffer;
    }
  });

  it('should handle non-enumerable properties', () => {
    const obj = Object.create(null);
    Object.defineProperty(obj, 'hidden', {
      value: 'secret',
      enumerable: false,
    });
    Object.defineProperty(obj, 'visible', {
      value: 'public',
      enumerable: true,
    });

    const cloned = deepClone(obj);
    expect(cloned.visible).toBe('public');
    expect(cloned.hidden).toBeUndefined();
  });

  it('should handle non-enumerable symbol properties', () => {
    const sym = Symbol('test');
    const obj = {};
    Object.defineProperty(obj, sym, {
      value: 'secret',
      enumerable: false,
    });

    const cloned = deepClone(obj);
    expect(cloned[sym]).toBeUndefined();
  });

  it('should handle edge cases with descriptors', () => {
    // Test object with non-configurable property
    const objWithNonConfigurable: { fixed?: number } = {};
    Object.defineProperty(objWithNonConfigurable, 'fixed', {
      value: 42,
      configurable: false,
      writable: false,
      enumerable: true,
    });
    const clonedNonConfigurable = deepClone(objWithNonConfigurable);
    expect(clonedNonConfigurable.fixed).toBe(42);

    // Test object with property that has no descriptor
    const objWithoutDescriptor: { weird?: unknown } = {};
    Object.defineProperty(objWithoutDescriptor, 'weird', {
      configurable: true,
      enumerable: true,
    });
    const clonedWithoutDescriptor = deepClone(objWithoutDescriptor);
    expect(clonedWithoutDescriptor.weird).toBeUndefined();
  });

  it('should handle edge cases with typed arrays', () => {
    // Test regular TypedArrays
    const regularTypedArrays = [
      new Int8Array([1, 2, 3]),
      new Uint8Array([1, 2, 3]),
      new Uint8ClampedArray([1, 2, 3]),
      new Int16Array([1, 2, 3]),
      new Uint16Array([1, 2, 3]),
      new Int32Array([1, 2, 3]),
      new Uint32Array([1, 2, 3]),
      new Float32Array([1, 2, 3]),
      new Float64Array([1, 2, 3]),
    ];

    for (const arr of regularTypedArrays) {
      const cloned = deepClone(arr);
      expect(Array.from(cloned)).toEqual(Array.from(arr));
      expect(cloned).not.toBe(arr);
      expect(cloned.buffer).not.toBe(arr.buffer);
      expect(cloned.constructor.name).toBe(arr.constructor.name);
    }

    // Test BigInt TypedArrays
    const bigIntTypedArrays = [
      new BigInt64Array([1n, 2n, 3n]),
      new BigUint64Array([1n, 2n, 3n]),
    ];

    for (const arr of bigIntTypedArrays) {
      const cloned = deepClone(arr);
      expect([...cloned].map(String)).toEqual([...arr].map(String));
      expect(cloned).not.toBe(arr);
      expect(cloned.buffer).not.toBe(arr.buffer);
      expect(cloned.constructor.name).toBe(arr.constructor.name);
    }
  });

  it('should handle symbol properties with getters and setters', () => {
    const sym = Symbol('test');
    let value = 42;

    // Test in plain object
    const plainObj = {
      [sym]: 'regular value',
    };
    Object.defineProperty(plainObj, Symbol('getter'), {
      enumerable: true,
      get: () => value,
    });
    Object.defineProperty(plainObj, Symbol('accessor'), {
      enumerable: true,
      get: () => value,
      set: (v: number) => {
        value = v;
      },
    });

    const clonedPlain = deepClone(plainObj);
    const getterSym = Object.getOwnPropertySymbols(plainObj)[1];
    const accessorSym = Object.getOwnPropertySymbols(plainObj)[2];

    expect(clonedPlain[getterSym]).toBe(42);
    expect(clonedPlain[accessorSym]).toBe(42);
    clonedPlain[accessorSym] = 100;
    expect(value).toBe(100);

    // Test in class instance
    class Custom {
      private value = 42;
      [sym] = 'regular value';

      constructor() {
        Object.defineProperty(this, Symbol('getter'), {
          enumerable: true,
          get: () => this.value,
        });
        Object.defineProperty(this, Symbol('accessor'), {
          enumerable: true,
          get: () => this.value,
          set: (v: number) => {
            this.value = v;
          },
        });
      }
    }

    const instance = new Custom();
    const clonedInstance = deepClone(instance);
    const instanceGetterSym = Object.getOwnPropertySymbols(instance)[1];
    const instanceAccessorSym = Object.getOwnPropertySymbols(instance)[2];

    // Call getter and setter to ensure coverage
    expect(instance[instanceGetterSym]).toBe(42);
    instance[instanceAccessorSym] = 150;
    expect(instance[instanceGetterSym]).toBe(150);

    // Test the cloned instance
    expect(clonedInstance[instanceGetterSym]).toBe(150);
    expect(clonedInstance[instanceAccessorSym]).toBe(150);
    clonedInstance[instanceAccessorSym] = 200;
    expect(clonedInstance[instanceGetterSym]).toBe(200);
  });

  it('should handle non-enumerable properties with getters and setters', () => {
    let value = 42;
    let getterCalled = false;
    let setterCalled = false;

    interface WithHidden {
      hidden: number;
    }

    // Test in plain object
    const obj = {} as WithHidden;
    Object.defineProperty(obj, 'hidden', {
      enumerable: false,
      get: () => {
        getterCalled = true;
        return value;
      },
      set: (v: number) => {
        setterCalled = true;
        value = v;
      },
    });

    // Trigger getter and setter before cloning
    const originalValue = obj.hidden;
    expect(originalValue).toBe(42);
    obj.hidden = 50;
    expect(value).toBe(50);

    const cloned = deepClone(obj);
    expect(Object.getOwnPropertyDescriptor(cloned, 'hidden')).toBeUndefined();

    // Test in class instance
    class Custom {
      private value = 42;
      private getterCalled = false;
      private setterCalled = false;
      declare hidden: number;
      declare test: number;

      constructor() {
        Object.defineProperty(this, 'hidden', {
          enumerable: false,
          get: () => {
            this.getterCalled = true;
            return this.value;
          },
          set: (v: number) => {
            this.setterCalled = true;
            this.value = v;
          },
        });

        Object.defineProperty(this, 'test', {
          enumerable: false,
          get: () => this.value,
          set: (v: number) => {
            this.value = v;
          },
        });
      }

      getValue() {
        return this.value;
      }

      wasGetterCalled() {
        return this.getterCalled;
      }

      wasSetterCalled() {
        return this.setterCalled;
      }
    }

    const instance = new Custom();

    // Access the property to trigger getter
    const hiddenValue = instance.hidden;
    expect(hiddenValue).toBe(42);
    expect(instance.wasGetterCalled()).toBe(true);

    // Set the property to trigger setter
    instance.hidden = 100;
    expect(instance.getValue()).toBe(100);
    expect(instance.wasSetterCalled()).toBe(true);

    // Access test property to trigger its getter and setter
    const testValue = instance.test;
    expect(testValue).toBe(100);
    instance.test = 200;
    expect(instance.getValue()).toBe(200);

    const clonedInstance = deepClone(instance);
    expect(Object.getOwnPropertyDescriptor(clonedInstance, 'hidden')).toBeUndefined();

    // Verify original object getters/setters were called
    expect(getterCalled).toBe(true);
    expect(setterCalled).toBe(true);
  });

  it('should handle Buffer.isBuffer returning false for Buffer-like objects', () => {
    const bufferLike = {
      buffer: new ArrayBuffer(4),
      byteLength: 4,
      byteOffset: 0,
      length: 4,
      BYTES_PER_ELEMENT: 1,
    };
    const cloned = deepClone(bufferLike);
    expect(cloned).toEqual(bufferLike);
    expect(cloned).not.toBe(bufferLike);
  });

  it('should handle custom class instances with enumerable properties', () => {
    interface CustomProps {
      regularProp: { nested: { deep: number } };
      computedProp: number;
    }

    class Custom implements CustomProps {
      declare regularProp: { nested: { deep: number } };
      declare computedProp: number;

      constructor() {
        // Add a regular enumerable property with a nested object
        Object.defineProperty(this, 'regularProp', {
          enumerable: true,
          value: { nested: { deep: 42 } },
          configurable: true,
          writable: true,
        });

        // Add a getter/setter property
        Object.defineProperty(this, 'computedProp', {
          enumerable: true,
          get: () => 42,
          set: () => {
            /* noop */
          },
        });
      }
    }

    const instance = new Custom();
    const cloned = deepClone<Custom>(instance);

    expect(cloned).toEqual(instance);
    expect(cloned).not.toBe(instance);
    expect(cloned.regularProp).toEqual({ nested: { deep: 42 } });
    expect(cloned.regularProp).not.toBe(instance.regularProp);
    expect(cloned.regularProp.nested).not.toBe(instance.regularProp.nested);
    expect(cloned.computedProp).toBe(42);

    // Call the setter to ensure coverage
    instance.computedProp = 100;
    cloned.computedProp = 200;
  });

  it('should handle arrays with different sizes and types', () => {
    // Small array (< 32 elements)
    const smallArr = Array.from({ length: 10 }, (_, i) => i);
    const clonedSmall = deepClone(smallArr);
    expect(clonedSmall).toEqual(smallArr);
    expect(clonedSmall).not.toBe(smallArr);

    // Large dense array (> 32 elements)
    const largeArr = Array.from({ length: 100 }, (_, i) => i);
    const clonedLarge = deepClone(largeArr);
    expect(clonedLarge).toEqual(largeArr);
    expect(clonedLarge).not.toBe(largeArr);

    // Large sparse array
    const largeSparse: string[] = [];
    largeSparse[50] = 'middle';
    const clonedSparse = deepClone(largeSparse);
    expect(clonedSparse).toEqual(largeSparse);
    expect(Object.keys(clonedSparse)).toEqual(['50']);
  });

  it('should handle DataView objects', () => {
    const buffer = new ArrayBuffer(16);
    const view = new DataView(buffer);
    view.setInt32(0, 42);

    const cloned = deepClone(view);
    expect(cloned).toBeInstanceOf(DataView);
    expect(cloned.byteLength).toBe(view.byteLength);
    expect(cloned.getInt32(0)).toBe(42);
    expect(cloned.buffer).not.toBe(buffer);
  });

  it('should handle plain objects with many properties', () => {
    // Create object with many properties to test unrolled loop
    const obj = Array.from(
      { length: 20 },
      (_, i) => [`key${i}`, i] as [string, number],
    ).reduce<Record<string, number>>((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});

    const cloned = deepClone(obj);
    expect(cloned).toEqual(obj);
    expect(cloned).not.toBe(obj);
  });

  it('should handle objects with non-enumerable properties', () => {
    const obj = {};
    Object.defineProperty(obj, 'hidden', {
      value: 42,
      enumerable: false,
      configurable: true,
      writable: true,
    });

    const cloned = deepClone(obj);
    expect(Object.getOwnPropertyDescriptor(cloned, 'hidden')).toBeUndefined();
  });

  it('should handle objects with symbol properties that have getters/setters', () => {
    const sym = Symbol('test');
    let value = 42;

    const obj = {};
    Object.defineProperty(obj, sym, {
      enumerable: true,
      get: () => value,
      set: (v: number) => {
        value = v;
      },
    });

    const cloned = deepClone(obj);
    const descriptor = Object.getOwnPropertyDescriptor(cloned, sym);
    expect(descriptor?.get).toBeDefined();
    expect(descriptor?.set).toBeDefined();
    expect(descriptor?.enumerable).toBe(true);

    // Test getter and setter functionality
    expect(cloned[sym]).toBe(42);
    cloned[sym] = 100;
    expect(value).toBe(100);
    expect(cloned[sym]).toBe(100);
  });

  it('should handle Buffer error cases comprehensively', () => {
    const buffer = Buffer.from('test');
    const originalIsBuffer = Buffer.isBuffer;

    try {
      (Buffer.isBuffer as unknown) = (obj: unknown): obj is Buffer => {
        throw new Error('isBuffer error');
      };
      expect(() => deepClone(buffer)).toThrow('isBuffer error');
    } finally {
      Buffer.isBuffer = originalIsBuffer;
    }
  });

  it('should handle Buffer error cases with Error-like objects', () => {
    const buffer = Buffer.from('test');
    const originalIsBuffer = Buffer.isBuffer;

    try {
      (Buffer.isBuffer as unknown) = (obj: unknown): obj is Buffer => {
        throw new Error('isBuffer error');
      };
      expect(() => deepClone(buffer)).toThrow('isBuffer error');
    } finally {
      Buffer.isBuffer = originalIsBuffer;
    }
  });

  it('should handle Buffer error cases with various error types', () => {
    const buffer = Buffer.from('test');
    const originalIsBuffer = Buffer.isBuffer;

    // Test with Error object without stack
    try {
      (Buffer.isBuffer as unknown) = (obj: unknown): obj is Buffer => {
        const error = { name: 'Error', message: 'custom error' } as Error;
        throw error;
      };
      const result = deepClone(buffer);
      expect(result).toBeDefined();
    } finally {
      Buffer.isBuffer = originalIsBuffer;
    }
  });

  it('should handle DataView objects comprehensively', () => {
    const buffer = new ArrayBuffer(16);
    const view = new DataView(buffer);
    view.setInt32(0, 42);

    const cloned = deepClone(view);
    expect(cloned).toBeInstanceOf(DataView);
    expect(cloned.byteLength).toBe(view.byteLength);
    expect(cloned.getInt32(0)).toBe(42);
    expect(cloned.buffer).not.toBe(buffer);

    // Test DataView-like object without buffer property
    const customDataView = {
      byteLength: 16,
      constructor: DataView,
      [Symbol.toStringTag]: 'DataView',
    };

    const clonedCustom = deepClone(customDataView);
    expect(clonedCustom.byteLength).toBe(16);
    expect(clonedCustom[Symbol.toStringTag]).toBe('DataView');
  });

  it('should handle DataView objects with various buffer configurations', () => {
    // Test DataView with a buffer that has a different byteLength
    const buffer = new ArrayBuffer(32);
    const view = new DataView(buffer, 8, 16); // offset: 8, length: 16
    view.setInt32(0, 42);

    const cloned = deepClone(view);
    expect(cloned).toBeInstanceOf(DataView);
    expect(cloned.byteLength).toBe(16);
    expect(cloned.byteOffset).toBe(0); // New view should start at 0
    expect(cloned.getInt32(0)).toBe(42);
    expect(cloned.buffer).not.toBe(buffer);
    expect(cloned.buffer.byteLength).toBe(16); // New buffer should be exactly the size needed

    // Test DataView-like object without buffer property
    const customDataView = {
      byteLength: 16,
      [Symbol.toStringTag]: 'DataView',
    };

    const clonedCustom = deepClone(customDataView);
    expect(clonedCustom.byteLength).toBe(16);
    expect(clonedCustom[Symbol.toStringTag]).toBe('DataView');
  });

  it('should handle objects with symbol properties that have getters/setters comprehensively', () => {
    const sym = Symbol('test');
    let value = 42;

    const obj = {};
    Object.defineProperty(obj, sym, {
      enumerable: true,
      get: () => value,
      set: (v: number) => {
        value = v;
      },
    });

    const cloned = deepClone(obj);
    const descriptor = Object.getOwnPropertyDescriptor(cloned, sym);
    expect(descriptor?.get).toBeDefined();
    expect(descriptor?.set).toBeDefined();
    expect(descriptor?.enumerable).toBe(true);

    // Test getter and setter functionality
    expect(cloned[sym]).toBe(42);
    cloned[sym] = 100;
    expect(value).toBe(100);
    expect(cloned[sym]).toBe(100);
  });

  it('should handle Buffer error cases with non-Error throws', () => {
    const buffer = Buffer.from('test');
    const originalIsBuffer = Buffer.isBuffer;

    try {
      (Buffer.isBuffer as unknown) = (obj: unknown): obj is Buffer => {
        throw 'string error'; // non-Error throw
      };
      const result = deepClone(buffer);
      expect(result).toBeDefined();
    } finally {
      Buffer.isBuffer = originalIsBuffer;
    }
  });

  it('should handle DataView objects with custom buffer handling', () => {
    const buffer = new ArrayBuffer(16);
    const view = new DataView(buffer);
    view.setInt32(0, 42);

    // Create a DataView-like object with a custom buffer
    const customView = {
      buffer: new ArrayBuffer(16),
      byteLength: 16,
      byteOffset: 0,
      constructor: DataView,
    };

    const cloned = deepClone(customView);
    expect(cloned).toBeDefined();
    expect(cloned.byteLength).toBe(16);
  });

  it('should handle getters/setters with side effects', () => {
    let sideEffect = 0;
    const obj = {
      get value() {
        sideEffect++;
        return 42;
      },
      set value(v: number) {
        sideEffect = v;
      },
    };

    const cloned = deepClone(obj);
    expect(cloned.value).toBe(42);
    expect(sideEffect).toBe(1);
    cloned.value = 100;
    expect(sideEffect).toBe(100);
  });

  it('should handle Buffer error cases with non-Error throws and DataView edge cases', () => {
    // Test Buffer error cases
    const buffer = Buffer.from('test');
    const originalIsBuffer = Buffer.isBuffer;

    try {
      (Buffer.isBuffer as unknown) = (obj: unknown): obj is Buffer => {
        throw { message: 'custom error object' }; // non-Error throw with message property
      };
      const result = deepClone(buffer);
      expect(result).toBeDefined();
    } finally {
      Buffer.isBuffer = originalIsBuffer;
    }

    // Test DataView edge cases
    const buffer2 = new ArrayBuffer(16);
    const view = new DataView(buffer2);
    view.setInt32(0, 42);

    // Create a DataView-like object with a custom buffer
    const customView = {
      buffer: buffer2,
      byteLength: 16,
      byteOffset: 0,
      constructor: DataView,
    };

    const cloned = deepClone(customView);
    expect(cloned).toBeDefined();
    expect(cloned.byteLength).toBe(16);
    expect(cloned.buffer).not.toBe(buffer2);
  });

  it('should handle DataView objects with buffer access errors', () => {
    const buffer = new ArrayBuffer(16);
    const view = new DataView(buffer);
    view.setInt32(0, 42);

    // Create a DataView-like object with a buffer that throws on access
    const customView = {
      get buffer() {
        throw new Error('Cannot access buffer');
      },
      byteLength: 16,
      byteOffset: 0,
      constructor: DataView,
    };

    expect(() => deepClone(customView)).toThrow('Cannot access buffer');
  });

  it('should handle Buffer-like objects with various configurations', () => {
    // Test Buffer-like object with ArrayBuffer
    const bufferLike = {
      buffer: new ArrayBuffer(16),
      byteLength: 16,
      byteOffset: 8,
      length: 16,
      BYTES_PER_ELEMENT: 1,
    };

    const cloned = deepClone(bufferLike);
    expect(cloned.byteLength).toBe(16);
    expect(cloned.buffer).toBeInstanceOf(ArrayBuffer);
    expect(cloned.buffer).not.toBe(bufferLike.buffer);

    // Test Buffer-like object with non-ArrayBuffer buffer
    const customBufferLike = {
      buffer: { length: 16 },
      byteLength: 16,
      length: 16,
    };

    const clonedCustom = deepClone(customBufferLike);
    expect(clonedCustom.byteLength).toBe(16);
    expect(clonedCustom.buffer).toBeInstanceOf(ArrayBuffer);

    // Test Buffer-like object without Buffer available
    const originalBuffer = global.Buffer;
    try {
      global.Buffer = undefined as unknown as BufferConstructor;
      const bufferLikeNoBuffer = {
        buffer: new ArrayBuffer(16),
        byteLength: 16,
        byteOffset: 0,
        length: 16,
      };
      const uint8View = new Uint8Array(bufferLikeNoBuffer.buffer);
      uint8View.set([1, 2, 3, 4]);

      const clonedNoBuffer = deepClone(bufferLikeNoBuffer);
      expect(clonedNoBuffer).toBeInstanceOf(Uint8Array);
      expect(Array.from((clonedNoBuffer as Uint8Array).slice(0, 4))).toEqual([
        1, 2, 3, 4,
      ]);
    } finally {
      global.Buffer = originalBuffer;
    }
  });

  it('should handle Buffer error cases with various error types', () => {
    const buffer = Buffer.from('test');
    const originalIsBuffer = Buffer.isBuffer;

    // Test with Error object without stack
    try {
      (Buffer.isBuffer as unknown) = (obj: unknown): obj is Buffer => {
        const error = { name: 'Error', message: 'custom error' } as Error;
        throw error;
      };
      const result = deepClone(buffer);
      expect(result).toBeDefined();
    } finally {
      Buffer.isBuffer = originalIsBuffer;
    }

    // Test with non-Error object that has message
    try {
      (Buffer.isBuffer as unknown) = (obj: unknown): obj is Buffer => {
        throw { message: 'custom error object', name: 'CustomError' };
      };
      const result = deepClone(buffer);
      expect(result).toBeDefined();
    } finally {
      Buffer.isBuffer = originalIsBuffer;
    }
  });

  it('should handle DataView-like objects without buffer property', () => {
    // Create a DataView-like object without a buffer property
    const customDataView = {
      byteLength: 16,
      constructor: DataView,
      [Symbol.toStringTag]: 'DataView',
    };

    const clonedCustom = deepClone(customDataView);
    expect(clonedCustom.byteLength).toBe(16);
    expect(clonedCustom[Symbol.toStringTag]).toBe('DataView');
  });

  it('should handle DataView-like objects without buffer property and with ArrayBuffer.isView', () => {
    // Create a DataView-like object without a buffer property
    const customDataView = {
      byteLength: 16,
      constructor: DataView,
    };

    // Mock ArrayBuffer.isView to return true for our custom object
    const originalIsView = ArrayBuffer.isView;
    try {
      (ArrayBuffer.isView as unknown) = (
        obj: unknown,
      ): obj is ArrayBufferView => {
        return obj === customDataView;
      };

      const clonedCustom = deepClone(customDataView);
      expect(clonedCustom).toBeDefined();
      expect(clonedCustom.byteLength).toBe(16);
      expect(clonedCustom instanceof DataView).toBe(true);
    } finally {
      ArrayBuffer.isView = originalIsView;
    }
  });

  it('should handle non-enumerable symbol properties with descriptors', () => {
    const sym = Symbol('test');
    const obj = {};

    // Define a non-enumerable symbol property with a descriptor
    Object.defineProperty(obj, sym, {
      value: 'secret',
      enumerable: false,
      configurable: true,
      writable: true,
    });

    const cloned = deepClone(obj);
    expect(Object.getOwnPropertyDescriptor(cloned, sym)).toBeUndefined();
    expect(cloned[sym]).toBeUndefined();

    // Also test with a mix of enumerable and non-enumerable symbol properties
    const sym2 = Symbol('test2');
    Object.defineProperty(obj, sym2, {
      value: 'visible',
      enumerable: true,
      configurable: true,
      writable: true,
    });

    const cloned2 = deepClone(obj);
    expect(Object.getOwnPropertyDescriptor(cloned2, sym)).toBeUndefined();
    expect(cloned2[sym2]).toBe('visible');
  });

  it('should handle sparse arrays with large gaps', () => {
    const sparse: string[] = [];
    sparse[100] = 'end';
    const clonedSparse = deepClone(sparse);
    expect(clonedSparse).toEqual(sparse);
  });

  it('should handle symbol properties with undefined descriptors', () => {
    const sym = Symbol('test');
    const obj = Object.create(null);
    Object.defineProperty(obj, sym, {
      value: 'test',
      enumerable: false,
      configurable: true,
    });

    const cloned = deepClone(obj);
    expect(Object.getOwnPropertySymbols(cloned)).toEqual([]);
  });
});
