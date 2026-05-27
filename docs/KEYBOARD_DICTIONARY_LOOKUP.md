# Keyboard Dictionary Lookup

Updated: 2026-05-27

The keyboard dictionary surface is local-first and uses existing lexicon and seed word data. It does not add meaning data from unsafe or unlicensed sources.

## API

`KeyboardEngine.lookupDictionary(query, context)` returns local `DictionaryResult[]`.

Each row may include:

- canonical Unicode word;
- Romanized aliases;
- variants;
- domains/tags;
- source/provenance;
- confidence.

## Covered Queries

- `swasthya` -> `स्वास्थ्य`.
- `स्वास्थ्य` -> `स्वास्थ्य`.
- unknown terms return an empty safe result.

## Meaning Data

`meaning` is optional and currently omitted unless safe licensed meaning data exists. Dictionary meanings are a later data-governance task.

## Privacy

Dictionary lookup is local. Secure fields return no results.
## Prompt 2 Production Update

Dictionary lookup is wired through `KeyboardEngine.lookupDictionary()` and Keyboard Lab. Prompt 2 expanded coverage for Romanized and Unicode queries such as `swasthya`, `स्वास्थ्य`, `karyalaya`, and `नागरिकता`.

Meanings remain omitted unless a safe licensed meaning source is added later. Prompt 2 does not invent definitions.
