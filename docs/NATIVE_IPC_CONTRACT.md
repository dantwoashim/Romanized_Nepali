# Native IPC Contract

Generated: 2026-05-27

This contract defines the future boundary between native TSF/IMK surfaces and the Lekh engine daemon.

## Transport

Windows:

- Named pipe preferred.
- Production messages should be length-prefixed CBOR.
- JSON is allowed only for debug builds.

macOS:

- XPC preferred and required for the first serious native architecture.
- If an XPC service bridges to a daemon, that bridge must preserve timeout and privacy rules.

## Request Shape

Native bridges send:

- session lifecycle events;
- normalized `KeyboardKeyEvent`;
- composition updates where native APIs expose full marked text;
- candidate selection;
- raw commit;
- cancel;
- mode/layout changes;
- context updates with secure-field flag.

## Response Shape

Engine responses mirror `CandidateUpdate` and `CommitResult`:

- composition text;
- display text;
- candidate list;
- proof hints;
- warnings;
- confidence;
- consumed/replacement ranges;
- follow-up candidates.

## Timeout Policy

- Every hot-path request must have a strict timeout.
- Timeout response is pass-through, not retry-in-loop.
- Reconnects happen outside the UI thread.

## Privacy Policy

- No network socket in typing path.
- Pipe/XPC access is per-user.
- Diagnostics redact protected tokens by default.
- Secure/password/code fields disable suggestions and memory.

## Prompt 1 Status

Specification only. No native IPC implementation is added in Prompt 1.
