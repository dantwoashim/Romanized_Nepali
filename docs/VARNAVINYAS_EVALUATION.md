# Varnavinyas Evaluation

Checked: 2026-05-25

## Source Facts

- Repository: `https://github.com/nepalibhasha/varnavinyas`
- License: dual MIT or Apache-2.0.
- Scope: Nepali orthography tooling with spelling, punctuation, writing-convention diagnostics, CLI, browser UI, editor support, and WebAssembly bindings.
- Browser build: documented through `web/build.sh`; the repository notes `wasm-pack` and `wasm-bindgen-cli` requirements.
- Release status checked: GitHub shows a browser artifact release line, but no npm package was found via `npm search varnavinyas`.

## Decision

Do not ship Varnavinyas in production yet.

A disabled local-only worker probe exists at `src/core/orthography/varnavinyasWorkerClient.ts`. It is gated by local development mode plus `VITE_ENABLE_VARNAVINYAS_EVAL=true`, and the worker currently reports `not-installed` because no Varnavinyas WASM or data is bundled.

## Measurements Required Before Shipping

| Area | Current status | Shipping requirement |
| --- | --- | --- |
| Bundle size | Not bundled | Measure production JS/WASM delta and keep it acceptable for PWA first load. |
| Latency | Worker probe only | Measure p50/p95 worker response on 1-line, paragraph, and page-length text. |
| False positives | Not measured | Compare against Romanized, Preeti, and office/legal fixture slices before exposing hints. |
| UX clarity | Not exposed | Copy must say optional orthography hints, not grammar correction or official validation. |
| Privacy | Local worker only | No text leaves the browser; no remote checker calls. |

## Next Integration Step

Build a local Varnavinyas WASM artifact outside the production bundle, load it only through the gated worker, and record bundle size plus latency results here before considering UI exposure.
