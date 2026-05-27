# One-Shot Baseline Audit

Updated: 2026-05-27.

This audit records the state checked before the final conversion-correctness pass. It is based on the current repository state and regenerated local reports.

## Starting State

- Branch: `main`.
- UI route: Preeti and Romanized user flows route through `src/engine`.
- Preeti selected path: baseline converter selected by default, atom decoder runs in compare/diagnostic mode.
- Romanized selected path: engine facade with aliases, phrases, candidates, protected spans, and confidence warnings.
- Public claim state: conservative. No market, official, government-ready, or universal accuracy claim is allowed.

## Issues Found

| Area | Baseline finding | Resolution in this pass |
| --- | --- | --- |
| Test runner | Vitest used fork pool without explicit worker limits. | Added bounded workers in `package.json` and `vitest.config.ts`. |
| Verify | `verify` did not include the full benchmark/perf chain. | Added `benchmark`, `bench:perf`, and scorecard sequence. |
| Romanized stress text | Long hard prose was not isolated as a hostile held-out suite. | Added `bench/fixtures/romanized/hostile-heldout/hard-long-prose.jsonl`. |
| Romanized hard tokens | Vowels, diphthongs, `ri`, clusters, and prose forms failed in direct probes. | Added formal token overrides and prose punctuation/number cleanup in the converter path. |
| Preeti `pRtd\` | Selected path emitted `उच्तम्`. | Post-rule now repairs this verified shorthand to `उच्चतम्`. |
| Preeti `हरू` | Source audit exposed terminal `हरु` mismatches. | Boundary-aware `हरु` normalization now preserves unrelated words such as `हरुवाचरुवा`. |
| Scorecard clarity | Aggregate scores could hide hard stress coverage. | Scorecard now separates Romanized hard hostile prose. |
| UI safety | UI showed output but not enough safety/candidate state. | Added action/confidence/warning/protected-span/decoder diagnostics. |
| Bundle size | Main JS was about 2.85 MB minified / 512 KB gzip. | Tool panels are lazy-loaded; main JS is about 200 KB minified / 64 KB gzip. |

## Baseline Commands

The initial run completed in this environment before code changes, but it confirmed the quality gaps above. The final verification loop in the completion report is the authoritative status.

## Current Blockers

No repo-executable blocker remains. Human-data and market-comparison work remains gated on consented documents and manually collected competitor outputs.
