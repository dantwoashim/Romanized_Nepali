# Correction Memory

Checked: 2026-05-26

Correction memory is local user preference data. It is not a global dictionary and must not be uploaded or bundled into public lexicon data.

## Implemented

- Schema-v2 `CorrectionMemoryEntry`.
- Migration from existing Romanized correction entries.
- Duplicate merge.
- Pure storage abstraction for core tests.
- Export/import JSON.
- Reset support through the storage abstraction.
- Scoring that requires exact normalized input match.
- Protected-span guard so memory cannot rewrite hard preserved spans.

## Storage Boundary

The pure engine layer does not access browser APIs. The storage abstraction is ready for an IndexedDB adapter outside the no-DOM hot path. Existing browser storage code remains in the old adapter until the UI migration is completed.

## Ranking Policy

- Exact normalized input match gets strongest boost.
- Context windows add boost for ambiguous terms.
- Pinned/repeated entries can rank higher.
- Memory never becomes bundled lexicon automatically.
- Memory must not override hard protected spans.
- Memory should not override high-confidence curated phrases unless future repeated/pinned policy explicitly allows it.

## Remaining Work

Prompt 3 implements the repo-executable migration and scoring foundation. A browser IndexedDB adapter and UI review/export/import flow are still product work.
