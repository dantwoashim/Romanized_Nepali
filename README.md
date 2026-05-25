# Lekh Assistant

## What This Is

Lekh Assistant is a privacy-first Nepali typing assistant for desktop copy/paste workflows. It is a public web/PWA validation product, not a native keyboard.

## What It Does

- Converts legacy Preeti text to normalized Unicode through a validation converter.
- Provides a beta Romanized Nepali typing editor with local candidates.
- Shows local dictionary suggestions and basic unknown-word hints.
- Copies normalized Unicode output for use in documents, forms, email, and browser workflows.
- Collects explicit feedback examples when the user chooses to submit or copy a report.

## Privacy Guarantee

Typed text, converted text, dictionary queries, raw keystrokes, clipboard content, spell tokens, and output text are processed in the browser. They are not sent to a server by the app. Feedback contains only what the user explicitly enters and submits or copies.

## Known Limitations

- Preeti conversion is useful for validation, but not perfect. Legacy font documents can contain ambiguous or font-specific text.
- Romanized typing is a beta common-Nepali profile, not Google-quality transliteration and not an official standard.
- Spell hints are local unknown-word hints only. They are not grammar checks or certified spelling corrections.
- The bundled dictionary has curated domain packs and generated surface forms, not a complete Nepali dictionary.
- Suggestions currently focus on the trailing typed token.
- Offline support applies after the first successful load.

## Data Source Policy

Bundled data must have a documented source and license status. The current app uses project-owned seed words, documented seed-derived surface forms, 5,000 Romanized fixtures, 10,000 Preeti fixtures, and the MIT-licensed `@nepalibhasha/converter` package as the Preeti baseline. Full Nepali Hunspell data and Varnavinyas are not bundled in production; they are documented as reviewed future sources.

## How To Run

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run test
npm run build
npm run check:privacy
npm run verify
npm audit --audit-level=moderate
```

## Feedback Path

Use the in-app feedback panel to copy a report. A deployment can enable the email action by setting `VITE_FEEDBACK_EMAIL`.

## What It Does Not Claim

Lekh Assistant does not claim official language authority, government endorsement, perfect Preeti conversion, perfect transliteration, official spellchecking, grammar correction, native Windows/macOS keyboard support, a browser extension, sync, accounts, payments, or server-side text processing.
