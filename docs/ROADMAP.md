# Roadmap

Checked: 2026-05-26

## Done In Repo-Executable Scope

- Engine facade and safety contracts.
- Input classification.
- Protected-span engine.
- Strict/mixed Romanized and Preeti wrappers.
- Lexical Authority Layer.
- Hunspell ranking and merge artifacts.
- Expanded aliases, names, places, domain phrases, and loanword/preserve dictionaries.
- Sliding-window phrase matching.
- Proofread/spell-hint foundation.
- Correction memory migration/scoring foundation.
- Legacy profile diagnostics and planned placeholders.
- Real document collection protocol.
- Competitor probe framework.
- Final scorecard generator.
- Public claims and input-surface strategy docs.

## Human-Data Next

- Collect 30-50 consented real Preeti/legacy documents.
- Redact, segment, and attach consent metadata.
- Add real-user Romanized failure examples as regression fixtures.

## Engineering Next

- Compact/lazy-load the expanded lexicon.
- Build browser IndexedDB correction-memory adapter and review UI.
- Expand proofread benchmark with real beta failures.
- Fill manual competitor probes.
- Improve Preeti mixed-document diagnostics from real samples.

## Platform Next

- Keep browser/PWA as validation surface.
- Consider Tauri companion after web engine quality is proven.
- Defer TSF/InputMethodKit until there is clear demand and quality evidence.
