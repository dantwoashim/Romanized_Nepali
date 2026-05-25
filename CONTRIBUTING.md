# Contributing

Lekh Assistant accepts contributions that improve Nepali desktop typing workflows while preserving the project's privacy and data boundaries.

Before changing behavior, read these contracts:

- [`docs/ENGINE_CONTRACT.md`](docs/ENGINE_CONTRACT.md)
- [`docs/PHONOLOGY_CONTRACT.md`](docs/PHONOLOGY_CONTRACT.md)
- [`docs/DATA_POLICY.md`](docs/DATA_POLICY.md)
- [`docs/DATA_SOURCES.md`](docs/DATA_SOURCES.md)
- [`docs/PRIVACY.md`](docs/PRIVACY.md)
- [`docs/KNOWN_LIMITATIONS.md`](docs/KNOWN_LIMITATIONS.md)

## Development Setup

Prerequisite: Node.js `^20.19.0` or `>=22.12.0`.

```bash
npm install
npm run dev
```

Run the full gate before opening a pull request:

```bash
npm run verify
npm audit --audit-level=moderate
npm run report:quality
```

## Contribution Rules

- Keep the app as one Vite + React + TypeScript project.
- Do not add a backend, cloud text processing, auth, sync, payments, native keyboard hooks, browser extension, or production desktop installer without a documented product decision.
- Every user-visible text output path must pass through `normalizeNepaliText`.
- Romanized behavior must follow `docs/PHONOLOGY_CONTRACT.md`.
- Add or update fixtures before changing transliteration behavior.
- Keep feedback explicit. Do not collect typed text, converted text, clipboard content, dictionary queries, spell tokens, or keystrokes automatically.
- Do not bundle unclear-licensed mappings, dictionaries, scraped documents, or private user text.
- Do not make public claims of official authority, government endorsement, perfect conversion, perfect transliteration, or best-in-class quality.

## Data Contributions

Safe data contributions include:

- manually curated words with source notes
- fixtures created by the contributor
- consented and de-identified real Preeti validation fixtures
- reviewed imports from sources documented in `docs/DATA_SOURCES.md`

Unsafe data contributions include:

- old documents without permission
- copied converter tables without a license
- private names, IDs, phone numbers, addresses, or institution records
- large dictionary imports without replacement instructions and third-party notices

For real Preeti validation, follow [`docs/REAL_PREETI_VALIDATION.md`](docs/REAL_PREETI_VALIDATION.md). Raw documents and private manifests must stay out of git.

## Pull Request Checklist

- The change is scoped and explained.
- Relevant fixtures were added or updated.
- `npm run verify` passes.
- `npm audit --audit-level=moderate` passes or the issue is documented.
- Data source and license notes are updated when data changes.
- README or docs are updated when behavior changes.
- Privacy boundaries remain intact.

## Issue Reports

Use the GitHub issue forms when possible. For examples that include private documents, do not paste the original text publicly. Use a minimal synthetic example or the explicit feedback path in the app.
