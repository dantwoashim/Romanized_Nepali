# Native Diagnostics

Diagnostics are local-first and should never contain raw typed text unless the user manually submits a redacted example with consent.

Recommended event categories:

- daemon unavailable
- IPC timeout
- XPC unavailable
- named pipe unavailable
- candidate UI fallback
- secure input pass-through
- storage unavailable
- native shell crash recovery

Companion diagnostics should summarize status and guide repair, not upload keystrokes.
