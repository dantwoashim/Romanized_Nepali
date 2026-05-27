# Companion App MVP

Prompt 2 status: lightweight web scaffold added.

The companion app is the settings, privacy, dictionary, memory, diagnostics, and document-tools surface. It is not the IME, not a hot keystroke handler, and not a global keyboard hook.

## Scaffold

Files:

- `src/features/companion/CompanionShell.tsx`
- `src/features/companion/settings.ts`
- `native/companion/README.md`

The main app exposes a Companion tab so Prompt 2 reviewers can inspect the product shell without adding Tauri or native dependencies.

## Pages Represented

- Home/status
- Mode settings
- Romanized preferences
- Traditional layout settings
- Layout preview
- Candidate behavior
- Proofread settings
- Dictionary manager
- Personal memory
- Privacy
- Diagnostics
- Preeti side utility
- Import/export
- Updates/about

## Boundaries

- The companion does not read foreground text.
- It does not globally hook keys.
- It does not send typed text anywhere.
- Preeti remains a side utility.
- Native Windows TSF and macOS IMK are still Prompt 3/native-environment work.
