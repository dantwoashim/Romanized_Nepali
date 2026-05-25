# Known Limitations

- Preeti conversion is practical but not perfect. Mixed English inside old Preeti-font documents may require manual correction because font-encoded text is ambiguous.
- Romanized typing is a beta common-Nepali profile, not official Romanization and not Google-quality transliteration.
- The dictionary has curated domain packs and generated surface forms, but it is still not a complete Nepali dictionary.
- Romanized suggestions currently focus on the trailing typed token. Cursor-aware suggestions for editing the middle of a sentence are future work.
- Generic halanta handling covers the week-one regression set, but broad schwa deletion and every possible consonant cluster are not solved.
- Romanized failures are expected during validation; reported examples should become regression fixtures before behavior changes.
- The Preeti converter is a validation converter. It uses a documented baseline and local normalization, but legacy font documents can still contain ambiguous or font-specific cases.
- Spell hints are local unknown-word hints only. They are not grammar correction, certified spellchecking, or official orthography validation.
- Varnavinyas orthography checking is only a disabled local development probe. It is not part of the shipped production path yet.
- Offline support applies after first successful load.
- Feedback capture requires an explicit user action and may need a deployment email configured.
- Traditional layout support is reference-only in week one.
- No native Windows/macOS keyboard, browser extension, mobile keyboard, sync, accounts, cloud proofreading, or production desktop installer is included.
