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

These are repo-executable adapters for tests and the browser/web lab. Native SQLite adapters are future platform work.

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
