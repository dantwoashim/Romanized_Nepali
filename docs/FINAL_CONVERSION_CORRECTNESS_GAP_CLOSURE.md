# Final Conversion Correctness Gap Closure

Updated: 2026-05-27.

| Item | Status | Notes |
| --- | --- | --- |
| Test/verify hang fixed | Complete | Vitest worker limits configured; full test suite exits. |
| Hard Romanized hostile suite added | Complete | `hard-long-prose.jsonl` added with token and paragraph cases. |
| Romanized hard tokens fixed | Complete | Current benchmark reports top-1 `1.0000` for hard hostile bucket. |
| Romanized hard paragraph fixed | Complete | Full stress paragraph matches expected output in prose mode. |
| Preeti selected path `उच्चतम्` fixed | Complete | `pRtd\` emits `उच्चतम्`. |
| Preeti `हरू` boundary fixed | Complete | Terminal and suffix `हरु` cases normalize; unrelated `हरुवा` words are preserved. |
| Atom decoder safe mode | Complete | Compare/verifier mode remains; no blind cutover. |
| Protected spans pass | Complete | `benchmark:protected` passes with no missing/corrupted/altered spans. |
| Alias collision policy strict | Complete | Collision-heavy names become candidate-gated. |
| UI exposes safety states | Complete | Candidate, confidence, warning, protected-span, and decoder states are visible. |
| Benchmark scripts fresh/non-empty | Complete | Disjointness and scorecard generation run from current reports. |
| Disjointness check works | Complete | Contaminated `romanized-held-out` remains excluded from public proof. |
| Scorecards honest | Complete | Hard hostile prose is separate from generated/internal fixtures. |
| Completion docs created | Complete | Prompt reports, gap closure, bundle notes, and keyboard prerequisites exist. |
| Bundle/perf measured | Complete | Main JS reduced to about 200 KB minified / 64 KB gzip; engine chunks lazy-load. |
| Public claims conservative | Complete | Strong public claims remain blocked. |
| Keyboard prerequisites documented | Complete | Keyboard app work remains gated. |

## Remaining Non-Code Gates

- Human-data: no consented real-user documents are committed.
- Market comparison: competitor outputs remain pending manual collection.
- Platform-native: Windows TSF, macOS InputMethodKit, Keyman/provider experiments, and Tauri companion work are not implemented in this conversion pass.

## Recommendation

The repository is ready for serious web demo review. Keyboard app planning can begin only as planning; implementation should wait until the prerequisites in `KEYBOARD_APP_PREREQUISITES.md` are met with real users.
