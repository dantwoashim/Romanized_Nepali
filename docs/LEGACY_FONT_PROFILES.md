# Legacy Font Profiles

Checked: 2026-05-26

Lekh supports Preeti through the verified MIT `@nepalibhasha/converter` baseline wrapped by project normalization, diagnostics, and protected-span handling.

The semantic Preeti profile map and verifier-gated atom decoder run beside that baseline. The baseline remains available and is still the conservative fallback.

## Profile Status

| Profile | Status | Reason |
| --- | --- | --- |
| Preeti | Supported | Safe MIT baseline plus project-owned diagnostics |
| Kantipur | Planned diagnostic only | No verified bundle-safe map in repository |
| Sagarmatha | Planned diagnostic only | No verified bundle-safe map in repository |
| Himali | Planned diagnostic only | No verified bundle-safe map in repository |

No GPL, noncommercial, no-license, or unclear-license maps are bundled.

## Architecture

- `src/engine/legacy/profile.ts`: typed profile metadata and diagnostic fingerprints.
- `src/engine/legacy/types.ts`: semantic profile, mapping, token, atom, and verifier contracts.
- `src/engine/legacy/atoms.ts`: typed atom model.
- `src/engine/legacy/tokenizer.ts`: greedy longest-match tokenizer over reviewed semantic mappings.
- `src/engine/legacy/assembleUnicode.ts`: Unicode assembly from reviewed token previews/atoms.
- `src/engine/legacy/verifier.ts`: no-silent-corruption checks for unknowns, malformed marks, unsupported profiles, and protected spans.
- `src/engine/legacy/decoder.ts`: parallel atom decoder and compare/auto/atom/baseline selection.
- `src/engine/legacy/parseGlyphs.ts`: profile-aware glyph atom parsing.
- `src/engine/legacy/diagnostics.ts`: confidence, unknown glyph, matra/reph/conjunct diagnostic fields.
- `src/engine/legacy/reorder.ts`: clean-room Preeti postrule exports.
- `data/legacy-fonts/profiles/*.json`: profile metadata and planned placeholders.
- `data/legacy-fonts/profiles/preeti-classic.json`: semantic profile manifest documenting source/provenance and boundary rules.

Low-confidence or planned profiles return diagnostics instead of guessed conversion.

## Font Inspection

`npm run inspect:legacy-font -- /path/to/font.ttf` can inspect a local font file for basic inventory hints and writes `bench/reports/legacy-font-inspection-report.json`.

If no font is provided, the command reports `font not provided` and does not fail the build. Font inspection is only a coverage/fingerprinting aid. Glyph names and cmap inventory are not semantic Unicode truth; the semantic profile map remains the conversion authority.

## Diagnostic Fingerprint Schema

`DiagnosticFingerprint` is intentionally explicit so future profile work does not depend on guesses:

- `glyphRatios`: expected ratios for high-signal single legacy codepoints or escaped labels.
- `sequenceRatios`: expected ratios for high-signal multi-character sequences.
- `coverageRange`: expected minimum/maximum coverage of known profile tokens in plain text.
- `minAutoSelectScore`: minimum score before automatic profile selection is allowed.
- `negativeSignals`: optional profile-specific signals that reduce confidence.
- `notes`: human-readable explanation.

Current ratios are provisional and used for diagnostics only. They are not proof of full Kantipur, Sagarmatha, or Himali support.
