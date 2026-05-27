# Romanized Helper Suggestions

Updated: 2026-05-27

Romanized helper suggestions are secondary candidates that help users complete or normalize the Latin spelling before choosing Unicode.

## Surface

The surface is `romanized-to-romanized`. Candidates use type `romanized-helper`.

Examples:

- `swas` -> `swasthya`, `swastha`, `swasthy`.
- `karya` -> `karyalaya`, `karyakram`.
- `nagarik` -> `nagarikta`.
- `rajaniti` -> `raajaniti`, `rajanitik`.

## Ranking Policy

- Unicode candidates remain primary in normal Romanized mode.
- Helper suggestions are appended after high-confidence Unicode, dictionary, phrase, and memory candidates.
- Helper suggestions are bounded so they cannot push out the main Unicode options.
- The Keyboard Lab can show Romanized labels to make the relationship visible.

## Safety

Helper text is never auto-committed. It is a candidate the user must choose.
