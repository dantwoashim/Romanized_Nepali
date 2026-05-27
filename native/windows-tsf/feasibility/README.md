# Windows TSF Feasibility Spike

Goal: prove a minimal text service can receive key events, start composition, show a dummy candidate, commit static Unicode, and pass through when the daemon is unavailable.

Required interfaces:

- `ITfTextInputProcessor`
- `ITfTextInputProcessorEx` if activated on supported Windows versions
- `ITfKeyEventSink`
- composition manager
- candidate list UI
- language profile registration
- input scope checks for password and secure fields

Test apps:

- Notepad
- Word
- Chrome
- Edge
- VS Code
- Excel
- a government web form

Production blockers: code signing certificate, installer validation, Windows test matrix, and pilot feedback.
