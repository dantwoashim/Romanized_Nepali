# Phrase Engine

Checked: 2026-05-26

Sliding-window phrase matching runs on top of the existing Romanized converter. The goal is recall for realistic admin/legal/education sentences without rewriting the whole transliteration engine in one broad cutover.

## Matching Algorithm

- Tokenize Latin words in the input.
- At every token position, check phrase windows of 5, 4, 3, and 2 tokens.
- Match normalized Romanized keys against the curated phrase table.
- Resolve overlaps deterministically by taking the longest reviewed match first.
- Convert unmatched text with the existing Romanized converter.
- Reassemble the full output and normalize through `normalizeNepaliText`.

The matcher is bounded at `O(tokenCount * maxWindow)` and does not use recursive phrase segmentation. Candidate explosion is controlled by hard caps in `src/engine/romanized/rank.ts`; there is no `candidateExplosionPenalty`.

## Ranking Order

Phrase candidates rank before token-level phonetic fallback. Curated aliases and dictionary entries are still preserved as alternatives. Generated/imported-unreviewed lexicon entries can help recall, but they must not outrank reviewed phrase/alias data.

## Covered Starter Domains

| Domain | Examples |
| --- | --- |
| Admin | `jilla prashasan karyalaya`, `nagarikta praman patra`, `janma darta`, `mrityu darta`, `basai sarai` |
| Legal | `uchcha adalat`, `sarbochcha adalat`, `jagga dhani pramanpurja` |
| Education | `shiksha mantralaya`, `charitra praman patra`, `grade patra` |
| Places | province names such as `Bagmati Pradesh`, `Koshi Pradesh` |
| Health | tiny reviewed starter only: `swasthya karyalaya`, `aspatal`, `swasthya bima` |

The health pack is intentionally small. It is not a medical vocabulary claim.

## Known Limits

- Phrase matching is exact after Romanized normalization; it does not infer every paraphrase.
- Sliding windows recover phrases in the middle of long sentences, but unmatched spans still depend on the older token converter.
- Phrase packs are manually curated. They should grow through reviewed benchmark failures, not broad scraping.
- Competitor and real-user proof remains pending.
