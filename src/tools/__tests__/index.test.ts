import { describe, expect, it } from "bun:test";

import * as tools from "../index";

describe("tools barrel exports", () => {
  it("exposes deepClone, isEqual, dom, eventBus and cache utilities", () => {
    const expected = [
      "deepClone",
      "isEqual",
      "isBrowser",
      "checkVisibility",
      "setStyleProperties",
      "calculateRenderedTextWidth",
      "busDispatch",
      "busSubscribe",
      "useEventBus",
      "storageSetItem",
      "storageGetItem",
      "storageRemoveItem",
      "storageClear",
      "storageExists",
      "storageGetAllKeys",
      "storageCalculateSize",
      "storageClearByPrefixOrSuffix",
    ];

    for (const name of expected) {
      expect((tools as Record<string, unknown>)[name]).toBeDefined();
    }
  });
});
