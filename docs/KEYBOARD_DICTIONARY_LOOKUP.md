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
