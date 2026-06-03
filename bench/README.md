# Benchmarks

Performance checks for the hot-path functions, run with [mitata](https://github.com/evanwashere/mitata).

## Run

```bash
bun run bench
```

## What's covered

| File | Functions |
|---|---|
| `deep-clone.bench.ts` | `deepClone` across small/medium/large/circular/built-ins, compared to native `structuredClone` |
| `is-equal.bench.ts` | `isEqual` across small/deep/large structures, compared to naive `JSON.stringify` equality |
| `object.bench.ts` | `pick`, `omit`, `merge`, `deepMerge`, `mapValues`, `groupBy` |
| `string.bench.ts` | `camelCase`, `kebabCase`, `snakeCase`, `titleCase`, `slugify`, `escapeHtml` |
| `event-bus.bench.ts` | `busDispatch` with 0/10/100 listeners, `busSubscribe/unsubscribe` cycle |

## What's not covered (intentionally)

- Cross-library comparisons against `lodash`, `dequal`, `mitt`, etc. We'd need to pull them in as dev deps just for benches. Easy to add later in a dedicated `bench/compare/` dir if useful.
- Memory / allocation profiling. mitata focuses on wall-clock throughput.
- Real-browser benches. Everything runs under Bun; DOM-dependent benches (eventBus, dom) use happy-dom.

## Interpreting output

mitata prints the slowest/fastest ratio per group. A `1.0x` means the baseline is the fastest; `2.3x` means the other ran 2.3× slower. Look for large unexpected ratios after code changes.
