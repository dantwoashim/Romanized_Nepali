# Lekh TSF Contract

The TSF DLL must be thin:

- receive key events,
- map the event into `KeyboardKeyEvent`,
- send `session.processKeyStroke` over a per-user named pipe,
- render native candidate UI from `CandidateUpdate`,
- commit text through TSF composition APIs,
- fail open/pass through on daemon timeout or unavailability.

The skeleton feasibility behavior is:

- key `k` starts a dummy composition and may show candidate `क`;
- Enter commits the dummy candidate;
- Escape cancels composition;
- daemon unavailable or IPC timeout means pass-through;
- no engine logic lives inside the DLL.

Hot path requirements:

- named pipe: per-user `\\.\pipe\LekhKeyboard-${USER-SID}`;
- common target: under 10 to 20 ms;
- hard timeout: 50 ms;
- timeout fallback: preserve composition if already marked, otherwise pass through raw key;
- never block the host app while launching or reconnecting the daemon.

Production requires signed binaries and a validated installer.
