# Traditional Layout Decision

Generated: 2026-05-27

## Current Decision

Traditional physical layout is **not complete**. Lekh must not ship a production Traditional physical keymap until the source-of-truth audit is complete.

Current status:

- `traditional-ltk-compatible`: `pending-manual-audit`
- `traditional-standard`: `pending-authoritative-source-review`
- implementation from pending files: forbidden
- Keyboard Lab Traditional Unicode suggestions: allowed because they operate on Unicode input, not guessed physical key mappings

## Default Layout Decision Rule

The MVP default must be selected after evidence exists:

1. Capture current LTK behavior manually.
2. Capture the authoritative Nepali Unicode standard layout from a source with clear provenance.
3. Diff LTK-compatible behavior against the standard.
4. Review differences with Traditional typists.
5. Select the default based on LTK familiarity, office/school expectations, and implementation safety.

If this evidence is missing, Prompt 2 may keep Traditional physical typing as placeholder-pending while continuing Unicode-prefix suggestions and proofread behavior.

## Required Evidence Before Implementation

| Evidence | Required status |
| --- | --- |
| normal key state capture | verified |
| Shift key state capture | verified |
| AltGr/Option state capture | verified or explicitly not applicable |
| Shift+AltGr/Option state | verified or explicitly not applicable |
| punctuation and digits | verified |
| halanta behavior | verified |
| matra ordering behavior | verified |
| conjunct-relevant sequences | verified |
| source/provenance/license notes | complete |
| human reviewer/date | complete |

## Final Artifacts To Produce

- `data/layouts/traditional-ltk-compatible.json`
- `data/layouts/traditional-standard.json`
- `bench/fixtures/traditional-layout/layout-audit.jsonl`
- layout preview data for the companion app
- updated decision notes listing every LTK-vs-standard difference

## Non-Goals

- Do not scrape unclear-license keymaps.
- Do not copy proprietary or incompatible mapping tables.
- Do not use memory or vibes as source of truth.
- Do not label the browser lab placeholder as final Traditional typing.
