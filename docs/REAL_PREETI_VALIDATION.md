# Real Preeti Validation Intake

The 10,000 generated Preeti fixtures are useful regression coverage, but they are not a substitute for consented real documents. Public release claims must separate generated round-trip coverage from real document validation.

Use `docs/REAL_DOCUMENT_COLLECTION_PACKET.md` for consent language, quotas, and review checklists.

## Collection Gate

Collect 30-50 consented documents before claiming real-document quality:

- 10-15 office/government/admin documents.
- 8-12 school/admin documents.
- 5-10 legal/accounting documents.
- 5-10 mixed tables/forms/letters from target desktop workflows.

Each source must have written permission from the document owner or authorized holder. Do not commit raw source files.

## Metadata Required

Use `src/data/validation/preeti-real-manifest.example.json` as the manifest shape.

Required fields per document:

- `id`: stable local id, not a person or institution name.
- `domain`: `government`, `education`, `legal`, `office`, or `other`.
- `sourceLabel`: de-identified label.
- `permission.permissionId`: written permission reference.
- `permission.holderRole`: role of the person granting permission.
- `sourceFormat`: `docx`, `pdf-copy`, `txt`, `spreadsheet-copy`, or `other`.
- `failureTypes`: expected risk tags such as `matra-reordering`, `half-letter`, `reph`, `layout`, or `font-variant`.
- `redactions`: explicit names, offices, IDs, phone numbers, and addresses to redact after conversion.

## Ingest Command

Keep private manifests under `data/private/`, which is ignored by git:

```bash
npm run ingest:preeti-real -- data/private/preeti-real-manifest.json
```

The script converts through the same Preeti wrapper, de-identifies Unicode output, segments sentence/table/form fixtures, and writes de-identified generated output under `data/generated/` by default.

## Release Rule

Do not describe Preeti as validated on real documents until the manifest has at least 30 consented documents and the fixture report records exact conversion rate, warning rate, and top failure categories.
