# Data Sources

## Included Sources

| Source name | Source URL | License | Allowed use | Word count | Imported | Reason | Normalization notes | Date checked |
| --- | --- | --- | --- | ---: | --- | --- | --- | --- |
| Lekh manually curated seed words and domain packs | local project curation | Project-owned/manual curation | Bundle in app | 326 base entries | Yes | Needed for week-1 suggestions, candidates, and tests without unclear external licensing | `normalizeNepaliText` NFC and safe whitespace normalization | 2026-05-25 |
| Lekh seed-derived surface forms | local expansion from project-owned seed entries | Project-owned/manual curation | Bundle in app | 3,260 total rows in `src/data/wordlists/ne-seed.tsv` | Yes | Expands local suggestions for government, school, legal, office, names, and places without importing unclear data | Generated forms are validated with `normalizeNepaliText`; duplicates rejected by tests | 2026-05-25 |
| Lekh Romanized gold fixtures | local generation from curated wordlist and hand regressions | Project-owned/manual curation | Bundle in test data | 5,000 aggregate fixtures plus split category files | Yes | Separates lexical, generated phrase, names/places, admin/legal, mixed English, malformed spacing, regression, and rule-only coverage | Expected output goes through `normalizeNepaliText`; rule-only fixtures disable dictionary lookup | 2026-05-25 |
| Lekh Preeti gold fixtures | local generation from manually audited Preeti seed atoms | Project-owned/manual curation | Bundle in test data | 10,000 fixtures | Yes | Covers words, matra reordering, half letters, punctuation, numbers, paragraphs, tables, forms, names/dates, ambiguous legacy-font cases, mixed English, and multiline documents | Expected output is normalized; generated fixtures keep `generatedFrom: preeti-seed-composition` | 2026-05-25 |
| `@nepalibhasha/converter` | https://www.npmjs.com/package/@nepalibhasha/converter and https://github.com/nepalibhasha/nepali-fonts/tree/main/packages/converter-js | MIT | Bundle as runtime dependency | npm unpacked size 140,902 bytes; Preeti map has 135 entries | Yes | Stable browser/Node Preeti baseline with matra reordering and half-letter post-processing | Wrapped by `convertPreetiToUnicode`; output normalized through `normalizeNepaliText`; local warnings retained | 2026-05-25 |
| Lekh manually curated Preeti seed map | local project curation from common keyboard glyph behavior and manual verification | Project-owned/manual curation | Bundle as fallback/reference | See `src/data/mappings/preeti-map.json` | Yes | Wrapper fallback and uncertainty warnings; not the primary baseline | Output normalized through `normalizeNepaliText` | 2026-05-25 |

## Rejected or Reference-Only Sources

| Source name | Source URL | License | Imported | Reason |
| --- | --- | --- | --- | --- |
| MPP/LTK/legacy Preeti converters | public references vary | Not confirmed for bundling | No | Useful as product/problem context, but no license permission is assumed. |
| `dictionary-ne` / Nepali Hunspell (`ne_NP`) | https://www.npmjs.com/package/dictionary-ne and https://github.com/wooorm/dictionaries/tree/main/dictionaries/ne | Dictionary/affix data LGPL-2.1; package wrapper MIT | No full dictionary bundled yet | Version 2.0.0 exists, is ESM, and has npm unpacked size 951,633 bytes. The `.dic` header reports 36,827 entries. Full import is blocked until the repo keeps LGPL notices, source archive URL/version, replacement/update path, and reviewed generated romanized aliases. |
| Hunspell upstream package context | http://ltk.org.np via `dictionary-ne`; Fedora package lists `hunspell-ne` as LGPL-2.1-only | LGPL-2.1 | No full dictionary bundled yet | Reviewed as a future source. Current app uses project-owned seed data to avoid unclear static-data obligations. |
| Varnavinyas | https://github.com/nepalibhasha/varnavinyas | MIT or Apache-2.0 | No runtime bundle | Promising Nepali orthography checker with Rust, CLI, browser UI, and WASM binding crates. A disabled local-only worker probe exists for future measurement, but no Varnavinyas data or WASM is bundled in production. |
| Wiktionary-derived Nepali terms | to be reviewed | Requires attribution/share-alike review | No | Candidate future import only after license review. |

No unclear-licensed external dictionary or mapping data is bundled in week one.

## Future Import Requirements

- `dictionary-ne`: keep the exact package version, source tarball URL, license text, attribution notice, import script, generated romanized alias script, and replacement instructions before bundling any `.aff` or `.dic` data.
- Varnavinyas: keep it behind a local development flag until bundle size, worker latency, false positives, and UI wording are measured against project fixtures.
