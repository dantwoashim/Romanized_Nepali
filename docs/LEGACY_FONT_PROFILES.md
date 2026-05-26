# Legacy Font Profiles

Checked: 2026-05-26

Lekh supports Preeti through the verified MIT `@nepalibhasha/converter` baseline wrapped by project normalization, diagnostics, and protected-span handling.

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
- `src/engine/legacy/atoms.ts`: typed atom model.
- `src/engine/legacy/parseGlyphs.ts`: profile-aware glyph atom parsing.
- `src/engine/legacy/diagnostics.ts`: confidence, unknown glyph, matra/reph/conjunct diagnostic fields.
- `src/engine/legacy/reorder.ts`: clean-room Preeti postrule exports.
- `data/legacy-fonts/profiles/*.json`: profile metadata and planned placeholders.

Low-confidence or planned profiles return diagnostics instead of guessed conversion.
