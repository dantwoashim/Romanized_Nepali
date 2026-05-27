# Performance And Bundle Notes

Updated: 2026-05-27.

## Build Size

Before the final lazy-load split, the main JS chunk was about 2,849 kB minified / 512 kB gzip.

Latest `npm run build`:

| Chunk | Minified | Gzip | Notes |
| --- | ---: | ---: | --- |
| `index` | 200.52 kB | 63.63 kB | First-load app shell. |
| `PreetiConverter` | 38.53 kB | 12.38 kB | Lazy tool chunk. |
| `RomanizedEditor` | 81.10 kB | 22.24 kB | Lazy tool chunk. |
| `time` shared engine chunk | 2,532.05 kB | 416.34 kB | Local engine/data code loaded when conversion tools need it. |
| `nepaliHunspell` | 956.51 kB | 176.62 kB | Lazy local spell-validation chunk. |

## Performance Smoke

Latest `npm run bench:perf`:

| Case | p95 | Gate | Status |
| --- | ---: | ---: | --- |
| 50-token hostile Romanized mixed sentence | 16 ms | 30 ms | Pass |
| 5KB mixed Preeti paragraph | 173 ms | 100 ms initial target | Not grossly slow; still above target |

The perf harness currently fails only on gross slowdowns above 10x gate. The 5KB Preeti case remains an optimization target before broad public launch.

## Optimizations Completed

- Lazy-loaded Preeti, Romanized, Traditional, feedback, and desktop-interest panels.
- Moved heavy conversion code out of the first-load JS path.
- Kept Hunspell as a lazy chunk.
- Kept benchmark fixtures out of runtime imports.

## Next Optimization Work

- Split the shared engine/data chunk by tool path.
- Compact or lazy-load expanded wordlist and alias data by mode.
- Defer proofread/Hunspell work until the user requests hints.
- Add bundle-size budget checks after chunk boundaries stabilize.
