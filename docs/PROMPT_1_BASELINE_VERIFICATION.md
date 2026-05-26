# Prompt 1 Baseline Verification

Checked: 2026-05-26

| Command | Before status | Failure/hang reason | Fix applied | After status |
| --- | --- | --- | --- | --- |
| `npm ci` | Pass | None | None | Pass |
| `npm run typecheck` | Pass | None | Fixed later UI warning key type issue | Pass |
| `npm run test` | Pass before edits | Later local `node_modules/jsdom` artifact corruption caused import errors; then source regressions surfaced | Reinstalled `node_modules/jsdom`; fixed source regressions | Pass |
| `npm run build` | Pass | None | UI routing and scripts typechecked/build cleanly | Pass |
| `npm run verify` | Pass before edits | Did not include disjointness; benchmark Preeti could silently do nothing | Added disjointness to verify; fixed benchmark CLI truth | Pass |
| `npm run check:privacy` | Pass | None | None | Pass |
| `npm run check:engine-local` | Pass | None | None | Pass |
| `npm run check:engine-no-dom` | Pass | None | None | Pass |
| `npm run check:user-data` | Pass | None | None | Pass |
| `npm run check:benchmark-disjointness` | Missing | No script existed | Added script/report and quarantined contaminated Romanized held-out suite | Pass, with `romanized-held-out` reported contaminated/excluded |
| `npm run benchmark:protected` | Pass | None | Added import-safe CLI/no-empty behavior | Pass |
| `npm run benchmark:preeti` | Exit 0 with no output | `vite-node` CLI guard did not run the main body | Added explicit CLI signal and no-empty assertion | Pass with JSON metrics |
| `npm run benchmark:romanized` | Pass | Needed clean import/exit guarantee | Added explicit CLI signal and no-empty assertion | Pass |
| `npm run benchmark:proofread` | Pass | Needed no-empty guarantee | Added explicit CLI signal and no-empty assertion | Pass |
| `npm run benchmark:competitor` | Pass | Needed no-empty guarantee | Added explicit CLI signal and no-empty assertion | Pass |
| `npm run benchmark` | Pass | Needed regenerated type classifications | Generator now marks contaminated Romanized held-out as regression and hostile as hostile | Pass |
| `npm run bench:perf` | Pass | None | None | Pass |
| `npm run scorecard:engine` | Pass | Needed fresh disjointness integration | Generates current benchmark data and disjointness section | Pass |
| `npm audit --audit-level=moderate` | Pass | None | None | Pass |

Baseline bug note: `npm run benchmark:preeti` was the most serious verification issue because it could pass while reporting no cases. That is now fixed.

