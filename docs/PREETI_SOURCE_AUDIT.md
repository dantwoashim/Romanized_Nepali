# Preeti Source Audit

Checked: 2026-05-26

Preeti validation now separates source truth from converter behavior.

Some “wrong conversion” examples are true converter bugs. Others are source-text typos, style differences, ambiguous legacy encodings, or expected-output mistakes. A pure converter should preserve what the source encodes; proofread may suggest corrections separately.

## Fixture Location

- `bench/fixtures/preeti/source-audit/manual-hard.jsonl`
- Report: `bench/reports/preeti-source-audit-report.json`
- Command: `npm run audit:preeti-source`

## Status Values

| Status | Meaning | Conversion benchmark? |
| --- | --- | --- |
| `verified-gold` | Source and expected Unicode are reviewed enough for conversion scoring | yes |
| `converter-bug` | Source is treated as valid and current output is wrong | yes |
| `source-text-typo` | Source appears to encode a typo | no |
| `expected-output-bug` | Expected Unicode is wrong | no |
| `style-normalization` | Output differs only by style preference | no, proofread only |
| `proofread-correction` | Correctness belongs to proofread, not conversion | no, proofread only |
| `ambiguous-legacy-encoding` | Needs human Preeti typist review before scoring | no |

## Current Audit Snapshot

The current manual-hard audit has 12 fixtures:

- 8 verified-gold
- 2 converter-bug
- 1 style-normalization
- 1 ambiguous-legacy-encoding
- 0 expected-output-bug

The `pRtd\` stress case is intentionally marked `ambiguous-legacy-encoding`: the current inverse map encodes `उच्चतम्` as `pRrtd\`, while the stress example claims `pRtd\` is a shorthand. The atom decoder can evaluate the shorthand, but public scoring should wait for reviewed typist confirmation.
