# Span-Routed Conversion

The span router sends each typed span to the safest available path:

| Span kind | Route |
| --- | --- |
| Unicode Nepali | preserve, then proofread surface issues |
| Preeti legacy | Preeti converter with verified island repairs |
| Romanized Nepali | Romanized candidate engine |
| English preserve | byte-exact preserve |
| English with Nepali suffix | preserve English stem, convert Nepali suffix |
| Loanword candidate | preserve and offer Nepali candidate by policy |
| URL/email/phone/file/identifier/date | byte-exact preserve |
| Unknown risky | preserve and warn |

The document lattice merges span outputs in source order and then structural checks verify protected spans, private sentinels, Unicode combining order, and malformed Romanized outputs such as `आः` from final `aa`.

Current routed modes:

- `romanized-mixed-office`
- `preeti-mixed-document`
- `mixed-unicode-legacy-repair`
- `diagnostic`

Existing pure Romanized and Preeti paths are preserved for compatibility.
