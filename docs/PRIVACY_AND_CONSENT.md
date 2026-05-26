# Privacy And Consent

Checked: 2026-05-26

The runtime product remains local-first: typed text, converted text, protected spans, spell tokens, correction memory, and benchmark text must not leave the browser automatically.

Feedback is separate: only explicit user submissions may leave the browser, and those submissions must be treated as user-provided examples, not ambient telemetry.

## Real Documents

No raw real documents are committed. Real document validation requires the protocol in `docs/REAL_DOCUMENT_COLLECTION_PROTOCOL.md`.

Raw documents stay gitignored. Redacted fixtures require consent metadata and PII review before they enter the repository.

## Local Memory

Correction memory is user-local. Prompt 3 adds a schema-v2 migration and storage abstraction, but memory remains separate from the global bundled lexicon and must not be uploaded or promoted automatically.

## Competitor Probes

Competitor outputs are manual black-box comparison notes only. They are not training data, not copied rules, and not a source for bundled mappings.
