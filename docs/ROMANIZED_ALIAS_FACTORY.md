# Romanized Alias Factory

Updated: 2026-05-26

## Purpose

The alias factory expands reviewed and imported lexicon rows into weighted Romanized spellings without mutating curated source files. Generated aliases improve recall but do not become market proof.

## Implemented Files

- `src/engine/romanized/aliasFactory.ts`
- `src/engine/romanized/aliasTrie.ts`
- `src/engine/romanized/aliasGraph.ts`
- `scripts/generate-romanized-alias-factory.ts`
- `scripts/report-romanized-alias-collisions.ts`

## Variant Rules

The factory generates bounded variants for:

- final schwa dropping
- `v/b/w`
- `ph/f`
- `chh/ch`
- `sh/s`
- `ksh/x`
- `aa/a`
- `ii/ee`

Weights preserve source authority: reviewed/project rows rank above imported-unreviewed dictionary rows.

## Latest Report

`npm run alias:romanized`:

- variants: 76,193
- unique alias keys: 70,201
- outputs: 40,138
- reviewed/manual variants: 9,920
- imported-unreviewed variants: 66,273

`npm run check:alias-collisions`:

- collisions: 4,499
- expected ambiguous: 262
- review-needed: 4,237

Collision count is expected for Nepali Romanization. It is a ranking/review input, not an automatic failure.
