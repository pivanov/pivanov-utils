import { bench, group, summary } from "mitata";

import { deepClone } from "../src/tools/deepClone";

const small = {
  id: 1,
  name: "Ada",
  active: true,
  tags: ["a", "b", "c"],
};

const medium = {
  id: 42,
  user: { name: "Ada", age: 30, email: "ada@example.com" },
  prefs: { theme: "dark", lang: "en", notifications: { email: true, sms: false } },
  tags: ["admin", "beta", "early-access"],
  createdAt: new Date(),
  meta: { version: 1, ts: Date.now() },
};

const large = {
  items: Array.from({ length: 500 }, (_, i) => ({
    id: i,
    label: `item-${i}`,
    values: [i, i * 2, i * 3],
    meta: { tags: ["x", "y"], active: i % 2 === 0 },
  })),
};

const withCycle: { a: number; self?: unknown } = { a: 1 };
withCycle.self = withCycle;

const withBuiltins = {
  date: new Date(),
  map: new Map<string, number>([
    ["a", 1],
    ["b", 2],
  ]),
  set: new Set([1, 2, 3]),
  regex: /test/gi,
  typed: new Uint8Array([1, 2, 3, 4, 5]),
};

group("deepClone:small object", () => {
  summary(() => {
    bench("deepClone", () => deepClone(small));
    bench("structuredClone", () => structuredClone(small));
  });
});

group("deepClone:medium object", () => {
  summary(() => {
    bench("deepClone", () => deepClone(medium));
    bench("structuredClone", () => structuredClone(medium));
  });
});

group("deepClone:large object (500 items)", () => {
  summary(() => {
    bench("deepClone", () => deepClone(large));
    bench("structuredClone", () => structuredClone(large));
  });
});

group("deepClone:circular reference", () => {
  summary(() => {
    bench("deepClone", () => deepClone(withCycle));
    bench("structuredClone", () => structuredClone(withCycle));
  });
});

group("deepClone:built-ins (Date, Map, Set, RegExp, TypedArray)", () => {
  summary(() => {
    bench("deepClone", () => deepClone(withBuiltins));
    bench("structuredClone", () => structuredClone(withBuiltins));
  });
});
