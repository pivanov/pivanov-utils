#!/usr/bin/env bun
import pkg from "../package.json" with { type: "json" };

const banner = `/*!
 * @pivanov/utils v${pkg.version}
 * (c) 2024-present Pavel Ivanov
 * Released under the MIT License.
 * https://github.com/pivanov/utils
 */`;

const entrypoints = [
  "src/index.ts",
  "src/assertion/index.ts",
  "src/object/index.ts",
  "src/promise/index.ts",
  "src/string/index.ts",
  "src/tools/index.ts",
  "src/types/index.ts",
];

/**
 * `@pivanov/utils/cache` is built on its own, with code splitting disabled.
 *
 * The shared build splits common modules into chunks, and the chunk that
 * `src/tools` pulls in carries React and the event bus. Service workers import
 * the cache entry point, so it gets a dedicated build whose output is a single
 * self-contained file that cannot pick up such a chunk.
 */
const cacheEntrypoints = ["src/cache/index.ts"];

const external = ["react", "react-dom", "react/jsx-runtime"];

const build = async (label: string, options: Omit<Bun.BuildConfig, "external" | "root" | "banner" | "minify">) => {
  const result = await Bun.build({
    external,
    root: "src",
    banner,
    minify: true,
    ...options,
  });

  if (!result.success) {
    for (const log of result.logs) {
      console.error(log);
    }
    console.error(`build failed: ${label}`);
    process.exit(1);
  }

  return result;
};

const esm = await build("esm", {
  entrypoints,
  outdir: "dist/esm",
  format: "esm",
  target: "browser",
  splitting: true,
});

const cjs = await build("cjs", {
  entrypoints,
  outdir: "dist/cjs",
  format: "cjs",
  target: "node",
});

const cacheEsm = await build("cache esm", {
  entrypoints: cacheEntrypoints,
  outdir: "dist/esm",
  format: "esm",
  target: "browser",
  splitting: false,
});

const cacheCjs = await build("cache cjs", {
  entrypoints: cacheEntrypoints,
  outdir: "dist/cjs",
  format: "cjs",
  target: "node",
});

await Bun.write("dist/esm/package.json", `${JSON.stringify({ type: "module" }, null, 2)}\n`);
await Bun.write("dist/cjs/package.json", `${JSON.stringify({ type: "commonjs" }, null, 2)}\n`);

console.log(`built ${esm.outputs.length} ESM + ${cjs.outputs.length} CJS artifacts`);
console.log(`built ${cacheEsm.outputs.length} ESM + ${cacheCjs.outputs.length} CJS cache artifacts`);
