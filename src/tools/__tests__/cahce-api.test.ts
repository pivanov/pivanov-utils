import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

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
} from '../cahce-api';

// Mock Cache API
const mockCache = {
  put: vi.fn(),
  match: vi.fn(),
  delete: vi.fn(),
  keys: vi.fn(),
};

const mockCaches = {
  open: vi.fn().mockResolvedValue(mockCache),
};

// @ts-expect-error Mock global caches
global.caches = mockCaches;

describe('Cache API Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCache.put.mockReset();
    mockCache.match.mockReset();
    mockCache.delete.mockReset();
    mockCache.keys.mockReset();
  });

  describe('stringifyBigIntValues', () => {
    it('should convert BigInt to string', () => {
      const bigIntValue = BigInt(9007199254740991);
      expect(stringifyBigIntValues('test', bigIntValue)).toBe('9007199254740991');
    });

    it('should not modify non-BigInt values', () => {
      expect(stringifyBigIntValues('test', 42)).toBe(42);
      expect(stringifyBigIntValues('test', 'string')).toBe('string');
      expect(stringifyBigIntValues('test', null)).toBe(null);
    });
  });

  describe('storageSetItem', () => {
    it('should store value in cache', async () => {
      const value = { test: 'data' };
      await storageSetItem('testCache', 'testKey', value);

      expect(mockCaches.open).toHaveBeenCalledWith('testCache');
      expect(mockCache.put).toHaveBeenCalledWith(
        expect.any(Request),
        expect.any(Response),
      );
      const request = mockCache.put.mock.calls[0][0];
      expect(request.url).toBe('https://cache.internal/testKey');
    });

    it('should handle BigInt values correctly', async () => {
      const value = { id: BigInt(123) };
      await storageSetItem('testCache', 'testKey', value);

      expect(mockCache.put).toHaveBeenCalledWith(
        expect.any(Request),
        expect.any(Response),
      );
      const request = mockCache.put.mock.calls[0][0];
      expect(request.url).toBe('https://cache.internal/testKey');
    });

    it('should handle keys with https:// prefix', async () => {
      const value = { test: 'data' };
      const fullUrl = 'https://example.com/api/data';
      await storageSetItem('testCache', fullUrl, value);

      expect(mockCache.put).toHaveBeenCalledWith(
        expect.any(Request),
        expect.any(Response),
      );
      const request = mockCache.put.mock.calls[0][0];
      expect(request.url).toBe(fullUrl);
    });

    it('should handle keys with http:// prefix', async () => {
      const value = { test: 'data' };
      const fullUrl = 'http://example.com/api/data';
      await storageSetItem('testCache', fullUrl, value);

      expect(mockCache.put).toHaveBeenCalledWith(
        expect.any(Request),
        expect.any(Response),
      );
      const request = mockCache.put.mock.calls[0][0];
      expect(request.url).toBe(fullUrl);
    });
  });

  describe('storageGetItem', () => {
    it('should retrieve stored value', async () => {
      const mockValue = { test: 'data' };
      mockCache.match.mockResolvedValue(
        new Response(JSON.stringify(mockValue)),
      );

      const result = await storageGetItem('testCache', 'testKey');
      expect(result).toEqual(mockValue);
      expect(mockCache.match).toHaveBeenCalledWith(expect.any(Request));
      const request = mockCache.match.mock.calls[0][0];
      expect(request.url).toBe('https://cache.internal/testKey');
    });

    it('should return null for non-existent key', async () => {
      mockCache.match.mockResolvedValue(null);

      const result = await storageGetItem('testCache', 'nonExistentKey');
      expect(result).toBeNull();
    });
  });

  describe('storageRemoveItem', () => {
    it('should remove item from cache', async () => {
      await storageRemoveItem('testCache', 'testKey');

      expect(mockCache.delete).toHaveBeenCalledWith(expect.any(Request));
      const request = mockCache.delete.mock.calls[0][0];
      expect(request.url).toBe('https://cache.internal/testKey');
    });
  });

  describe('storageClear', () => {
    it('should clear all items from cache', async () => {
      mockCache.keys.mockResolvedValue([
        new Request('https://cache.internal/testKey1'),
        new Request('https://cache.internal/testKey2'),
      ]);

      await storageClear('testCache');

      expect(mockCache.delete).toHaveBeenCalledTimes(2);
    });
  });

  describe('storageClearByPrefixOrSuffix', () => {
    beforeEach(() => {
      mockCache.keys.mockResolvedValue([
        new Request('https://cache.internal/prefix_key1'),
        new Request('https://cache.internal/prefix_key2'),
        new Request('https://cache.internal/other_key'),
        new Request('https://cache.internal/'),
      ]);
    });

    it('should clear items by prefix', async () => {
      await storageClearByPrefixOrSuffix('testCache', 'prefix_', true);
      expect(mockCache.delete).toHaveBeenCalledTimes(2);
    });

    it('should clear items by suffix', async () => {
      await storageClearByPrefixOrSuffix('testCache', 'key1', false);
      expect(mockCache.delete).toHaveBeenCalledTimes(1);
    });

    it('should handle empty keys correctly', async () => {
      await storageClearByPrefixOrSuffix('testCache', '', true);
      expect(mockCache.delete).toHaveBeenCalledTimes(4);
    });
  });

  describe('storageExists', () => {
    it('should return true for existing key', async () => {
      mockCache.match.mockResolvedValue(new Response());

      const result = await storageExists('testCache', 'testKey');
      expect(result).toBe(true);
      expect(mockCache.match).toHaveBeenCalledWith(expect.any(Request));
      const request = mockCache.match.mock.calls[0][0];
      expect(request.url).toBe('https://cache.internal/testKey');
    });

    it('should return false for non-existent key', async () => {
      mockCache.match.mockResolvedValue(undefined);

      const result = await storageExists('testCache', 'nonExistentKey');
      expect(result).toBe(false);
    });
  });

  describe('storageGetAllKeys', () => {
    it('should return all cache keys', async () => {
      mockCache.keys.mockResolvedValue([
        new Request('https://cache.internal/key1'),
        new Request('https://cache.internal/key2'),
      ]);

      const result = await storageGetAllKeys('testCache');
      expect(result).toEqual([
        'key1',
        'key2',
      ]);
    });

    it('should handle URLs without path components', async () => {
      mockCache.keys.mockResolvedValue([
        new Request('https://cache.internal'),
        new Request('https://cache.internal/'),
      ]);

      const result = await storageGetAllKeys('testCache');
      expect(result).toEqual(['', '']);
    });
  });

  describe('storageCalculateSize', () => {
    beforeEach(() => {
      const mockResponse = new Response(JSON.stringify({ data: 'test' }));
      mockCache.match.mockResolvedValue(mockResponse);
    });

    it('should calculate size for specific cache key', async () => {
      const result = await storageCalculateSize('testCache', 'testKey');
      expect(result).toBeGreaterThan(0);
      expect(mockCache.match).toHaveBeenCalledWith(expect.any(Request));
      const request = mockCache.match.mock.calls[0][0];
      expect(request.url).toBe('https://cache.internal/testKey');
    });

    it('should calculate total cache size', async () => {
      mockCache.keys.mockResolvedValue([
        new Request('https://cache.internal/key1'),
        new Request('https://cache.internal/key2'),
      ]);

      const result = await storageCalculateSize('testCache');
      expect(result).toBeGreaterThan(0);
    });

    it('should return 0 for non-existent key', async () => {
      mockCache.match.mockResolvedValue(null);
      const result = await storageCalculateSize('testCache', 'nonExistentKey');
      expect(result).toBe(0);
    });

    it('should handle null response when calculating total size', async () => {
      mockCache.keys.mockResolvedValue([
        new Request('https://cache.internal/key1'),
        new Request('https://cache.internal/key2'),
      ]);
      mockCache.match.mockResolvedValue(null);

      const result = await storageCalculateSize('testCache');
      expect(result).toBe(0);
    });

    it('should throw error when cache.open fails', async () => {
      mockCaches.open.mockRejectedValueOnce(new Error('Failed to open cache'));

      await expect(storageCalculateSize('testCache')).rejects.toThrow(
        'Failed to open cache',
      );
    });

    it('should throw error when cache.match fails', async () => {
      mockCache.match.mockRejectedValueOnce(
        new Error('Failed to match cache entry'),
      );

      await expect(
        storageCalculateSize('testCache', 'testKey'),
      ).rejects.toThrow('Failed to match cache entry');
    });

    it('should throw error when cache.keys fails', async () => {
      mockCache.keys.mockRejectedValueOnce(
        new Error('Failed to get cache keys'),
      );

      await expect(storageCalculateSize('testCache')).rejects.toThrow(
        'Failed to get cache keys',
      );
    });

    it('should handle empty cache', async () => {
      mockCache.keys.mockResolvedValue([]);

      const result = await storageCalculateSize('testCache');
      expect(result).toBe(0);
    });

    it('should handle large cache entries', async () => {
      const largeData = new ArrayBuffer(1024 * 1024);
      const mockLargeResponse = new Response(largeData);
      mockCache.match.mockResolvedValue(mockLargeResponse);
      mockCache.keys.mockResolvedValue([
        new Request('https://cache.internal/key1'),
        new Request('https://cache.internal/key2'),
      ]);

      const result = await storageCalculateSize('testCache');
      expect(result).toBe(2 * 1024 * 1024);
    });

    it('should handle mixed response types', async () => {
      const textResponse = new Response('Hello World');
      const jsonResponse = new Response(JSON.stringify({ data: 'test' }));
      const binaryResponse = new Response(new ArrayBuffer(100));

      mockCache.keys.mockResolvedValue([
        new Request('https://cache.internal/text'),
        new Request('https://cache.internal/json'),
        new Request('https://cache.internal/binary'),
      ]);

      mockCache.match
        .mockResolvedValueOnce(textResponse)
        .mockResolvedValueOnce(jsonResponse)
        .mockResolvedValueOnce(binaryResponse);

      const result = await storageCalculateSize('testCache');
      expect(result).toBeGreaterThan(0);
    });
  });
});
