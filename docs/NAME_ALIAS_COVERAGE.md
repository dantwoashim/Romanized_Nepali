# Name Alias Coverage

Checked: 2026-05-26

Name and surname Romanized aliases are tracked as spelling variants only. These entries do not encode caste, ethnicity, demographic labels, or identity claims.

## Curation Rules

- Treat each row as a Romanized spelling alias for a Devanagari candidate.
- Keep ambiguity visible when multiple spellings are legitimate.
- Do not add sensitive metadata.
- Do not use scraped population lists or unclear-license data.
- Source is `manual-curation`; license is project-owned unless a future source manifest says otherwise.
- Add regression fixtures when an alias fixes a benchmark failure.

## Covered Clusters

The runtime alias pack now includes variants for high-value surname/name clusters such as:

- `bhattarai`, `bhatarai`, `bhatrai`, `bhattary`
- `shrestha`, `shresta`, `srestha`, `shretha`, `xrestha`
- `paudel`, `poudel`, `poudyal`
- `pokharel`, `pokhrel`
- `ghimire`, `ghimirey`
- `neupane`, `nyaupane`
- `adhikari`, `adhikary`
- `karki`, `karkee`
- `acharya`, `aacharya`
- `gautam`, `goutam`
- `bhandari`, `bhandary`
- `subedi`, `tiwari`, `khadka`, `thapa`
- `rai`, `limbu`, `gurung`, `magar`, `tamang`, `sherpa`, `lama`, `tharu`, `yadav`
- `shah`, `chaudhary`, `chaudhari`, `chaudhry`

## Validation

Tests verify that common variants appear in top candidates and that the alias pack does not override known existing expectations such as `saha`, `limbu`, or `mantriparishad`.

The pack is still a starter. Real name coverage requires consented preview failures and careful ambiguity handling.
