# Windows TSF Feasibility Spike

Status: scaffolded, not production.

Files:

- `native/windows-tsf/README.md`
- `native/windows-tsf/feasibility/README.md`
- `native/windows-tsf/skeleton/LekhTextService.placeholder.cpp`
- `native/windows-tsf/skeleton/CMakeLists.txt`
- `native/windows-tsf/skeleton/lekh_tsf_contract.md`

## Feasibility Goal

Prove a Windows Text Services Framework text service can:

- receive key events,
- start composition,
- show a dummy candidate,
- commit static Unicode,
- pass through when the daemon is unavailable,
- register and unregister cleanly.

## Interfaces To Implement

- `ITfTextInputProcessor`
- `ITfTextInputProcessorEx` where appropriate
- `ITfKeyEventSink`
- composition manager
- candidate list UI
- language profile registration
- input scope detection for password and secure fields

## Skeleton Behavior

- Test key `k` can produce dummy candidate `क`.
- Enter commits dummy candidate.
- Escape cancels.
- Daemon unavailable means pass-through.
- The TSF DLL contains only marshaling/fallback logic, not the engine.

## IPC

Windows uses a per-user named pipe to the daemon. Keystroke requests use `session.processKeyStroke` with a hard 50 ms timeout.

## Test Matrix

- Notepad
- Word
- Chrome
- Edge
- VS Code
- Excel
- a government web form

## Production Blockers

- Windows code-signing certificate.
- Installer validation.
- Real Windows TSF test matrix.
- Crash and update testing.
- Pilot feedback.
