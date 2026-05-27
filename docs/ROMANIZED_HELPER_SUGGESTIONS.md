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
## Prompt 2 Production Update

Helper suggestions are available as `romanized-helper` candidates and remain secondary to Unicode candidates. Prompt 2 added required helper coverage for `swas`, `karya`, `nagarik`, `rajaniti`, `shik`, and `pra`.

Selecting a helper in Keyboard Lab refines the Romanized composition instead of committing final Unicode. The final native candidate-window behavior remains Prompt 3 work.
