import { afterEach, describe, expect, it } from "bun:test";

import * as cache from "../index";
import { installFakeCacheStorage, uninstallCacheStorage } from "./fake-cache-storage";

afterEach(() => {
  uninstallCacheStorage();
});

describe("cache entry point exports", () => {
  it("exposes the raw response layer", () => {
    const expected = [
      "cachePutResponse",
      "cacheMatchResponse",
      "cacheDeleteResponse",
      "cacheHasResponse",
      "cacheResponseKeys",
      "cacheClear",
      "cacheNames",
      "cacheExists",
      "cacheDelete",
    ];

    for (const name of expected) {
      expect((cache as Record<string, unknown>)[name]).toBeTypeOf("function");
    }
  });

  it("exposes the JSON and TTL storage layer", () => {
    const expected = [
      "storageSetItem",
      "storageGetItem",
      "storageSetItemWithTTL",
      "storageGetItemWithTTL",
      "storageRemoveItem",
      "storageClear",
      "storageClearByPrefix",
      "storageClearBySuffix",
      "storageClearByPrefixOrSuffix",
      "storageExists",
      "storageGetAllKeys",
      "storageCalculateSize",
      "stringifyBigIntValues",
      "isCacheStorageSupported",
    ];

    for (const name of expected) {
      expect((cache as Record<string, unknown>)[name]).toBeTypeOf("function");
    }
  });

  it("leaks nothing from React, the event bus or the DOM helpers", () => {
    const forbidden = ["useEventBus", "busDispatch", "busSubscribe", "isBrowser", "checkVisibility", "setStyleProperties", "deepClone", "isEqual"];

    for (const name of forbidden) {
      expect((cache as Record<string, unknown>)[name]).toBeUndefined();
    }
  });
});

describe("isCacheStorageSupported", () => {
  it("is true when Cache Storage is present", () => {
    installFakeCacheStorage();
    expect(cache.isCacheStorageSupported()).toBe(true);
  });

  it("is false when the runtime has no caches global", () => {
    uninstallCacheStorage();
    expect(cache.isCacheStorageSupported()).toBe(false);
  });

  it("makes cache helpers throw a descriptive error when unsupported", () => {
    uninstallCacheStorage();
    expect(cache.cacheNames()).rejects.toThrow("Cache Storage is not available");
  });
});
