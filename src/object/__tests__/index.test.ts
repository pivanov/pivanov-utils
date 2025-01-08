import {
  describe,
  expect,
  it,
} from 'vitest';

import { deepMerge, merge, omit, pick } from '../';

describe('object utils', () => {
  const testObject = {
    name: 'John',
    age: 30,
    email: 'john@example.com',
    address: '123 Main St',
  };

  describe('omit', () => {
    it('should remove specified keys from object', () => {
      const result = omit(testObject, ['email', 'age']);

      expect(result).toEqual({
        name: 'John',
        address: '123 Main St',
      });
    });

    it('should return a new object instance', () => {
      const result = omit(testObject, ['email']);

      expect(result).not.toBe(testObject);
    });

    it('should handle empty keys array', () => {
      const result = omit(testObject, []);

      expect(result).toEqual(testObject);
    });

    it('should handle non-existent keys', () => {
      const result = omit(testObject, [
        'nonexistent' as keyof typeof testObject,
      ]);

      expect(result).toEqual(testObject);
    });
  });

  describe('pick', () => {
    it('should keep only specified keys from object', () => {
      const result = pick(testObject, ['name', 'email']);

      expect(result).toEqual({
        name: 'John',
        email: 'john@example.com',
      });
    });

    it('should return a new object instance', () => {
      const result = pick(testObject, ['name']);

      expect(result).not.toBe(testObject);
    });

    it('should handle empty keys array', () => {
      const result = pick(testObject, []);

      expect(result).toEqual({});
    });

    it('should handle non-existent keys', () => {
      const result = pick(testObject, [
        'nonexistent' as keyof typeof testObject,
      ]);

      expect(result).toEqual({});
    });

    it('should handle picking all keys', () => {
      const result = pick(testObject, ['name', 'age', 'email', 'address']);

      expect(result).toEqual(testObject);
    });
  });

  describe('merge', () => {
    it('should merge objects at the top level', () => {
      interface TestObj {
        a?: number;
        b?: number;
        c?: number;
        d?: number;
      }
      const result = merge<TestObj>({ a: 1, b: 2 }, { c: 3 }, { d: 4 });
      expect(result).toEqual({
        a: 1,
        b: 2,
        c: 3,
        d: 4,
      });
    });

    it('should override existing properties', () => {
      interface TestObj {
        a: number;
        b: number;
      }
      const result = merge<TestObj>({ a: 1, b: 2 }, { b: 3 }, { b: 4 });
      expect(result).toEqual({
        a: 1,
        b: 4,
      });
    });

    it('should handle empty objects', () => {
      interface TestObj {
        a?: number;
        b?: number;
      }
      const result = merge<TestObj>({ a: 1 }, {}, { b: 2 });
      expect(result).toEqual({
        a: 1,
        b: 2,
      });
    });
  });

  describe('deepMerge', () => {
    it('should deep merge nested objects', () => {
      interface TestObj {
        a: {
          b?: number;
          c?: number;
          d?: number;
          e?: number;
        };
      }
      const result = deepMerge<TestObj>(
        { a: { b: 1, c: 2 } },
        { a: { d: 3 } },
        { a: { e: 4 } },
      );
      expect(result).toEqual({
        a: {
          b: 1,
          c: 2,
          d: 3,
          e: 4,
        },
      });
    });

    it('should override nested properties', () => {
      interface TestObj {
        a: { b: number };
      }
      const result = deepMerge<TestObj>({ a: { b: 1 } }, { a: { b: 2 } });
      expect(result).toEqual({
        a: { b: 2 },
      });
    });

    it('should handle mixed nested and top-level properties', () => {
      interface TestObj {
        a?: number;
        b?: {
          c?: number;
          d?: number;
        };
        e?: number;
      }
      const result = deepMerge<TestObj>(
        { a: 1, b: { c: 2 } },
        { b: { d: 3 }, e: 4 },
      );
      expect(result).toEqual({
        a: 1,
        b: {
          c: 2,
          d: 3,
        },
        e: 4,
      });
    });

    it('should handle empty objects', () => {
      interface TestObj {
        a: {
          b?: number;
          c?: number;
        };
      }
      const result = deepMerge<TestObj>({ a: { b: 1 } }, {}, { a: { c: 2 } });
      expect(result).toEqual({
        a: {
          b: 1,
          c: 2,
        },
      });
    });

    it('should create nested objects if they dont exist', () => {
      interface TestObj {
        a?: number;
        b?: {
          c: number;
        };
      }
      const result = deepMerge<TestObj>({ a: 1 }, { b: { c: 2 } });
      expect(result).toEqual({
        a: 1,
        b: { c: 2 },
      });
    });

    it('should handle undefined sources', () => {
      interface TestObj {
        a: number;
      }
      const result = deepMerge<TestObj>(
        { a: 1 },
        undefined as unknown as Partial<TestObj>,
      );
      expect(result).toEqual({ a: 1 });
    });
  });
});
