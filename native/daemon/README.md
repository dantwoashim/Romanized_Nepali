# Lekh Keyboard Daemon Scaffold

The daemon will host the shared `KeyboardEngine`, maintain warm state, own local storage adapters, and serve Windows TSF, macOS IMK/XPC, and the companion app over local-only IPC.

This folder is scaffold-only. No production daemon is wired into `npm run verify`.

## Responsibilities

- Load and warm the keyboard engine.
- Maintain session TTL cleanup.
- Serve the IPC messages defined in `native/shared/ipc`.
- Own crash-safe local memory and dictionary storage.
- Return partial warm state when heavy modules are unavailable.
- Never send typed text to the network.

## Failure Policy

If daemon IPC is unavailable, native input methods must pass through raw keystrokes and surface diagnostics later through the companion app. Host applications must never freeze while waiting for the daemon.
