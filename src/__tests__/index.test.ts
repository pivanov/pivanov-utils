import { describe, expect, it } from "bun:test";

import * as utils from "../index";

describe("barrel file exports", () => {
  it("exposes utilities from every module", () => {
    const expected = [
      "isBoolean",
      "isNumber",
      "isString",
      "isFunction",
      "isObject",
      "isNull",
      "isUndefined",
      "pick",
      "omit",
      "merge",
      "deepMerge",
      "sleep",
      "camelCase",
      "pascalCase",
      "kebabCase",
      "slugify",
      "capitalize",
      "uncapitalize",
      "capitalizeFirstLetter",
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
      "stringifyBigIntValues",
    ];

    for (const name of expected) {
      expect((utils as Record<string, unknown>)[name]).toBeDefined();
    }
  });
});
