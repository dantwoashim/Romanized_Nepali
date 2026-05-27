# Lekh IMK Contract

The IMK bundle must be thin:

- receive key events through `IMKInputController`;
- translate them into `KeyboardKeyEvent`;
- call the engine through an XPC service;
- use marked text for composition preview;
- use `IMKCandidates` for first candidate UI;
- commit selected text through IMK APIs;
- pass through on XPC timeout or unavailability.

The skeleton feasibility behavior is:

- test key `k` may emit dummy candidate `क`;
- Enter commits;
- Escape cancels;
- XPC failure passes through.

Production requires Developer ID signing and notarization.
