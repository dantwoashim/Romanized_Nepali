# Lexical Authority

Checked: 2026-05-26

Lekh uses a local Lexical Authority Layer to keep recall data auditable. It is not a claim that every generated or imported form is correct; it is a source-aware ranking and loading boundary for Romanized candidates, suggestions, spell hints, and domain phrases.

## Source Priority

1. Protected span rule
2. User correction memory exact context
3. Curated phrase pack
4. Curated alias
5. Domain lexicon
6. Curated base lexicon
7. Reviewed names/places
8. Hunspell validation
9. Frequency prior
10. Phonetic fallback

Prompt 2 implements the source metadata, generated Hunspell ranking artifacts, curated aliases, curated phrases, loanword candidates, and English-preserve dictionaries. User correction memory remains a future Prompt 3 ranking input.

## Review Status

| Status | Runtime meaning |
| --- | --- |
| `approved` | Project-owned or reviewed data can rank strongly. |
| `reviewed` | Human-reviewed source can rank strongly, with source notes kept. |
| `imported-unreviewed` | Licensed import may improve recall, but should not outrank curated phrase/alias data. |
| `generated` | Deterministic local generation; useful for recall and tests, not proof of correctness. |
| `quarantined` | Retained for review only; must not rank. |
| `rejected` | Must not rank. |
| `user-local` | Reserved for future local correction memory. |

## Bundle Eligibility

The runtime may bundle only project-owned/manual data or third-party data that is marked bundle-safe in `docs/DATA_SOURCES.md` and covered in `docs/THIRD_PARTY_NOTICES.md` when required.

Unclear-license corpora, GPL code/maps, noncommercial data, blocked dictionary dumps, and public web scraping outputs must not be committed as runtime data. Local research artifacts may stay under ignored `data/generated/` only when the source policy permits local analysis.

## Prompt 2 Artifacts

| Artifact | Purpose | Runtime posture |
| --- | --- | --- |
| `src/engine/lexicon/*` | Source-aware loading, normalization, source registry, and query helpers | Engine code |
| `data/lexicon/generated/hunspell-ranked-nepali.*` | Ranked `dictionary-ne` base forms with local frequency evidence | Review/generated artifact |
| `data/lexicon/generated/hunspell-runtime-cap.tsv` | Safe merge preview without overwriting curated TSVs | Review artifact |
| `src/data/aliases/romanized-aliases.tsv` | Curated Romanized variants and name/surname aliases | Runtime data |
| `src/data/phrases/romanized-phrases.tsv` | Compatibility phrase pack for current core ranker | Runtime data |
| `data/phrases/*.jsonl` | Source-rich phrase pack shape for the engine layer | Runtime/review data |
| `data/lexicon/loanwords/*.jsonl` | Loanword candidates, not protected spans | Runtime/review data |
| `data/lexicon/english-preserve/*.jsonl` | English/digital terms that should stay byte-exact in mixed/developer contexts | Runtime/review data |

Generated data improves recall but is not market proof. Public comparison claims require frozen competitor probes and real user validation.
