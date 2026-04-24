# OpenPolicy Bundle Analysis

Measured against the `examples/tanstack` TanStack Start app. "Baseline" is the same shell with OpenPolicy (privacy policy + cookie banner + compiled policy HTML) removed; "Full" is the example as-shipped.

_2026-04-19 · darwin/arm64 · Node v24.3.0 · 5 runtime iterations (median reported)_

## Bundle size

| Metric         | Baseline | Full     | Δ                  |
| -------------- | -------- | -------- | ------------------ |
| Total (raw)    | 455.3 kB | 570.2 kB | +114.9 kB (+25.2%) |
| Total (gzip)   | 179.8 kB | 216.6 kB | +36.8 kB (+20.5%)  |
| Total (brotli) | 163.6 kB | 195.0 kB | +31.3 kB (+19.2%)  |
| Asset count    | 6        | 11       | +5                 |

### By asset type (gzip)

| Type | Baseline     | Full         | Δ        |
| ---- | ------------ | ------------ | -------- |
| js   | 114.9 kB (2) | 150.6 kB (7) | +35.8 kB |
| css  | 7.8 kB (1)   | 8.9 kB (1)   | +1.1 kB  |
| font | 57.1 kB (3)  | 57.1 kB (3)  | +0 B     |

## Runtime (median of 5)

| Metric             | Baseline | Full     | Δ        |
| ------------------ | -------- | -------- | -------- |
| TTFB               | 3ms      | 3ms      | +0ms     |
| FCP                | 44ms     | 48ms     | +4ms     |
| LCP                | 44ms     | 48ms     | +4ms     |
| CLS                | 0        | 0        | +0.000   |
| load event         | 19ms     | 16ms     | -3ms     |
| JS exec (profiler) | 10ms     | 12ms     | +2ms     |
| transfer           | 429.3 kB | 518.5 kB | +89.2 kB |
| requests           | 5        | 6        | +1       |

## Method

Run with `bun run bench`. Reproduction and metric definitions: see [scripts/bench/README.md](../README.md).
