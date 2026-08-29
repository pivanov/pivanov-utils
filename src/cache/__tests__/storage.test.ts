import { beforeEach, describe, expect, it, mock } from "bun:test";

import {
  storageCalculateSize,
  storageClear,
  storageClearByPrefixOrSuffix,
  storageExists,
  storageGetAllKeys,
  storageGetItem,
  storageRemoveItem,
  storageSetItem,
  stringifyBigIntValues,
} from "../storage";

const mockCache = {
  put: mock(async () => {}),
  match: mock(async (_req: Request) => undefined as Response | null | undefined),
  delete: mock(async (_req: Request) => true),
  keys: mock(async () => [] as Request[]),
};

const mockCaches = {
  open: mock(async (_name: string) => mockCache),
};

const resetMocks = () => {
  (globalThis as unknown as { caches: typeof mockCaches }).caches = mockCaches;
  mockCache.put.mockReset();
  mockCache.put.mockImplementation(async () => {});
  mockCache.match.mockReset();
  mockCache.match.mockImplementation(async () => undefined);
  mockCache.delete.mockReset();
  mockCache.delete.mockImplementation(async () => true);
  mockCache.keys.mockReset();
  mockCache.keys.mockImplementation(async () => []);
  mockCaches.open.mockReset();
  mockCaches.open.mockImplementation(async () => mockCache);
};

describe("Cache API Utils", () => {
  beforeEach(resetMocks);

  describe("stringifyBigIntValues", () => {
    it("converts BigInt to string", () => {
      expect(stringifyBigIntValues("test", BigInt(9007199254740991))).toBe("9007199254740991");
    });

    it("does not modify non-BigInt values", () => {
      expect(stringifyBigIntValues("test", 42)).toBe(42);
      expect(stringifyBigIntValues("test", "string")).toBe("string");
      expect(stringifyBigIntValues("test", null)).toBe(null);
    });
  });

  describe("storageSetItem", () => {
    it("stores value in cache with internal key", async () => {
      await storageSetItem("testCache", "testKey", { test: "data" });
      expect(mockCaches.open).toHaveBeenCalledWith("testCache");
      const [request] = mockCache.put.mock.calls[0] as [Request, Response];
      expect(request.url).toBe("https://cache.internal/testKey");
    });

    it("handles BigInt values", async () => {
      await storageSetItem("testCache", "testKey", { id: BigInt(123) });
      expect(mockCache.put).toHaveBeenCalled();
    });

    it("preserves keys with https:// prefix", async () => {
      const fullUrl = "https://example.com/api/data";
      await storageSetItem("testCache", fullUrl, { test: "data" });
      const [request] = mockCache.put.mock.calls[0] as [Request, Response];
      expect(request.url).toBe(fullUrl);
    });

    it("preserves keys with http:// prefix", async () => {
      const fullUrl = "http://example.com/api/data";
      await storageSetItem("testCache", fullUrl, { test: "data" });
      const [request] = mockCache.put.mock.calls[0] as [Request, Response];
      expect(request.url).toBe(fullUrl);
    });
  });

  describe("storageGetItem", () => {
    it("retrieves stored value", async () => {
      const value = { test: "data" };
      mockCache.match.mockImplementation(async () => new Response(JSON.stringify(value)));
      expect(await storageGetItem("testCache", "testKey")).toEqual(value);
    });

    it("returns null for non-existent key", async () => {
      mockCache.match.mockImplementation(async () => null);
      expect(await storageGetItem("testCache", "nope")).toBeNull();
    });
  });

  describe("storageRemoveItem", () => {
    it("removes item from cache", async () => {
      await storageRemoveItem("testCache", "testKey");
      const [request] = mockCache.delete.mock.calls[0] as [Request];
      expect(request.url).toBe("https://cache.internal/testKey");
    });
  });

  describe("storageClear", () => {
    it("clears all items from cache", async () => {
      mockCache.keys.mockImplementation(async () => [new Request("https://cache.internal/testKey1"), new Request("https://cache.internal/testKey2")]);
      await storageClear("testCache");
      expect(mockCache.delete).toHaveBeenCalledTimes(2);
    });
  });

  describe("storageClearByPrefixOrSuffix", () => {
    beforeEach(() => {
      mockCache.keys.mockImplementation(async () => [
        new Request("https://cache.internal/prefix_key1"),
        new Request("https://cache.internal/prefix_key2"),
        new Request("https://cache.internal/other_key"),
        new Request("https://cache.internal/"),
      ]);
    });

    it("clears items by prefix", async () => {
      await storageClearByPrefixOrSuffix("testCache", "prefix_", true);
      expect(mockCache.delete).toHaveBeenCalledTimes(2);
    });

    it("clears items by suffix", async () => {
      await storageClearByPrefixOrSuffix("testCache", "key1", false);
      expect(mockCache.delete).toHaveBeenCalledTimes(1);
    });

    it("handles empty keys", async () => {
      await storageClearByPrefixOrSuffix("testCache", "", true);
      expect(mockCache.delete).toHaveBeenCalledTimes(4);
    });
  });

  describe("storageExists", () => {
    it("returns true for existing key", async () => {
      mockCache.match.mockImplementation(async () => new Response());
      expect(await storageExists("testCache", "k")).toBe(true);
    });

    it("returns false for non-existent key", async () => {
      mockCache.match.mockImplementation(async () => undefined);
      expect(await storageExists("testCache", "k")).toBe(false);
    });
  });

  describe("storageGetAllKeys", () => {
    it("returns all cache keys", async () => {
      mockCache.keys.mockImplementation(async () => [new Request("https://cache.internal/key1"), new Request("https://cache.internal/key2")]);
      expect(await storageGetAllKeys("testCache")).toEqual(["key1", "key2"]);
    });

    it("handles URLs without path components", async () => {
      mockCache.keys.mockImplementation(async () => [new Request("https://cache.internal/")]);
      expect(await storageGetAllKeys("testCache")).toEqual([""]);
    });
  });

  describe("storageCalculateSize", () => {
    it("calculates size for a specific key", async () => {
      mockCache.match.mockImplementation(async () => new Response(JSON.stringify({ data: "test" })));
      expect(await storageCalculateSize("testCache", "testKey")).toBeGreaterThan(0);
    });

    it("calculates total cache size", async () => {
      mockCache.keys.mockImplementation(async () => [new Request("https://cache.internal/key1"), new Request("https://cache.internal/key2")]);
      mockCache.match.mockImplementation(async () => new Response(JSON.stringify({ data: "test" })));
      expect(await storageCalculateSize("testCache")).toBeGreaterThan(0);
    });

    it("returns 0 for non-existent key", async () => {
      mockCache.match.mockImplementation(async () => null);
      expect(await storageCalculateSize("testCache", "missing")).toBe(0);
    });

    it("handles null response when calculating total size", async () => {
      mockCache.keys.mockImplementation(async () => [new Request("https://cache.internal/key1")]);
      mockCache.match.mockImplementation(async () => null);
      expect(await storageCalculateSize("testCache")).toBe(0);
    });

    it("throws when cache.open fails", async () => {
      mockCaches.open.mockImplementation(async () => {
        throw new Error("Failed to open cache");
      });
      await expect(storageCalculateSize("testCache")).rejects.toThrow("Failed to open cache");
    });

    it("handles empty cache", async () => {
      mockCache.keys.mockImplementation(async () => []);
      expect(await storageCalculateSize("testCache")).toBe(0);
    });

    it("sums sizes of large entries", async () => {
      mockCache.match.mockImplementation(async () => new Response(new ArrayBuffer(1024 * 1024)));
      mockCache.keys.mockImplementation(async () => [new Request("https://cache.internal/key1"), new Request("https://cache.internal/key2")]);
      expect(await storageCalculateSize("testCache")).toBe(2 * 1024 * 1024);
    });
  });
});

import { storageClearByPrefix, storageClearBySuffix, storageGetItemWithTTL, storageSetItemWithTTL } from "../storage";

describe("Cache API new APIs", () => {
  beforeEach(resetMocks);

  describe("storageClearByPrefix / storageClearBySuffix", () => {
    beforeEach(() => {
      mockCache.keys.mockImplementation(async () => [
        new Request("https://cache.internal/foo_1"),
        new Request("https://cache.internal/foo_2"),
        new Request("https://cache.internal/other"),
      ]);
    });

    it("clears by prefix", async () => {
      await storageClearByPrefix("c", "foo_");
      expect(mockCache.delete).toHaveBeenCalledTimes(2);
    });

    it("clears by suffix", async () => {
      await storageClearBySuffix("c", "_2");
      expect(mockCache.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe("TTL storage", () => {
    let stored: unknown;
    beforeEach(() => {
      stored = undefined;
      mockCache.put.mockImplementation(async (_req: Request, res: Response) => {
        stored = await res.clone().text();
      });
      mockCache.match.mockImplementation(async () =>
        typeof stored === "string"
          ? new Response(stored, {
              headers: { "Content-Type": "application/json" },
            })
          : null,
      );
    });

    it("round-trips within TTL", async () => {
      await storageSetItemWithTTL("c", "k", "hello", 1_000);
      expect(await storageGetItemWithTTL<string>("c", "k")).toBe("hello");
    });

    it("returns null and deletes after expiry", async () => {
      await storageSetItemWithTTL("c", "k", "hello", -1);
      expect(await storageGetItemWithTTL<string>("c", "k")).toBeNull();
      expect(mockCache.delete).toHaveBeenCalled();
    });

    it("returns null for non-envelope values", async () => {
      mockCache.match.mockImplementation(async () => new Response(JSON.stringify({ plain: "value" })));
      expect(await storageGetItemWithTTL("c", "k")).toBeNull();
    });
  });
});
