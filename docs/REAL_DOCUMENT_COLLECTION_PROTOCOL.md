# Real Document Collection Protocol

Checked: 2026-05-26

Lekh may use real Preeti/Kantipur/Sagarmatha/Himali/Unicode documents only after explicit consent and redaction. No real user documents are currently committed.

## Folder Policy

| Folder | Policy |
| --- | --- |
| `data/user-submitted/raw/` | Raw files only; gitignored by default |
| `data/user-submitted/private/` | Private working files only; gitignored by default |
| `data/user-submitted/redacted/` | Redacted working text; do not commit unless reviewed |
| `data/user-submitted/fixtures/` | Committed fixtures only after consent and PII review |
| `data/user-submitted/metadata/` | Consent metadata using `consent.schema.json` |
| `bench/private/` | Private benchmark scratch space; gitignored |
| `competitor/raw/` | Manual competitor collection notes; gitignored |

## Consent Requirements

Every real fixture must reference consent metadata with:

- document id
- contributor name or alias
- consent statement
- consent date
- allowed use
- redistribution permission
- redaction status
- PII status
- source font profile
- received by
- reviewer
- notes

## Redaction Requirements

Remove or replace private identifiers before a fixture can be committed:

- personal names where not explicitly allowed
- phone numbers
- citizenship numbers
- addresses
- financial IDs
- signatures
- school/government private identifiers
- health/legal private details

Health and legal documents require extra review and should not be used for public examples unless consent explicitly allows it.

## Safety Gate

Run:

```bash
npm run check:user-data
```

The gate fails if raw/private paths are tracked, committed fixtures lack consent references, consent metadata is incomplete, or simple PII patterns appear in fixture paths.
