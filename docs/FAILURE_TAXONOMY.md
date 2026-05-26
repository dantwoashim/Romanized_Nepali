# Failure Taxonomy

Checked: 2026-05-25

This taxonomy is used by `npm run benchmark` to classify failed benchmark cases. It is a regression and triage tool, not a public quality claim.

## Severity

| Severity | Meaning | Examples |
| --- | --- | --- |
| `P0` | Corrupts common production workflow text or mixed English/Nepali text in a way users are likely to notice immediately | `NID`, `PDF`, `result`, `copy`, numbers, key admin phrases |
| `P1` | Breaks important Nepali words, names, phrases, or document-style output | admin/legal/school phrases, names, punctuation, reph/matra/conjunct errors |
| `P2` | Lower-confidence or exploratory cases that still matter for long-term quality | OOV-like compounds, uncommon aliases, ranking-only issues |

## Categories

| Category | Engine | Meaning | Typical next fix |
| --- | --- | --- | --- |
| `english-preservation` | Preeti | Latin/acronym/number token in expected output was converted as legacy font text | Expand safe English token preservation or detect Latin runs more generally |
| `number-preservation` | Preeti | Arabic numeral token in expected output was interpreted as a Preeti glyph | Preserve numeric runs before legacy-font conversion |
| `line-break-preservation` | Preeti | Newline count differs from expected output | Fix preprocessing/postprocessing around paragraph splitting |
| `reph-ordering` | Preeti | Failure involves `र्` placement or reph-bearing clusters | Add focused clean-room postrule fixture and fix only from observed failure |
| `matra-ordering` | Preeti | Failure involves vowel-sign placement or punctuation mapped through the baseline | Add fixture-driven postrule or punctuation preservation rule |
| `conjunct-or-halanta` | Preeti | Failure involves virama/conjunct output | Add clean-room conjunct normalization fixture before changing rules |
| `punctuation-spacing` | Preeti | Punctuation or spacing differs | Preserve punctuation before conversion or normalize safe punctuation after conversion |
| `preeti-substitution` | Preeti | Other character substitution mismatch | Add a minimized fixture and inspect safe baseline behavior |
| `mixed-english-corruption` | Romanized | English/acronym token was transliterated or damaged | Expand English token detection and candidate trace coverage |
| `ranking` | Romanized | Expected candidate exists but is not ranked first | Adjust phrase/alias/local-correction/domain scoring |
| `missing-candidate` | Romanized | Expected output is not in top candidates | Add lexical/alias data, improve syllable parser, or add phrase candidate generation |
| `name-variant` | Romanized | Name spelling/default variant is wrong | Add reviewed name aliases and expose alternatives |
| `phrase-ranking` | Romanized | Phrase output is wrong or token-only path wins | Add phrase pack coverage and phrase-first scoring tests |
| `alias-coverage` | Romanized | Common misspelling or user spelling variant is missing | Add reviewed aliases with source notes |
| `romanized-transliteration` | Romanized | Rule parser output is structurally wrong | Improve parser logic and add rule-only regression tests |

## Reporting Contract

Every failed benchmark case must include:

- `id`
- `type`
- `category`
- `failureCategory`
- `severity`
- `expected`
- `actual`

Benchmark summaries must include `topFailureCategories` with counts and severity breakdowns. Empty failure summaries are allowed only when the benchmark set has no failures.

## Triage Order

1. Fix `P0` English/acronym/number preservation failures first.
2. Fix high-frequency admin/legal/school phrase failures next.
3. Add missing candidates before tuning ranking.
4. Keep generated fixture wins separate from held-out wins.
5. Do not convert competitor outputs into bundled rules or data unless the source is independently verified as bundle-safe.
