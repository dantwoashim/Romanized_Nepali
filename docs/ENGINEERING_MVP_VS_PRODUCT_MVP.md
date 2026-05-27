# Engineering MVP vs Product MVP

Generated: 2026-05-27

The keyboard plan separates the engineering foundation from the native product release. This prevents the project from treating the browser simulator as the final app, and it prevents native work from starting before the typing engine is measurable.

## Engineering MVP

The Engineering MVP is the repo-executable foundation for keyboard behavior.

It includes:

- `KeyboardEngine` session API.
- Browser/web-lab typing simulator.
- Romanized and Traditional mode contracts.
- Candidate update contract.
- Commit and cancel behavior.
- Typing-session benchmarks.
- Warm startup contract.
- UTF-16 native range semantics.
- No native TSF/IMK requirement yet.

Prompt 1 builds this layer.

## Product MVP

The Product MVP is the actual Windows/macOS keyboard release direction.

It includes:

- native Windows system keyboard through TSF;
- native macOS input method through InputMethodKit;
- native candidate window;
- Romanized and Traditional live typing;
- proofread, dictionary, and memory;
- companion app;
- installer, updater, signing, and notarization.

Prompt 2 builds keyboard intelligence on the Engineering MVP. Prompt 3 moves toward native feasibility and release scaffolding.

## Browser Simulator Is Not The Final Keyboard

The browser lab proves the engine contract and lets contributors test behavior quickly. It does not replace:

- TSF composition lifecycle;
- IMK marked-text lifecycle;
- native candidate UI;
- daemon/IPC timeout handling;
- installer and input-source registration.

## Companion App Is Not The IME

The companion app controls settings, layouts, dictionary, memory, diagnostics, and side utilities. It should not pretend to be a system-wide keyboard by using fragile global hooks.

## Prompt Boundaries

Prompt 1:

- implements the session API and measurement foundation;
- does not implement production native IME work.

Prompt 2:

- implements live Romanized and Traditional intelligence;
- depends on the Traditional layout audit result.

Prompt 3:

- implements native feasibility skeletons and packaging/release scaffolding where repo-executable;
- documents external blockers such as signing, notarization, and OS-specific testing.

## Acceptance Principle

Keyboard work can proceed only when the browser/web-lab can simulate typing sessions through the same API the native bridge will later call.
