# Preeti Oracle And Fuzzing

Checked: 2026-05-26

The Preeti oracle/fuzz infrastructure is for regression pressure and decoder proof, not public real-world coverage claims.

## Commands

| Command | Output |
| --- | --- |
| `npm run generate:preeti-map-fixtures` | `bench/fixtures/preeti/generated/map-fixtures.json` |
| `npm run generate:preeti-boundary-fixtures` | `bench/fixtures/preeti/generated/boundary-fixtures.json` |
| `npm run generate:preeti-roundtrip-fixtures` | `bench/fixtures/preeti/generated/roundtrip-fixtures.json` |
| `npm run benchmark:preeti:fuzz` | `bench/reports/preeti-fuzz-report.json` |
| `npm run benchmark:preeti:roundtrip` | `bench/reports/preeti-roundtrip-report.json` |

## Current Generated Counts

- Map fixtures: 156
- Boundary fixtures: 90
- Roundtrip fixtures: 15
- Fuzz fixtures: 26

## Policy

- Map fixtures come from reviewed/provisional semantic profile mappings.
- Boundary fixtures stress suffixes, matras, reph/rakar, conjuncts, punctuation, and protected-span boundaries.
- Roundtrip fixtures use reviewed Unicode gold strings and the project inverse map.
- Fuzz legal cases must exact-match.
- Fuzz illegal cases must warn or mark unsafe, never silently produce trusted output.
- Generated/self-consistency suites are not counted as real-document evidence.

## Latest Focused Results

- `benchmark:preeti:fuzz`: 26 fixtures, legal exact rate 1.0, illegal safety rate 1.0.
- `benchmark:preeti:roundtrip`: 15 fixtures, exact rate 1.0.

The baseline converter remains the primary user-facing output unless `legacyDecoder` explicitly selects the atom path or `auto` verifies a clean supported-profile span.
