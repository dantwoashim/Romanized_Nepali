# Lekh TSF Contract

The TSF DLL must be thin:

- receive key events,
- map the event into `KeyboardKeyEvent`,
- send `session.processKeyStroke` over a per-user named pipe,
- render native candidate UI from `CandidateUpdate`,
- commit text through TSF composition APIs,
- fail open/pass through on daemon timeout or unavailability.

The skeleton feasibility behavior is:

- key `k` may show dummy candidate `क`;
- Enter commits the dummy candidate;
- Escape cancels composition;
- daemon unavailable means pass-through;
- no engine logic lives inside the DLL.

Production requires signed binaries and a validated installer.
