# Data Sources

## Included Sources

| Source name | Source URL | License | Allowed use | Word count | Imported | Reason | Normalization notes | Date checked |
| --- | --- | --- | --- | ---: | --- | --- | --- | --- |
| Lekh manually curated seed words | local project curation | Project-owned/manual curation | Bundle in app | See `src/data/wordlists/ne-seed.tsv` | Yes | Needed for week-1 suggestions, candidates, and tests without unclear external licensing | `normalizeNepaliText` NFC and safe whitespace normalization | 2026-05-25 |
| Lekh manually curated Preeti seed map | local project curation from common keyboard glyph behavior and manual verification | Project-owned/manual curation | Bundle in app | See `src/data/mappings/preeti-map.json` | Yes | Week-1 converter needs documented mapping entries; uncertain entries are marked | Output normalized through `normalizeNepaliText` | 2026-05-25 |

## Rejected or Reference-Only Sources

| Source name | Source URL | License | Imported | Reason |
| --- | --- | --- | --- | --- |
| MPP/LTK/legacy Preeti converters | public references vary | Not confirmed for bundling | No | Useful as product/problem context, but no license permission is assumed. |
| Hunspell / LibreOffice Nepali dictionaries | to be reviewed | Not checked in this repo yet | No | Candidate future import only after license review and documented importer. |
| Wiktionary-derived Nepali terms | to be reviewed | Requires attribution/share-alike review | No | Candidate future import only after license review. |

No unclear-licensed external dictionary or mapping data is bundled in week one.
