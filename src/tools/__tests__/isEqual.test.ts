import { describe, expect, it } from "bun:test";

import { isEqual } from "../isEqual";

describe("isEqual", () => {
  it("compares primitives", () => {
    expect(isEqual(1, 1)).toBe(true);
    expect(isEqual("test", "test")).toBe(true);
    expect(isEqual(true, true)).toBe(true);
    expect(isEqual(1, 2)).toBe(false);
  });

  it("compares arrays", () => {
    expect(isEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(isEqual([1, 2, 3], [1, 2, 4])).toBe(false);
    expect(isEqual([1, [2, 3]], [1, [2, 3]])).toBe(true);
    expect(isEqual([1, 2], [1, 2, 3])).toBe(false);
    expect(isEqual([], [1])).toBe(false);
  });

  it("compares objects", () => {
    expect(isEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
    expect(isEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
    expect(isEqual({ a: 1 }, { a: 2 })).toBe(false);
    expect(isEqual({ a: 1, b: 2 }, { a: 1 })).toBe(false);
    expect(isEqual({}, { a: 1 })).toBe(false);
    expect(isEqual({ a: { b: 1 }, c: 2 }, { a: { b: 1 }, c: 2 })).toBe(true);
  });

  it("compares Sets of primitives", () => {
    expect(isEqual(new Set([1, 2]), new Set([1, 2]))).toBe(true);
    expect(isEqual(new Set([1, 2]), new Set([2, 1]))).toBe(true);
    expect(isEqual(new Set([1, 2]), new Set([1, 3]))).toBe(false);
    expect(isEqual(new Set([1]), new Set([1, 2]))).toBe(false);
    expect(isEqual(new Set(), new Set([1]))).toBe(false);
  });

  it("compares Sets of objects structurally", () => {
    expect(isEqual(new Set([{ id: 1 }, { id: 2 }]), new Set([{ id: 2 }, { id: 1 }]))).toBe(true);
    expect(isEqual(new Set([{ id: 1 }]), new Set([{ id: 2 }]))).toBe(false);
  });

  it("compares Maps", () => {
    expect(isEqual(new Map([["a", 1]]), new Map([["a", 1]]))).toBe(true);
    expect(isEqual(new Map([["a", 1]]), new Map([["a", 2]]))).toBe(false);
    expect(
      isEqual(
        new Map([["a", 1]]),
        new Map([
          ["a", 1],
          ["b", 2],
        ]),
      ),
    ).toBe(false);
    expect(isEqual(new Map([["a", new Map([["b", 1]])]]), new Map([["a", new Map([["b", 1]])]]))).toBe(true);
  });

  it("compares Dates", () => {
    expect(isEqual(new Date("2024-01-01"), new Date("2024-01-01"))).toBe(true);
    expect(isEqual(new Date("2024-01-01"), new Date("2024-01-02"))).toBe(false);
  });

  it("handles null and undefined", () => {
    expect(isEqual(null, null)).toBe(true);
    expect(isEqual(undefined, undefined)).toBe(true);
    expect(isEqual(null, undefined)).toBe(false);
    expect(isEqual({}, null)).toBe(false);
  });

  it("handles NaN", () => {
    expect(isEqual(Number.NaN, Number.NaN)).toBe(true);
    expect(isEqual([Number.NaN], [Number.NaN])).toBe(true);
  });

  it("handles circular references", () => {
    interface Ring {
      a: number;
      self?: Ring;
    }
    const x: Ring = { a: 1 };
    x.self = x;
    const y: Ring = { a: 1 };
    y.self = y;
    expect(isEqual(x, y)).toBe(true);

    const z: Ring = { a: 2 };
    z.self = z;
    expect(isEqual(x, z)).toBe(false);
  });

  it("handles cross-referenced circular structures", () => {
    const a: { ref?: unknown } = {};
    const b: { ref?: unknown } = {};
    a.ref = b;
    b.ref = a;

    const c: { ref?: unknown } = {};
    const d: { ref?: unknown } = {};
    c.ref = d;
    d.ref = c;

    expect(isEqual(a, c)).toBe(true);
  });

  it("compares RegExp by source and flags", () => {
    expect(isEqual(/foo/gi, /foo/gi)).toBe(true);
    expect(isEqual(/foo/g, /foo/i)).toBe(false);
    expect(isEqual(/foo/, /bar/)).toBe(false);
  });

  it("compares Errors by name and message", () => {
    expect(isEqual(new Error("x"), new Error("x"))).toBe(true);
    expect(isEqual(new Error("x"), new Error("y"))).toBe(false);
    expect(isEqual(new TypeError("x"), new Error("x"))).toBe(false);
  });

  it("compares ArrayBuffers byte-wise", () => {
    const a = new ArrayBuffer(4);
    const b = new ArrayBuffer(4);
    new Uint8Array(a).set([1, 2, 3, 4]);
    new Uint8Array(b).set([1, 2, 3, 4]);
    expect(isEqual(a, b)).toBe(true);

    new Uint8Array(b)[0] = 99;
    expect(isEqual(a, b)).toBe(false);

    expect(isEqual(new ArrayBuffer(4), new ArrayBuffer(8))).toBe(false);
  });

  it("compares TypedArrays by constructor and bytes", () => {
    expect(isEqual(new Uint8Array([1, 2, 3]), new Uint8Array([1, 2, 3]))).toBe(true);
    expect(isEqual(new Uint8Array([1, 2, 3]), new Uint8Array([1, 2, 4]))).toBe(false);
    expect(isEqual(new Uint8Array([1, 2]), new Int8Array([1, 2]))).toBe(false);
    // Same constructor, different byteLength
    expect(isEqual(new Uint8Array([1, 2, 3]), new Uint8Array([1, 2]))).toBe(false);
  });
});
