# dictionary-ne Evaluation

Checked: 2026-05-25

## Package Facts

- Package: `dictionary-ne`
- Version checked: `2.0.0`
- npm tarball: `https://registry.npmjs.org/dictionary-ne/-/dictionary-ne-2.0.0.tgz`
- Repository: `https://github.com/wooorm/dictionaries/tree/main/dictionaries/ne`
- License: `LGPL-2.1` for dictionary and affix data; package wrapper is MIT.
- npm unpacked size: 951,633 bytes.
- Dictionary header count: 36,827 entries.
- Runtime shape: ESM package exporting Hunspell `aff` and `dic` buffers.

## Decision

Do not bundle the full dictionary in the week-one runtime app.

The license is clear enough to use for test fixtures with attribution. The current Preeti fixture suite uses `dictionary-ne@2.0.0` words as test data only, with each generated fixture marked `dictionary-ne@2.0.0-roundtrip`.

Runtime suggestions still use project-owned curated data and generated surface forms. Bundling the full Hunspell dictionary in production remains blocked until the replacement/update path and generated romanized alias review are stronger.

## Review Pipeline Added

Run:

```bash
npm run dictionary:review
```

This generates `reports/dictionary-ne-review.tsv` from `dictionary-ne@2.0.0` with tentative romanized aliases, a heuristic domain, source, license, and `needs-human-review` status. The generated report is intentionally ignored by git until rows are reviewed and promoted into a separate runtime source bucket with notices.

## Requirements Before Import

- Add third-party notice text for `dictionary-ne`, including exact version and source URL.
- Keep the source archive URL and import date in `docs/DATA_SOURCES.md`.
- Add an import script that can be rerun against a replacement version.
- Store generated entries in a separate source bucket, not mixed with manually curated rows.
- Generate romanized aliases with reviewable rules and tests. The first-pass alias generator lives in `scripts/lib/devanagariAlias.ts`.
- Validate every imported row for normalized Devanagari, non-empty romanized alias, numeric frequency, source, and domain.
- Keep the full dictionary replaceable without touching app logic.

## Current Replacement Path

1. Download the exact npm tarball or a newer reviewed version.
2. Extract `index.aff`, `index.dic`, and `license`.
3. Run a future import script into a separate generated TSV.
4. Generate romanized aliases and keep rejected aliases in a review log.
5. Run dictionary validation, suggestion tests, spell hint tests, privacy guard, and full verify.
