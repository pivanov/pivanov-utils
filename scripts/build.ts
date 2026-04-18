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

const external = ["react", "react-dom", "react/jsx-runtime"];

const esm = await Bun.build({
  entrypoints,
  outdir: "dist/esm",
  format: "esm",
  target: "browser",
  minify: true,
  splitting: true,
  external,
  root: "src",
  banner,
});

if (!esm.success) {
  for (const log of esm.logs) {
    console.error(log);
  }
  process.exit(1);
}

const cjs = await Bun.build({
  entrypoints,
  outdir: "dist/cjs",
  format: "cjs",
  target: "node",
  minify: true,
  external,
  root: "src",
  banner,
});

if (!cjs.success) {
  for (const log of cjs.logs) {
    console.error(log);
  }
  process.exit(1);
}

await Bun.write("dist/esm/package.json", `${JSON.stringify({ type: "module" }, null, 2)}\n`);
await Bun.write("dist/cjs/package.json", `${JSON.stringify({ type: "commonjs" }, null, 2)}\n`);

console.log(`built ${esm.outputs.length} ESM + ${cjs.outputs.length} CJS artifacts`);
