# Repository Governance

This repository is maintained as a public validation product with strict privacy and data-source boundaries.

## Branch Protection Recommendations

For `main`, require:

- pull request before merge
- passing `Verify (Node 22.x)` and `Verify (Node 24.x)` checks
- passing `Quality report`
- review from a code owner
- conversation resolution before merge
- linear history if the maintainer prefers a clean release log

## Review Priorities

Reviewers should look first for:

- text leaving the browser without explicit user action
- unclear-licensed data
- Romanized behavior that violates `docs/PHONOLOGY_CONTRACT.md`
- Preeti conversion changes without fixtures
- user-facing claims that exceed validation evidence
- dependencies that add size, network behavior, or license risk

## Release Notes

Release notes should be concrete:

- what changed
- what workflows improve
- what remains limited
- what validation ran
- whether any data source changed

Avoid broad quality claims unless a named baseline and frozen evaluation set are recorded.
