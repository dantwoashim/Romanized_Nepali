# Data Policy

Lekh data is local, bundled, and documented.

## Allowed

- Manually curated seed words owned by this project.
- User-submitted examples only after explicit submission and consent copy.
- Future imports from external dictionaries only after license review.
- Local browser correction memory after an explicit candidate selection.
- Consented real Preeti validation documents processed through the private intake pipeline.

## Not Allowed

- Bundling unclear-licensed wordlists.
- Copying legacy converter tables without permission.
- Collecting pasted documents or private text automatically.
- Sending dictionary queries, spell tokens, typed text, converted text, clipboard content, or output to a server.
- Committing raw real-user documents, private manifests, or unde-identified validation data.

## Current Status

The MVP uses a curated seed list, fixture data, optional local correction memory, and `dictionary-ne` through `nspell` for browser-local spell validation. Romanized candidate ranking still relies on reviewed seed/domain rows and phrase overrides; generated dictionary aliases are not promoted without human review.
