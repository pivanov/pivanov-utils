/**
 * A faithful in-memory stand-in for the browser Cache Storage API.
 *
 * Bun and happy-dom do not provide `caches`, and the raw-response helpers are
 * only meaningful against a store that round-trips real bytes, so the fake
 * keeps the body, status, status text and headers of every entry exactly as a
 * browser would.
 */

const BASE_URL = "https://cache.test/";

const keyOf = (request: RequestInfo | URL): string => {
  if (typeof request === "string") {
    return new URL(request, BASE_URL).href;
  }
  if (request instanceof URL) {
    return request.href;
  }
  return request.url;
};

const withoutSearch = (url: string): string => {
  const parsed = new URL(url);
  parsed.search = "";
  return parsed.href;
};

interface IStoredEntry {
  url: string;
  body: ArrayBuffer;
  status: number;
  statusText: string;
  headers: [string, string][];
}

export class FakeCache {
  readonly entries = new Map<string, IStoredEntry>();

  async put(request: RequestInfo | URL, response: Response): Promise<void> {
    if (response.bodyUsed) {
      throw new TypeError("Response body is already used");
    }
    const url = keyOf(request);
    const body = await response.arrayBuffer();
    this.entries.set(url, {
      url,
      body,
      status: response.status,
      statusText: response.statusText,
      headers: [...response.headers.entries()],
    });
  }

  async match(request: RequestInfo | URL, options?: CacheQueryOptions): Promise<Response | undefined> {
    const entry = this.lookup(request, options);
    if (!entry) {
      return undefined;
    }
    return new Response(entry.body, {
      status: entry.status,
      statusText: entry.statusText,
      headers: entry.headers,
    });
  }

  async delete(request: RequestInfo | URL, options?: CacheQueryOptions): Promise<boolean> {
    const entry = this.lookup(request, options);
    if (!entry) {
      return false;
    }
    return this.entries.delete(entry.url);
  }

  async keys(): Promise<Request[]> {
    return [...this.entries.values()].map((entry) => new Request(entry.url));
  }

  private lookup(request: RequestInfo | URL, options?: CacheQueryOptions): IStoredEntry | undefined {
    const url = keyOf(request);
    if (!options?.ignoreSearch) {
      return this.entries.get(url);
    }
    const target = withoutSearch(url);
    for (const entry of this.entries.values()) {
      if (withoutSearch(entry.url) === target) {
        return entry;
      }
    }
    return undefined;
  }
}

export class FakeCacheStorage {
  readonly caches = new Map<string, FakeCache>();

  async open(cacheName: string): Promise<FakeCache> {
    const existing = this.caches.get(cacheName);
    if (existing) {
      return existing;
    }
    const created = new FakeCache();
    this.caches.set(cacheName, created);
    return created;
  }

  async has(cacheName: string): Promise<boolean> {
    return this.caches.has(cacheName);
  }

  async keys(): Promise<string[]> {
    return [...this.caches.keys()];
  }

  async delete(cacheName: string): Promise<boolean> {
    return this.caches.delete(cacheName);
  }
}

/** Installs a fresh fake `caches` global and returns it. */
export const installFakeCacheStorage = (): FakeCacheStorage => {
  const storage = new FakeCacheStorage();
  (globalThis as unknown as { caches: unknown }).caches = storage;
  return storage;
};

/** Removes the `caches` global, simulating a runtime without Cache Storage. */
export const uninstallCacheStorage = (): void => {
  (globalThis as unknown as { caches?: unknown }).caches = undefined;
};
