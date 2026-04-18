import { describe, expect, it } from "bun:test";

import {
  isArray,
  isBoolean,
  isDate,
  isDefined,
  isEmpty,
  isError,
  isFunction,
  isMap,
  isNil,
  isNull,
  isNumber,
  isObject,
  isPrimitive,
  isPromise,
  isRecord,
  isRegExp,
  isSet,
  isString,
  isUndefined,
} from "../";

describe("Type Guards", () => {
  describe("isBoolean", () => {
    it("accepts booleans", () => {
      expect(isBoolean(true)).toBe(true);
      expect(isBoolean(false)).toBe(true);
    });
    it("rejects non-booleans", () => {
      expect(isBoolean("true")).toBe(false);
      expect(isBoolean(0)).toBe(false);
      expect(isBoolean(null)).toBe(false);
    });
  });

  describe("isNumber", () => {
    it("accepts numbers including NaN", () => {
      expect(isNumber(42)).toBe(true);
      expect(isNumber(Number.NaN)).toBe(true);
    });
    it("rejects non-numbers", () => {
      expect(isNumber("42")).toBe(false);
      expect(isNumber(null)).toBe(false);
    });
  });

  describe("isString", () => {
    it("accepts strings", () => {
      expect(isString("")).toBe(true);
      expect(isString("hello")).toBe(true);
    });
    it("rejects non-strings", () => {
      expect(isString(42)).toBe(false);
    });
  });

  describe("isFunction", () => {
    it("accepts functions", () => {
      expect(isFunction(() => {})).toBe(true);
      expect(isFunction(async () => {})).toBe(true);
      expect(isFunction(function* () {})).toBe(true);
      expect(isFunction(class {})).toBe(true);
    });
    it("rejects non-functions", () => {
      expect(isFunction({})).toBe(false);
    });
  });

  describe("isObject", () => {
    it("accepts only plain objects", () => {
      expect(isObject({})).toBe(true);
      expect(isObject(Object.create(null))).toBe(true);
    });
    it("rejects arrays, instances, primitives", () => {
      expect(isObject([])).toBe(false);
      expect(isObject(new Date())).toBe(false);
      expect(isObject(null)).toBe(false);
    });
  });

  describe("isRecord", () => {
    it("accepts any non-null object reference", () => {
      expect(isRecord({})).toBe(true);
      expect(isRecord([])).toBe(true);
      expect(isRecord(new Date())).toBe(true);
    });
    it("rejects null and primitives", () => {
      expect(isRecord(null)).toBe(false);
      expect(isRecord("x")).toBe(false);
    });
  });

  describe("isNull / isUndefined / isNil / isDefined", () => {
    it("narrows correctly", () => {
      expect(isNull(null)).toBe(true);
      expect(isNull(undefined)).toBe(false);
      expect(isUndefined(undefined)).toBe(true);
      expect(isUndefined(null)).toBe(false);
      expect(isNil(null)).toBe(true);
      expect(isNil(undefined)).toBe(true);
      expect(isNil(0)).toBe(false);
      expect(isDefined(0)).toBe(true);
      expect(isDefined(null)).toBe(true);
      expect(isDefined(undefined)).toBe(false);
    });

    it("isDefined works as array filter predicate", () => {
      const mixed: (number | undefined)[] = [1, undefined, 2, undefined, 3];
      const filtered: number[] = mixed.filter(isDefined);
      expect(filtered).toEqual([1, 2, 3]);
    });
  });

  describe("isArray", () => {
    it("narrows to T[]", () => {
      expect(isArray([1, 2, 3])).toBe(true);
      expect(isArray({ length: 0 })).toBe(false);
    });
  });

  describe("isDate / isRegExp / isError", () => {
    it("detects built-ins", () => {
      expect(isDate(new Date())).toBe(true);
      expect(isDate("2024-01-01")).toBe(false);
      expect(isRegExp(/foo/)).toBe(true);
      expect(isRegExp("foo")).toBe(false);
      expect(isError(new Error("x"))).toBe(true);
      expect(isError(new TypeError("x"))).toBe(true);
      expect(isError("x")).toBe(false);
    });
  });

  describe("isPromise", () => {
    it("detects native Promises", () => {
      expect(isPromise(Promise.resolve())).toBe(true);
    });
    it("detects thenables", () => {
      // biome-ignore lint/suspicious/noThenProperty: intentional - testing thenable detection
      expect(isPromise({ then: () => {} })).toBe(true);
    });
    it("rejects non-thenables", () => {
      // biome-ignore lint/suspicious/noThenProperty: intentional - testing thenable rejection
      expect(isPromise({ then: 1 })).toBe(false);
      expect(isPromise({})).toBe(false);
      expect(isPromise(null)).toBe(false);
    });
  });

  describe("isMap / isSet", () => {
    it("detects Map / Set", () => {
      expect(isMap(new Map())).toBe(true);
      expect(isMap({})).toBe(false);
      expect(isSet(new Set())).toBe(true);
      expect(isSet([])).toBe(false);
    });
  });

  describe("isPrimitive", () => {
    it("accepts primitives", () => {
      expect(isPrimitive("")).toBe(true);
      expect(isPrimitive(0)).toBe(true);
      expect(isPrimitive(true)).toBe(true);
      expect(isPrimitive(null)).toBe(true);
      expect(isPrimitive(undefined)).toBe(true);
      expect(isPrimitive(Symbol())).toBe(true);
      expect(isPrimitive(BigInt(1))).toBe(true);
    });
    it("rejects objects", () => {
      expect(isPrimitive({})).toBe(false);
      expect(isPrimitive([])).toBe(false);
      expect(isPrimitive(() => {})).toBe(false);
    });
  });

  describe("isEmpty", () => {
    it("true for empty collections and nullish", () => {
      expect(isEmpty("")).toBe(true);
      expect(isEmpty([])).toBe(true);
      expect(isEmpty({})).toBe(true);
      expect(isEmpty(new Map())).toBe(true);
      expect(isEmpty(new Set())).toBe(true);
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
    });
    it("false for non-empty", () => {
      expect(isEmpty("x")).toBe(false);
      expect(isEmpty([1])).toBe(false);
      expect(isEmpty({ a: 1 })).toBe(false);
      expect(isEmpty(new Map([["a", 1]]))).toBe(false);
      expect(isEmpty(new Set([1]))).toBe(false);
    });
    it("false for non-collection primitives", () => {
      expect(isEmpty(0)).toBe(false);
      expect(isEmpty(false)).toBe(false);
    });
  });
});
