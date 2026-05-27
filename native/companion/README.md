# Lekh Companion Scaffold

The companion app is the settings, diagnostics, privacy, dictionary, memory, and document-tools surface. It is not the IME and not the hot keystroke handler.

Prompt 2 adds a lightweight web MVP shell at `src/features/companion/CompanionShell.tsx`. That shell is a repo-executable product scaffold and settings model preview. It does not add Tauri, does not globally hook keys, and does not read foreground text.

Planned pages:

1. Home/status
2. Typing settings
3. Romanized settings
4. Traditional layout settings
5. Dictionary
6. Personal memory
7. Privacy
8. Document tools and Preeti side utility
9. Diagnostics
10. About/update

No Tauri dependency is added in Prompt 2. The current browser Keyboard Lab remains the repo-executable simulator for keyboard behavior, while the Companion tab previews settings, privacy, dictionary, memory, diagnostics, updates, and the Preeti side utility.

Prompt 3 must decide the production desktop shell and wire it to native daemon/IPCs without making the companion app the IME.
