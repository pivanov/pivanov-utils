import { afterEach, beforeEach, describe, expect, it } from "bun:test";

import {
  cacheClear,
  cacheDelete,
  cacheDeleteResponse,
  cacheExists,
  cacheHasResponse,
  cacheMatchResponse,
  cacheNames,
  cachePutResponse,
  cacheResponseKeys,
} from "../response";
import { type FakeCacheStorage, installFakeCacheStorage, uninstallCacheStorage } from "./fake-cache-storage";

const CACHE = "assets-v1";

let storage: FakeCacheStorage;

beforeEach(() => {
  storage = installFakeCacheStorage();
});

afterEach(() => {
  uninstallCacheStorage();
});

describe("cachePutResponse / cacheMatchResponse", () => {
  it("round-trips JavaScript byte for byte", async () => {
    const source = "export const add = (a, b) => a + b;\n";
    const response = new Response(source, {
      headers: { "Content-Type": "text/javascript; charset=utf-8" },
    });

    await cachePutResponse(CACHE, "/assets/app.abc123.js", response);
    const hit = await cacheMatchResponse(CACHE, "/assets/app.abc123.js");

    expect(hit).toBeDefined();
    expect(await (hit as Response).text()).toBe(source);
  });

  it("round-trips CSS and preserves the content type", async () => {
    const source = ":root { --brand: #ff0080; }";
    await cachePutResponse(CACHE, "/assets/app.abc123.css", new Response(source, { headers: { "Content-Type": "text/css" } }));

    const hit = await cacheMatchResponse(CACHE, "/assets/app.abc123.css");

    expect(hit?.headers.get("Content-Type")).toBe("text/css");
    expect(await (hit as Response).text()).toBe(source);
  });

  it("round-trips binary content without corrupting bytes", async () => {
    const bytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0xff]);
    await cachePutResponse(CACHE, "/assets/logo.png", new Response(bytes, { headers: { "Content-Type": "image/png" } }));

    const hit = await cacheMatchResponse(CACHE, "/assets/logo.png");
    const roundTripped = new Uint8Array(await (hit as Response).arrayBuffer());

    expect(hit?.headers.get("Content-Type")).toBe("image/png");
    expect([...roundTripped]).toEqual([...bytes]);
  });

  it("round-trips a Blob body", async () => {
    const blob = new Blob(["woff2-ish payload"], { type: "font/woff2" });
    await cachePutResponse(CACHE, "/assets/inter.woff2", new Response(blob, { headers: { "Content-Type": "font/woff2" } }));

    const hit = await cacheMatchResponse(CACHE, "/assets/inter.woff2");

    expect(await (hit as Response).text()).toBe("woff2-ish payload");
    expect(hit?.headers.get("Content-Type")).toBe("font/woff2");
  });

  it("preserves arbitrary headers", async () => {
    await cachePutResponse(
      CACHE,
      "/assets/app.js",
      new Response("noop", {
        headers: {
          "Content-Type": "text/javascript",
          "Cache-Control": "public, max-age=31536000, immutable",
          ETag: '"abc123"',
        },
      }),
    );

    const hit = await cacheMatchResponse(CACHE, "/assets/app.js");

    expect(hit?.headers.get("Cache-Control")).toBe("public, max-age=31536000, immutable");
    expect(hit?.headers.get("ETag")).toBe('"abc123"');
  });

  it("preserves non-2xx status codes and status text", async () => {
    await cachePutResponse(CACHE, "/assets/missing.js", new Response("not found", { status: 404, statusText: "Not Found" }));
    await cachePutResponse(CACHE, "/assets/broken.js", new Response("boom", { status: 500 }));

    const missing = await cacheMatchResponse(CACHE, "/assets/missing.js");
    const broken = await cacheMatchResponse(CACHE, "/assets/broken.js");

    expect(missing?.status).toBe(404);
    expect(missing?.statusText).toBe("Not Found");
    expect(await (missing as Response).text()).toBe("not found");
    expect(broken?.status).toBe(500);
  });

  it("leaves the caller's response readable by caching a clone", async () => {
    const response = new Response("still mine", { headers: { "Content-Type": "text/plain" } });

    await cachePutResponse(CACHE, "/assets/shared.txt", response);

    expect(response.bodyUsed).toBe(false);
    expect(await response.text()).toBe("still mine");
    const hit = await cacheMatchResponse(CACHE, "/assets/shared.txt");
    expect(await (hit as Response).text()).toBe("still mine");
  });

  it("does not serialize the body as JSON", async () => {
    await cachePutResponse(CACHE, "/assets/app.js", new Response('const greeting = "hi";'));

    const hit = await cacheMatchResponse(CACHE, "/assets/app.js");

    expect(await (hit as Response).text()).toBe('const greeting = "hi";');
  });

  it("returns a fresh response on every match", async () => {
    await cachePutResponse(CACHE, "/assets/app.js", new Response("reusable"));

    const first = await cacheMatchResponse(CACHE, "/assets/app.js");
    expect(await (first as Response).text()).toBe("reusable");

    const second = await cacheMatchResponse(CACHE, "/assets/app.js");
    expect(await (second as Response).text()).toBe("reusable");
  });

  it("accepts Request and URL keys", async () => {
    await cachePutResponse(CACHE, new Request("https://cache.test/assets/from-request.js"), new Response("req"));
    await cachePutResponse(CACHE, new URL("https://cache.test/assets/from-url.js"), new Response("url"));

    expect(await (await cacheMatchResponse(CACHE, "https://cache.test/assets/from-request.js"))?.text()).toBe("req");
    expect(await (await cacheMatchResponse(CACHE, "https://cache.test/assets/from-url.js"))?.text()).toBe("url");
  });

  it("returns undefined on a miss", async () => {
    expect(await cacheMatchResponse(CACHE, "/assets/never-stored.js")).toBeUndefined();
  });

  it("replaces an existing entry instead of appending", async () => {
    await cachePutResponse(CACHE, "/assets/app.js", new Response("v1"));
    await cachePutResponse(CACHE, "/assets/app.js", new Response("v2"));

    const hit = await cacheMatchResponse(CACHE, "/assets/app.js");

    expect(await (hit as Response).text()).toBe("v2");
    expect(await cacheResponseKeys(CACHE)).toHaveLength(1);
  });

  it("honours ignoreSearch when matching", async () => {
    await cachePutResponse(CACHE, "/assets/app.js?v=1", new Response("busted"));

    expect(await cacheMatchResponse(CACHE, "/assets/app.js")).toBeUndefined();
    expect(await (await cacheMatchResponse(CACHE, "/assets/app.js", { ignoreSearch: true }))?.text()).toBe("busted");
  });

  it("rejects a response whose body was already consumed", async () => {
    const response = new Response("gone");
    await response.text();

    expect(cachePutResponse(CACHE, "/assets/app.js", response)).rejects.toThrow(TypeError);
  });
});

describe("cacheHasResponse", () => {
  it("reports presence without consuming the entry", async () => {
    await cachePutResponse(CACHE, "/assets/app.js", new Response("body"));

    expect(await cacheHasResponse(CACHE, "/assets/app.js")).toBe(true);
    expect(await (await cacheMatchResponse(CACHE, "/assets/app.js"))?.text()).toBe("body");
  });

  it("reports false on a miss", async () => {
    expect(await cacheHasResponse(CACHE, "/assets/app.js")).toBe(false);
  });
});

describe("cacheDeleteResponse", () => {
  it("removes a single entry and reports success", async () => {
    await cachePutResponse(CACHE, "/assets/a.js", new Response("a"));
    await cachePutResponse(CACHE, "/assets/b.js", new Response("b"));

    expect(await cacheDeleteResponse(CACHE, "/assets/a.js")).toBe(true);
    expect(await cacheHasResponse(CACHE, "/assets/a.js")).toBe(false);
    expect(await cacheHasResponse(CACHE, "/assets/b.js")).toBe(true);
  });

  it("reports false when nothing was deleted", async () => {
    expect(await cacheDeleteResponse(CACHE, "/assets/absent.js")).toBe(false);
  });
});

describe("cacheResponseKeys", () => {
  it("lists stored request URLs", async () => {
    await cachePutResponse(CACHE, "/assets/a.js", new Response("a"));
    await cachePutResponse(CACHE, "/assets/b.css", new Response("b"));

    expect((await cacheResponseKeys(CACHE)).sort()).toEqual(["https://cache.test/assets/a.js", "https://cache.test/assets/b.css"]);
  });

  it("returns an empty list for an untouched cache", async () => {
    expect(await cacheResponseKeys(CACHE)).toEqual([]);
  });

  it("supports revision cleanup driven by the key list", async () => {
    await cachePutResponse(CACHE, "/assets/app.rev1.js", new Response("old"));
    await cachePutResponse(CACHE, "/assets/app.rev2.js", new Response("new"));

    const stale = (await cacheResponseKeys(CACHE)).filter((url) => !url.includes("rev2"));
    await Promise.all(stale.map((url) => cacheDeleteResponse(CACHE, url)));

    expect(await cacheResponseKeys(CACHE)).toEqual(["https://cache.test/assets/app.rev2.js"]);
  });
});

describe("cacheClear", () => {
  it("empties the cache but keeps it open", async () => {
    await cachePutResponse(CACHE, "/assets/a.js", new Response("a"));
    await cachePutResponse(CACHE, "/assets/b.js", new Response("b"));

    await cacheClear(CACHE);

    expect(await cacheResponseKeys(CACHE)).toEqual([]);
    expect(await cacheExists(CACHE)).toBe(true);
  });
});

describe("cacheNames / cacheExists / cacheDelete", () => {
  it("lists open caches", async () => {
    await cachePutResponse("assets-v1", "/a.js", new Response("a"));
    await cachePutResponse("assets-v2", "/a.js", new Response("a"));

    expect((await cacheNames()).sort()).toEqual(["assets-v1", "assets-v2"]);
  });

  it("reports whether a cache exists without creating it", async () => {
    expect(await cacheExists("never-opened")).toBe(false);
    expect(storage.caches.has("never-opened")).toBe(false);

    await cachePutResponse("assets-v1", "/a.js", new Response("a"));
    expect(await cacheExists("assets-v1")).toBe(true);
  });

  it("deletes an entire cache and reports whether one was removed", async () => {
    await cachePutResponse("assets-v1", "/a.js", new Response("a"));

    expect(await cacheDelete("assets-v1")).toBe(true);
    expect(await cacheExists("assets-v1")).toBe(false);
    expect(await cacheDelete("assets-v1")).toBe(false);
  });

  it("drops outdated revisions listed by cacheNames", async () => {
    await cachePutResponse("assets-rev1", "/a.js", new Response("a"));
    await cachePutResponse("assets-rev2", "/a.js", new Response("a"));

    const outdated = (await cacheNames()).filter((name) => name !== "assets-rev2");
    await Promise.all(outdated.map(cacheDelete));

    expect(await cacheNames()).toEqual(["assets-rev2"]);
  });
});
