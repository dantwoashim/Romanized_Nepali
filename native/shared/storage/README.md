# Native Storage

Native storage is local-only and user-scoped.

Planned locations:

- Windows: `%APPDATA%/Lekh Keyboard/`
- macOS: `~/Library/Application Support/Lekh Keyboard/`

Prompt 3 defines storage contracts in `src/engine/keyboard/storage.ts` and adds repo-executable JSON file adapters in:

- `native/shared/storage/jsonFileStores.ts`
- `native/shared/storage/jsonFileStores.test.ts`

These adapters are suitable for development daemon builds and local proof spikes. SQLite remains the recommended production hardening path once native packaging, migrations, locking, and corruption recovery are validated. Browser Keyboard Lab may use in-memory or browser-local adapters. Secure fields must not record correction memory.
