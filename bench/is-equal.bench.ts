import { bench, group, summary } from "mitata";

import { isEqual } from "../src/tools/isEqual";

const a1 = { id: 1, name: "Ada", tags: ["a", "b"] };
const a2 = { id: 1, name: "Ada", tags: ["a", "b"] };

const b1 = { id: 1, name: "Ada", tags: ["a", "b"] };
const b2 = { id: 1, name: "Ada", tags: ["a", "c"] };

const deep1 = {
  user: { name: "Ada", age: 30 },
  prefs: { theme: "dark", notifications: { email: true, sms: false } },
  tags: ["admin", "beta"],
};
const deep2 = {
  user: { name: "Ada", age: 30 },
  prefs: { theme: "dark", notifications: { email: true, sms: false } },
  tags: ["admin", "beta"],
};

const large1 = {
  items: Array.from({ length: 200 }, (_, i) => ({ id: i, value: i * 2 })),
};
const large2 = {
  items: Array.from({ length: 200 }, (_, i) => ({ id: i, value: i * 2 })),
};

const naiveJsonEqual = (a: unknown, b: unknown): boolean => {
  return JSON.stringify(a) === JSON.stringify(b);
};

group("isEqual:small equal objects", () => {
  summary(() => {
    bench("isEqual", () => isEqual(a1, a2));
    bench("JSON.stringify baseline", () => naiveJsonEqual(a1, a2));
  });
});

group("isEqual:small unequal objects", () => {
  summary(() => {
    bench("isEqual", () => isEqual(b1, b2));
    bench("JSON.stringify baseline", () => naiveJsonEqual(b1, b2));
  });
});

group("isEqual:deeply nested", () => {
  summary(() => {
    bench("isEqual", () => isEqual(deep1, deep2));
    bench("JSON.stringify baseline", () => naiveJsonEqual(deep1, deep2));
  });
});

group("isEqual:large array (200 items)", () => {
  summary(() => {
    bench("isEqual", () => isEqual(large1, large2));
    bench("JSON.stringify baseline", () => naiveJsonEqual(large1, large2));
  });
});
