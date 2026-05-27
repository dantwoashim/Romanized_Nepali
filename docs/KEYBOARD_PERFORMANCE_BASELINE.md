# Keyboard Performance Baseline

Generated: 2026-05-27

This baseline records Prompt 1 smoke measurements. It is not a final optimization report.

## Commands

```sh
npm run build
npm run bench:perf:smoke
npm run benchmark:typing-session
```

## Build Bundle Snapshot

Baseline build produced these notable chunks:

| Chunk | Minified | Gzip | Note |
| --- | ---: | ---: | --- |
| `KeyboardLab-*.js` | 33.32 kB | 9.59 kB | Browser validation surface. |
| `nepaliHunspell-*.js` | 956.48 kB | 176.60 kB | Heavy dictionary/proofread data. |
| large `index-*.js` | 2,603.75 kB | 434.48 kB | Needs Prompt 2/3 lazy-loading review. |

Vite warns on chunks larger than 500 kB. This does not block Prompt 1, but the production path should keep heavy dictionary packs, fixture data, and benchmark reports outside the hot keyboard path.

## Smoke Perf Results

| Case | p95 ms | Gate ms | Status |
| --- | ---: | ---: | --- |
| Romanized hostile mixed sentence | 15 | 30 | pass |
| 5KB mixed Preeti paragraph | 476 | 100 | slow; tolerated by smoke gross-slowdown threshold |
| KeyboardEngine warm startup | 1 | 500 | pass |
| Partial warm timeout | 0 | 50 | pass |
| Keyboard Romanized live update | 7 | 20 | pass |
| Candidate count cap | 8 | 20 | pass |
| Traditional Unicode suggestion | 6 | 20 | pass |
| Proofread hint update | 1 | 40 | pass |
| Dictionary lookup | 10 | 30 | pass |
| Memory ranking update | 3 | 10 | pass |
| Candidate commit | 3 | 10 | pass |
| Native IPC JSON envelope simulation | 0 | 10 | pass |

## Typing-Session Snapshot

- Fixture count: 33.
- Failed sessions: 0.
- Candidate p95: about 6 ms.
- Update p95: about 6 ms.
- Commit p95: about 1 ms.
- Dictionary hit rate: 1.0 on locked fixtures.
- Proof hint hit rate: 1.0 on locked fixtures.
- Memory boost success: 1.0 on locked fixtures.
- Next-word success: 1.0 on locked fixtures.
- KSR mean: about 0.1294 baseline.

## Hot Path Risks

- Hunspell/proofread data must stay lazy or isolated from initial hot path.
- Benchmark fixtures and reports must not be imported by runtime UI code.
- Native IPC must fail open under 50 ms hard timeout.
- Candidate generation must stay capped before shortcut assignment.
- Long document converters must not run during per-keystroke native handling.

## Prompt 2/3 Optimization Work

- Review code splitting for heavy dictionary and proofread chunks.
- Keep Romanized prefix caches bounded.
- Keep proofread hints windowed to current text context.
- Add native IPC timing once daemon scaffold has an executable harness.
- Re-measure after companion app scaffolding and native IPC integration.
