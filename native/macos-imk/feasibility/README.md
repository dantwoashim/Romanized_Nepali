# macOS IMK Feasibility Spike

Goal: prove an input method receives key events, sets marked text, shows a dummy candidate, commits static Unicode, and passes through when XPC is unavailable.

Required components:

- `IMKInputController`
- `IMKCandidates`
- marked text
- commit text
- input source registration
- app bundle under `~/Library/Input Methods/`
- XPC service for engine access
- App Group/shared container if needed

Test apps:

- TextEdit
- Safari
- Chrome
- Pages
- VS Code
- Notes

Production blockers: Apple Developer ID, notarization, XPC/sandbox validation, macOS test matrix, and pilot feedback.
