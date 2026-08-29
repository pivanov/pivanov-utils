#!/usr/bin/env bun
/**
 * Build regression for the published package contents.
 *
 * The `@pivanov/utils/cache` entry point exists so service workers can use the
 * Cache Storage helpers without pulling React, the event bus or the DOM helpers
 * into their bundle. That guarantee lives in the build configuration, which is
 * easy to break by accident, so it is asserted here against the real artifacts:
 * every declared export path exists, the cache artifacts are self-contained and
 * free of forbidden references, and both module formats actually import.
 */
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import pkg from "../package.json" with { type: "json" };

const root = resolve(import.meta.dir, "..");
const require = createRequire(import.meta.url);

const failures: string[] = [];

const check = (description: string, condition: boolean) => {
  if (!condition) {
    failures.push(description);
  }
};

const RESPONSE_EXPORTS = [
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

const STORAGE_EXPORTS = [
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

const CACHE_EXPORTS = [...RESPONSE_EXPORTS, ...STORAGE_EXPORTS];

/** Names that must never reach the service-worker entry point. */
const FORBIDDEN_EXPORTS = [
  "useEventBus",
  "busDispatch",
  "busSubscribe",
  "isBrowser",
  "checkVisibility",
  "setStyleProperties",
  "deepClone",
  "isEqual",
];

/** Substrings that would betray React or event-bus code inside a cache artifact. */
const FORBIDDEN_SOURCE_PATTERNS = [/react/i, /react-dom/i, /useEffect/, /event-bus/i, /eventBus/, /useState/, /jsx/i];

// 1. Every path declared in package.json#exports must exist on disk.
for (const [subpath, conditions] of Object.entries(pkg.exports)) {
  for (const [condition, relativePath] of Object.entries(conditions as Record<string, string>)) {
    const absolute = resolve(root, relativePath);
    check(`exports["${subpath}"].${condition} -> ${relativePath} is missing`, await Bun.file(absolute).exists());
  }
}

// 2. The pre-existing entry points must survive the release.
for (const subpath of [".", "./assertion", "./object", "./promise", "./string", "./tools", "./types"]) {
  check(`exports["${subpath}"] was dropped`, subpath in pkg.exports);
}
check('exports["./cache"] is missing', "./cache" in pkg.exports);

// 3. `@pivanov/utils/tools` must keep re-exporting the cache helpers.
for (const format of ["esm", "cjs"] as const) {
  const source = await Bun.file(resolve(root, `dist/${format}/tools/index.js`)).text();
  for (const name of ["storageSetItem", "storageGetItem", "cachePutResponse", "cacheMatchResponse"]) {
    check(`dist/${format}/tools/index.js no longer exports ${name}`, source.includes(name));
  }
}

// 4. The cache artifacts must be self-contained and free of forbidden references.
const esmCachePath = resolve(root, "dist/esm/cache/index.js");
const cjsCachePath = resolve(root, "dist/cjs/cache/index.js");

for (const [format, path] of [
  ["esm", esmCachePath],
  ["cjs", cjsCachePath],
] as const) {
  const source = await Bun.file(path).text();

  for (const pattern of FORBIDDEN_SOURCE_PATTERNS) {
    check(`dist/${format}/cache/index.js contains a forbidden reference matching ${pattern}`, !pattern.test(source));
  }

  const relativeImports = source.match(/from\s*"\.[^"]*"/g) ?? [];
  check(`dist/${format}/cache/index.js is not self-contained: ${relativeImports.join(", ")}`, relativeImports.length === 0);
}

const esmRequires = (await Bun.file(esmCachePath).text()).match(/\brequire\s*\(/g) ?? [];
check(`dist/esm/cache/index.js contains ${esmRequires.length} require() calls`, esmRequires.length === 0);

// 5. Both module formats must import cleanly and expose the whole API.
const esmModule = (await import(pathToFileURL(esmCachePath).href)) as Record<string, unknown>;
const cjsModule = require(cjsCachePath) as Record<string, unknown>;

for (const [format, module] of [
  ["esm", esmModule],
  ["cjs", cjsModule],
] as const) {
  for (const name of CACHE_EXPORTS) {
    check(`dist/${format}/cache/index.js does not export ${name}()`, typeof module[name] === "function");
  }
  for (const name of FORBIDDEN_EXPORTS) {
    check(`dist/${format}/cache/index.js leaks ${name}`, module[name] === undefined);
  }
}

// 6. The type declarations must describe both layers.
const declarations = await Bun.file(resolve(root, "dist/types/cache/index.d.ts")).text();
check("dist/types/cache/index.d.ts does not re-export ./response", declarations.includes("./response"));
check("dist/types/cache/index.d.ts does not re-export ./storage", declarations.includes("./storage"));

const responseDeclarations = await Bun.file(resolve(root, "dist/types/cache/response.d.ts")).text();
for (const name of RESPONSE_EXPORTS) {
  check(`dist/types/cache/response.d.ts does not declare ${name}`, responseDeclarations.includes(name));
}

if (failures.length > 0) {
  console.error(`verify-dist: ${failures.length} check(s) failed`);
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  process.exit(1);
}

console.log(`verify-dist: all checks passed (${CACHE_EXPORTS.length} cache exports verified in ESM and CJS)`);
