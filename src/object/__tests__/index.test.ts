import { describe, expect, it } from "bun:test";

import { deepMerge, entriesOf, fromEntries, groupBy, hasOwn, invert, keysOf, mapKeys, mapValues, merge, omit, omitBy, pick, pickBy } from "../";

describe("object utils", () => {
  const sample = { name: "John", age: 30, email: "john@example.com" };

  describe("pick / omit", () => {
    it("pick keeps specified keys", () => {
      expect(pick(sample, ["name", "email"])).toEqual({
        name: "John",
        email: "john@example.com",
      });
    });

    it("omit removes specified keys", () => {
      expect(omit(sample, ["age"])).toEqual({
        name: "John",
        email: "john@example.com",
      });
    });

    it("both return new instances", () => {
      expect(pick(sample, ["name"])).not.toBe(sample);
      expect(omit(sample, ["age"])).not.toBe(sample);
    });
  });

  describe("pickBy / omitBy", () => {
    it("pickBy keeps matching", () => {
      expect(pickBy({ a: 1, b: 2, c: 3 }, (v) => v > 1)).toEqual({
        b: 2,
        c: 3,
      });
    });
    it("omitBy drops matching", () => {
      expect(omitBy({ a: 1, b: null, c: 3 }, (v) => v === null)).toEqual({ a: 1, c: 3 });
    });
    it("passes key to predicate", () => {
      const keys: string[] = [];
      pickBy({ a: 1, b: 2 }, (_, k) => {
        keys.push(k);
        return true;
      });
      expect(keys.sort()).toEqual(["a", "b"]);
    });
  });

  describe("mapValues / mapKeys", () => {
    it("mapValues transforms values", () => {
      expect(mapValues({ a: 1, b: 2 }, (v) => v * 2)).toEqual({ a: 2, b: 4 });
    });
    it("mapKeys transforms keys", () => {
      expect(mapKeys({ a: 1, b: 2 }, (_, k) => k.toUpperCase())).toEqual({
        A: 1,
        B: 2,
      });
    });
  });

  describe("groupBy", () => {
    it("groups items by computed key", () => {
      expect(groupBy(["apple", "avocado", "banana"], (s) => s[0])).toEqual({
        a: ["apple", "avocado"],
        b: ["banana"],
      });
    });
    it("passes index to iteratee", () => {
      const indices: number[] = [];
      groupBy([10, 20, 30], (_, i) => {
        indices.push(i);
        return "x";
      });
      expect(indices).toEqual([0, 1, 2]);
    });
  });

  describe("invert", () => {
    it("swaps keys and values", () => {
      expect(invert({ a: "x", b: "y" })).toEqual({ x: "a", y: "b" });
    });
  });

  describe("hasOwn", () => {
    it("narrows the key", () => {
      const obj: { a?: number } = { a: 1 };
      if (hasOwn(obj, "a")) {
        expect(obj.a).toBe(1);
      }
      expect(hasOwn(obj, "b")).toBe(false);
    });
  });

  describe("keysOf / entriesOf / fromEntries", () => {
    it("typed wrappers round-trip", () => {
      const obj = { a: 1, b: 2 } as const;
      const keys = keysOf(obj);
      expect(keys.sort()).toEqual(["a", "b"]);
      const entries = entriesOf(obj);
      expect(entries.length).toBe(2);
      expect(fromEntries(entriesOf(obj))).toEqual({ a: 1, b: 2 });
    });
  });

  describe("merge", () => {
    it("shallow-merges sources into new object", () => {
      expect(merge<{ a?: number; b?: number; c?: number }>({ a: 1 }, { b: 2 }, { c: 3 })).toEqual({ a: 1, b: 2, c: 3 });
    });
    it("does not mutate target", () => {
      const target = { a: 1 };
      merge(target, { b: 2 } as Partial<{ a: number; b: number }>);
      expect(target).toEqual({ a: 1 });
    });
  });

  describe("deepMerge", () => {
    it("merges nested plain objects", () => {
      expect(deepMerge({ a: { b: 1 } } as { a: { b?: number; c?: number } }, { a: { c: 2 } })).toEqual({ a: { b: 1, c: 2 } });
    });
    it("later sources win for primitives", () => {
      expect(deepMerge({ a: 1 }, { a: 2 }, { a: 3 })).toEqual({ a: 3 });
    });
    it("arrays replace (not concat)", () => {
      expect(deepMerge({ a: [1, 2] }, { a: [3] } as Partial<{ a: number[] }>)).toEqual({ a: [3] });
    });
    it("skips undefined sources", () => {
      expect(deepMerge({ a: 1 }, undefined as unknown as Partial<{ a: number }>)).toEqual({ a: 1 });
    });
    it("does not mutate target", () => {
      const target = { a: { b: 1 } };
      deepMerge(target, { a: { b: 2 } });
      expect(target).toEqual({ a: { b: 1 } });
    });
  });
});
