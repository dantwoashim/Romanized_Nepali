# Native Storage

Native storage is local-only and user-scoped.

Planned locations:

- Windows: `%APPDATA%/Lekh Keyboard/`
- macOS: `~/Library/Application Support/Lekh Keyboard/`

Prompt 3 defines storage contracts in `src/engine/keyboard/storage.ts`. SQLite is the recommended native adapter once the daemon exists. Browser Keyboard Lab may use in-memory or browser-local adapters. Secure fields must not record correction memory.
