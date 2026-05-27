# Daemon and IPC Implementation Report

Generated: 2026-05-28

Status: repo-executable development daemon complete; production OS service packaging remains native-platform work.

## Implemented

- `native/shared/ipc/messages.ts`
  - canonical message type list;
  - request/response builders;
  - runtime envelope validation;
  - error response builder.
- `scripts/check-ipc-schema.ts`
  - verifies schema message types match TypeScript message types;
  - rejects schema drift.
- `native/daemon/src/keyboardDaemon.ts`
  - hosts `KeyboardEngine`;
  - handles all Prompt 3 IPC methods;
  - tracks redacted diagnostics;
  - supports hot-path timeout fallback;
  - shuts down cleanly.
- `native/shared/storage/jsonFileStores.ts`
  - development-native JSON file settings, dictionary, and memory stores;
  - versioned export/import/reset behavior;
  - secure-context memory suppression.

## Verification

- `npm run check:ipc-schema` passes.
- `npm run test:native-scaffold` passes.
- `npm run build:daemon` passes.
- `npm run typecheck` passes after daemon/storage changes.

## IPC Coverage

The daemon dispatches:

- `health.check`
- `engine.warm`
- `session.begin`
- `session.processKeyStroke`
- `session.updateComposition`
- `session.commitCandidate`
- `session.commitRaw`
- `session.cancel`
- `session.end`
- `session.setMode`
- `session.setLayout`
- `suggestions.get`
- `proofHints.get`
- `dictionary.lookup`
- `memory.learn`
- `diagnostics.getMetrics`
- `engine.shutdown`

## Security and Fallback

- No remote TCP listener exists.
- IPC schema is local-only and versioned.
- Hot-path timeout fallback increments diagnostics and returns pass-through data.
- Native shells must fail open rather than freeze host apps.
- Typed text is not sent over network.

## Production Remaining Work

| Item | Status | Reason | Next action |
| --- | --- | --- | --- |
| Windows named pipe transport | blocked-native-environment | Requires Windows ACL and TSF host validation. | Implement client/server around the existing schema on Windows. |
| macOS XPC transport | blocked-native-environment | Requires installed input method and XPC validation. | Wrap the daemon dispatcher in an XPC service. |
| OS service packaging | blocked-native-environment | Requires launch/startup integration and installer validation. | Add per-user service registration after native proof spikes. |
| SQLite adapter | partial | JSON file adapter exists for dev proof path. | Add SQLite only after migration/locking behavior is validated. |

## Launch Readiness

The daemon contract is ready for native implementation. It is not a packaged Windows/macOS production service yet.
