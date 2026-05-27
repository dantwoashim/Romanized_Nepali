# Native Storage Adapters

Storage contracts are defined in `src/engine/keyboard/storage.ts`.

## Interfaces

- `KeyboardSettingsStore`
- `PersonalDictionaryStore`
- `KeyboardCorrectionMemoryStore`

## Current Adapters

- `InMemoryKeyboardSettingsStore`
- `InMemoryPersonalDictionaryStore`
- `InMemoryKeyboardCorrectionMemoryStore`
- `JsonFileKeyboardStorage`
- `JsonFileKeyboardSettingsStore`
- `JsonFilePersonalDictionaryStore`
- `JsonFileCorrectionMemoryStore`

The in-memory adapters are repo-executable adapters for tests and the browser/web lab. The JSON file adapters under `native/shared/storage/jsonFileStores.ts` are development-native adapters for the daemon proof path. Native SQLite adapters remain a production hardening option after daemon packaging and migration/locking behavior are validated on target platforms.

## Native Paths

- Windows: `%APPDATA%/Lekh Keyboard/`
- macOS: `~/Library/Application Support/Lekh Keyboard/`

## Privacy Rules

- Secure/password/code fields must not record memory.
- Export/import payloads must be versioned.
- No server sync in MVP.
- No hidden telemetry.
- Typed text may appear only in local memory when the user accepts candidates outside secure contexts.

## SQLite Future Path

The daemon should own SQLite access and expose settings, dictionary, and memory over local IPC. Native shells should not directly mutate shared storage.

## JSON File Adapter Status

- Atomic write path: write temp file, then rename.
- Export/import: versioned dictionary and memory payloads.
- Privacy: secure/password/code contexts return no correction memory.
- Per-user path helpers:
  - Windows: `%APPDATA%/Lekh Keyboard/`
  - macOS: `~/Library/Application Support/Lekh Keyboard/`
  - Linux/dev: `~/.local/share/lekh-keyboard`

Validation command:

```bash
npm run test:native-scaffold
```
