# Proofread Engine

Checked: 2026-05-26

The proofread layer is a conservative local post-conversion pass. It can run after Romanized conversion, Preeti conversion, or Unicode passthrough when `proofread` is explicitly enabled.

## Behavior

- Auto-fix only high-confidence curated corrections.
- Keep ambiguous/style cases as hints.
- Segment around protected spans before changing text.
- Do not change emails, URLs, IDs, acronyms, or protected English/digital spans.
- Emit structured warnings and `ConversionResult.proofread` details.

## Rule Families

| Rule family | Examples | Default action |
| --- | --- | --- |
| Postposition spacing | `विद्यालय को` -> `विद्यालयको` | auto-fix when enabled |
| Plural normalization | `नामहरु`, `नाम हरु मा` -> `नामहरू`, `नामहरूमा` | auto-fix when enabled |
| Common spelling | `सवस्थ्य` -> `स्वास्थ्य`, `प्रनलि` -> `प्रणाली` | auto-fix when enabled |
| Halant cleanup | `मन्त्रिपरिषद` -> `मन्त्रिपरिषद्` | auto-fix when enabled |
| Punctuation | Nepali sentence-ending `.` -> `।`, duplicate danda collapse | auto-fix when enabled |
| Dictionary nearest | local dictionary suggestion for unknown tokens | hint-only |

## Benchmark

Run:

```bash
npm run benchmark:proofread
```

Current suite: 9 fixtures, exact match `1.0000`, auto-fix precision proxy `1.0000`. This is a small curated suite, not a broad grammar/proofreading claim.
