# Performance And Bundle Notes

Updated: 2026-05-27.

## Build Size

Before the final lazy-load split, the main JS chunk was about 2,849 kB minified / 512 kB gzip.

Latest `npm run build`:

| Chunk | Minified | Gzip | Notes |
| --- | ---: | ---: | --- |
| `index` | 200.52 kB | 63.63 kB | First-load app shell. |
| `PreetiConverter` | 4.76 kB | 1.75 kB | Lazy tool chunk; shared engine code is separated. |
| `RomanizedEditor` | 9.00 kB | 3.04 kB | Lazy tool chunk; shared engine code is separated. |
| shared engine/data chunk | 2,658.99 kB | 452.47 kB | Local engine/data code loaded when conversion tools need it. |
| `nepaliHunspell` | 956.51 kB | 176.62 kB | Lazy local spell-validation chunk. |

## Performance Smoke

Latest `npm run bench:perf`:

| Case | p95 | Gate | Status |
| --- | ---: | ---: | --- |
| 50-token hostile Romanized mixed sentence | 7 ms | 30 ms | Pass |
| 5KB mixed Preeti paragraph | 94 ms | 100 ms | Pass |
| KeyboardEngine warm startup | 0 ms | 500 ms | Pass |
| Keyboard Romanized live update | 2 ms | 20 ms | Pass |
| Keyboard Traditional Unicode suggestion | 2 ms | 20 ms | Pass |
| Keyboard proofread hint update | 0 ms | 40 ms | Pass |
| Keyboard dictionary lookup | 5 ms | 30 ms | Pass |
| Keyboard memory ranking update | 2 ms | 10 ms | Pass |
| Keyboard candidate commit | 2 ms | 10 ms | Pass |

The perf harness currently fails only on gross slowdowns above 10x gate. Keyboard hot-path measurements are now tracked explicitly in `bench/reports/perf-report.json`.

## Optimizations Completed

- Lazy-loaded Preeti, Romanized, Traditional, feedback, and desktop-interest panels.
- Moved heavy conversion code out of the first-load JS path.
- Kept Hunspell as a lazy chunk.
- Kept benchmark fixtures out of runtime imports.
- Added span routing without pulling benchmark fixtures into production imports.
- Added `KeyboardEngine.warm({ timeoutMs })` measurement to `bench:perf`.
- Added Romanized update, Traditional suggestion, proofread, dictionary, memory, and commit measurements to `bench:perf`.

## Next Optimization Work

- Split the shared engine/data chunk by tool path.
- Compact or lazy-load expanded wordlist and alias data by mode.
- Defer proofread/Hunspell work until the user requests hints.
- Add bundle-size budget checks after chunk boundaries stabilize.
