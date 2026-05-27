# Native Daemon Lifecycle

Generated: 2026-05-27

The native keyboard product should keep host-app integration thin and crash-safe by using a local engine daemon/service.

## Windows

Preferred process:

- `lekh-imed.exe` is registered by the installer as a per-user login startup task or companion-managed background daemon.
- The TSF DLL reconnects to it.
- The TSF DLL may attempt a safe lazy start only if allowed and non-blocking.

If the daemon is unavailable:

- pass keystrokes through;
- clear unsafe composition state;
- never freeze the host app;
- surface diagnostics in the companion app.

If the daemon crashes mid-session:

- IPC calls time out;
- TSF fails open/pass-through;
- restart happens outside the hot path with bounded backoff;
- typed content is not written to crash logs by default.

## macOS

Preferred process:

- IMK bundle communicates through XPC.
- XPC service hosts the engine or bridges to a daemon.
- If XPC is unavailable, pass through safely.

## Hot Path Rule

Native hot-path calls must have strict timeouts. No IPC call may block the target application indefinitely.

## Storage

Windows:

```text
%APPDATA%/Lekh Keyboard/
```

macOS:

```text
~/Library/Application Support/Lekh Keyboard/
```

## Prompt 1 Status

This is a specification only. Production daemon code is deferred.
