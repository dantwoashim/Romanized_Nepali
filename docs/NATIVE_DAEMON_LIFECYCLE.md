# Native Daemon Lifecycle

The daemon hosts the shared keyboard engine outside the native IME shell. Native shells stay thin and fail open.

## Role

- Host `KeyboardEngine`.
- Maintain warm state.
- Own local memory, dictionary, and settings storage adapters.
- Serve Windows TSF and macOS IMK/XPC over local IPC.
- Serve companion app settings and diagnostics.
- Never send typed text to the network.
- Expose redacted `diagnostics.getMetrics` counters without typed text.

## Windows

- Preferred start: installer-registered user-login startup task or companion-managed daemon.
- TSF DLL reconnects non-blockingly on activation.
- TSF DLL may request lazy start only outside the hot path.
- IPC uses a per-user named pipe.
- If daemon is unavailable, TSF passes through raw keystrokes and records a local diagnostic.
- If daemon crashes mid-session, TSF times out, invalidates sessions, passes through, and requests restart outside the hot path.

## macOS

- Input method communicates through XPC.
- XPC service hosts the engine or bridges to the daemon.
- If XPC is unavailable, the input method passes through and does not freeze the host app.
- Local data uses App Group/shared container paths where needed.
- Sandboxing and input method restrictions must be validated on real macOS builds.

## Daemon API

The daemon implements the IPC messages in `native/shared/ipc`.

Runtime responsibilities:

- session TTL cleanup
- crash-safe memory flush
- warm partial state
- diagnostic status and redacted counters
- no remote network listener
- strict hot-path IPC timeouts

## Current Status

Prompt 1 production foundation provides scaffold and contract only. Production daemon implementation remains native/platform work.
