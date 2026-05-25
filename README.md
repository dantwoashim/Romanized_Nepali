# Lekh Assistant

[![CI](https://github.com/dantwoashim/Lekh_Assistant/actions/workflows/ci.yml/badge.svg)](https://github.com/dantwoashim/Lekh_Assistant/actions/workflows/ci.yml)

Lekh Assistant is a privacy-first Nepali typing assistant for desktop copy-paste workflows. It helps people convert legacy Preeti text to clean Unicode, type Romanized Nepali with local candidates, and copy normalized output into documents, forms, email, and browser tools.

This is a public web/PWA validation build. It is not a native keyboard, not a browser extension, and not a server-side text processor.

## Contents

- [Why It Exists](#why-it-exists)
- [What It Does](#what-it-does)
- [Privacy Model](#privacy-model)
- [Current Quality Evidence](#current-quality-evidence)
- [Run Locally](#run-locally)
- [Useful Commands](#useful-commands)
- [Project Shape](#project-shape)
- [Data Source Policy](#data-source-policy)
- [Feedback and Real-Document Validation](#feedback-and-real-document-validation)
- [Known Limitations](#known-limitations)
- [Maintainer Docs](#maintainer-docs)
- [License](#license)
- [What It Does Not Claim](#what-it-does-not-claim)

## Why It Exists

Nepali desktop work still has a rough edge: old Preeti documents, Unicode forms, Romanized typing habits, and mixed English/Nepali office text often meet in the same workflow. Lekh Assistant focuses on that narrow, practical problem.

The product direction is deliberately conservative:

- Keep text processing local.
- Prefer documented rules and fixtures over hidden magic.
- Show candidates when Romanized input is ambiguous.
- Treat Preeti conversion as validation work, not as a perfect legacy-font oracle.
- Avoid unclear-licensed language data.

## What It Does

### Preeti to Unicode

Preeti conversion is the primary tool. It wraps a documented converter baseline, preserves unknown characters instead of dropping them, reports uncertain mappings, and normalizes output before copy.

### Romanized Nepali Typing

Romanized typing is a beta `common-nepali` profile. It uses:

- phonology rules from [`docs/PHONOLOGY_CONTRACT.md`](docs/PHONOLOGY_CONTRACT.md)
- a candidate lattice for phrase, dictionary, rule, variant, and local correction paths
- domain-ranked local suggestions for office, government, education, legal, names, and places
- full-output alternatives so selecting a candidate does not collapse a sentence into a single word
- local correction memory after explicit candidate selection

### Suggestions and Spell Hints

Suggestions and basic unknown-word hints run against bundled local data. They are meant to help users discover likely words, not to certify spelling or grammar.

The larger Hunspell dictionary is lazy-loaded as a local browser chunk, so the first app load is not forced to carry the full spellchecking asset.

### PWA Shell

The production build writes a service worker that precaches the app shell and Vite hashed assets. Offline behavior is checked as part of `npm run verify`.

## Privacy Model

Typed text, converted text, dictionary queries, raw keystrokes, clipboard content, spell tokens, and output text stay in the browser. The app does not send them to a server.

Feedback is explicit. The app prepares a report only when the user chooses to copy or submit it. A deployment can enable email handoff with `VITE_FEEDBACK_EMAIL`; otherwise the report remains local.

Romanized correction memory uses browser local storage. It is written only after a user selects an alternative candidate, stays on that device, and can be cleared from the Romanized editor.

## Current Quality Evidence

Latest local validation, recorded on 2026-05-25:

| Gate | Status |
| --- | --- |
| Unit and smoke tests | 62 passing tests |
| Production build | Passing |
| Privacy guard | No text telemetry payloads found |
| Offline gate | Service worker precaches app shell and hashed assets |
| npm audit | 0 moderate-or-higher vulnerabilities |
| Preeti benchmark | 10,132 fixtures, exact match `1.0`, CER `0`, WER `0`, matra errors `0`, reph errors `0`, English preservation `1.0` |
| Romanized benchmark | 5,508 fixtures, top-1/top-3/top-5 `1.0`, MRR `1.0`, phrase/name accuracy `1.0`, mixed-English corruption `0`, suggestion hit@5 `0.9980` |
| Bundle shape | Initial JS `472.20 kB` minified / `114.15 kB` gzip; lazy Hunspell chunk `956.45 kB` / `176.58 kB` gzip |

Those numbers are internal fixture metrics. They are useful for regression control, but they are not a public superiority claim and they are not a substitute for consented real-document validation.

## Run Locally

Prerequisite: Node.js `^20.19.0` or `>=22.12.0`.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually:

```text
http://127.0.0.1:5173/
```

## Useful Commands

```bash
npm run test
npm run build
npm run check:privacy
npm run check:offline
npm run verify
npm run benchmark
npm run report:quality
npm run report:preeti
npm run dictionary:review
npm audit --audit-level=moderate
```

Fixture and data maintenance:

```bash
npm run generate:fixtures
npm run generate:wordlist
npm run ingest:preeti-real -- data/private/preeti-real-manifest.json
```

## Project Shape

```text
src/
  app/                 React app entry and shell
  components/          Shared UI primitives
  core/
    normalize/         Unicode normalization
    preeti/            Preeti conversion wrapper
    transliteration/   Romanized engine, candidates, local correction memory
    dictionary/        Local suggestions and spell hints
    validation/        Real Preeti intake and de-identification pipeline
  data/
    fixtures/          Generated and curated test fixtures
    wordlists/         Local curated seed/domain wordlist
  features/            Product surfaces
scripts/               Fixture, dictionary, quality, privacy, and offline gates
docs/                  Contracts, validation plans, data policy, notices
public/                Manifest and icons
```

Important contracts:

- [`docs/ENGINE_CONTRACT.md`](docs/ENGINE_CONTRACT.md)
- [`docs/PHONOLOGY_CONTRACT.md`](docs/PHONOLOGY_CONTRACT.md)
- [`docs/PRIVACY.md`](docs/PRIVACY.md)
- [`docs/DATA_SOURCES.md`](docs/DATA_SOURCES.md)
- [`docs/REAL_PREETI_VALIDATION.md`](docs/REAL_PREETI_VALIDATION.md)
- [`docs/VALIDATION_REPORT.md`](docs/VALIDATION_REPORT.md)
- [`docs/RELEASE_CHECKLIST.md`](docs/RELEASE_CHECKLIST.md)
- [`docs/REPOSITORY_GOVERNANCE.md`](docs/REPOSITORY_GOVERNANCE.md)

## Data Source Policy

Bundled data must have a documented source and license status. The app currently uses:

- project-owned seed words and domain packs
- seed-derived surface forms
- Romanized phrase and alias ranking packs
- 5,000 generated Romanized fixtures plus 500 manual benchmark cases
- 10,000 Preeti round-trip fixtures plus hard manual benchmark cases
- separate Preeti manual, generated, held-out, competitor-probe, and user-submitted fixture buckets
- `@nepalibhasha/converter` as the Preeti baseline
- `dictionary-ne` and `nspell` for browser-local spell validation, with LGPL/MIT notices and a replacement path

No GPL, noncommercial, unclear-license mapping table, scraped private-like document, or unclear-license corpus is bundled in production.

## Feedback and Real-Document Validation

Use the in-app feedback panel for explicit examples the user wants reviewed. Private documents should not be pasted into feedback.

Real Preeti validation has a separate intake path:

1. Collect written permission for each source document.
2. Keep raw documents and private manifests under ignored `data/private/`.
3. Run `npm run ingest:preeti-real -- data/private/preeti-real-manifest.json`.
4. Review de-identified fixtures and failure tags.
5. Promote only safe, consented, de-identified fixtures.

The current real-document collection count is `0`. Public real-document quality claims remain blocked until the project has 30-50 consented Preeti documents from target workflows.

## Known Limitations

- Preeti conversion is practical but not perfect. Legacy font documents can contain ambiguous or font-specific text.
- Romanized typing is a beta common-Nepali profile, not an official Romanization standard.
- The dictionary has curated domain packs and generated surface forms, not a complete Nepali dictionary.
- Spell hints are local unknown-word hints only. They are not grammar checks.
- The larger Hunspell spell asset is lazy-loaded locally; first-use spell hints can lag slightly on slower machines.
- Suggestions focus on the trailing typed token. Candidate alternatives are full-output ranked paths, but cursor-aware editing in the middle of a sentence is future work.
- Local correction memory improves exact repeated inputs on the same browser only.
- Generated Preeti round-trip fixtures are regression tests, not proof of real-world document coverage.
- Varnavinyas orthography checking is only a disabled local development probe.
- Offline support applies after the first successful load.

## Maintainer Docs

- [Contributing](CONTRIBUTING.md)
- [Security policy](SECURITY.md)
- [Support](SUPPORT.md)
- [Code of conduct](CODE_OF_CONDUCT.md)
- [Third-party notices](docs/THIRD_PARTY_NOTICES.md)

## License

MIT. See [`LICENSE`](LICENSE).

## What It Does Not Claim

Lekh Assistant does not claim official language authority, government endorsement, perfect Preeti conversion, perfect transliteration, official spellchecking, grammar correction, native Windows/macOS keyboard support, a browser extension, sync, accounts, payments, cloud proofreading, or server-side text processing.
