import { bench, group, summary } from "mitata";

import { deepMerge, groupBy, mapValues, merge, omit, pick } from "../src/object";

const obj = {
  id: 1,
  name: "Ada",
  email: "ada@example.com",
  age: 30,
  active: true,
};

const nestedA = {
  user: { name: "Ada", prefs: { theme: "dark" } },
  meta: { version: 1 },
};
const nestedB = {
  user: { prefs: { fontSize: 14 } },
  meta: { ts: Date.now() },
};

const items = Array.from({ length: 500 }, (_, i) => ({
  id: i,
  category: ["a", "b", "c"][i % 3],
}));

group("pick / omit", () => {
  summary(() => {
    bench("pick 2 keys from 5", () => pick(obj, ["name", "email"]));
    bench("omit 2 keys from 5", () => omit(obj, ["age", "active"]));
  });
});

group("merge / deepMerge", () => {
  summary(() => {
    bench("merge shallow", () => merge({ a: 1 }, { b: 2 }, { c: 3 }));
    bench("deepMerge nested", () => deepMerge(nestedA, nestedB as typeof nestedA));
  });
});

group("mapValues (500 keys)", () => {
  const big = Object.fromEntries(Array.from({ length: 500 }, (_, i) => [`k${i}`, i]));
  summary(() => {
    bench("mapValues", () => mapValues(big, (v) => v * 2));
  });
});

group("groupBy (500 items)", () => {
  summary(() => {
    bench("groupBy by category", () => groupBy(items, (x) => x.category));
  });
});
