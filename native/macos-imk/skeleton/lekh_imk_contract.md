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

- test key `k` sets marked text and may show dummy candidate `क`;
- Enter commits dummy text;
- Escape cancels marked text;
- XPC failure or timeout passes through.

Hot path requirements:

- XPC service name: `com.lekh.keyboard.EngineXPC`;
- common target: under 10 to 20 ms;
- hard timeout: 50 ms;
- timeout fallback: preserve marked text if already active, otherwise pass through raw key;
- never block host apps while launching or reconnecting the XPC service.

Secure input:

- password/secure fields pass through or suppress suggestions/memory according to OS policy;
- no typed text leaves the local XPC boundary.

Production requires Developer ID signing and notarization.
