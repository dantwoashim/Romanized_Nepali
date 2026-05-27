# Daemon Protocol

The daemon protocol is the IPC contract in `native/shared/ipc`.

Lifecycle:

1. Companion or installer starts daemon at login.
2. Native input shell performs `health.check`.
3. Native input shell calls `engine.warm` with a short timeout.
4. Native input shell begins a session for each focused editable field.
5. Keystrokes use `session.processKeyStroke`.
6. Browser-style composition uses `session.updateComposition`.
7. Candidate actions use commit/cancel/end messages.
8. Daemon flushes local memory on safe intervals and shutdown.

Keystroke calls must use a hard 50 ms timeout and fail open.
