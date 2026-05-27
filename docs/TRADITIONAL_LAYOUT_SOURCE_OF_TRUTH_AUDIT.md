# Traditional Layout Source-of-Truth Audit

Generated: 2026-05-27

Traditional typing must not be implemented from guessed key mappings. The default layout must be grounded in a reviewed source-of-truth audit.

## Purpose

This audit decides which Traditional Nepali layout Lekh should implement first and how it differs from other variants.

The primary candidates are:

- LTK-compatible layout, if verified.
- Nepali Unicode keyboard standard layout from a verified authoritative source.
- Optional variants documented after the default is selected.

## Required Research Method

1. Record key to Unicode output from the current LTK online typing tool at `ltk.org.np`.
2. Record normal, Shift, AltGr/Option, and relevant modifier states.
3. Cross-reference against the Nepali Unicode keyboard standard from Madan Puraskar Pustakalaya or another verified authoritative source.
4. Document every difference as one of:
   - same as LTK;
   - same as standard;
   - LTK-specific variant;
   - unresolved.
5. Decide the MVP default layout based on:
   - LTK compatibility;
   - expected current LTK user behavior;
   - office/school familiarity;
   - implementation safety.
6. Produce final audited artifacts:
   - `data/layouts/traditional-ltk-compatible.json`;
   - `data/layouts/traditional-standard.json`;
   - a fixture file mapping physical key events to Unicode output;
   - a decision document.

## Prompt 1 Artifact Status

Prompt 1 creates only pending scaffolds:

- `data/layouts/traditional-ltk-compatible.pending.json`
- `data/layouts/traditional-standard.pending.json`
- `bench/fixtures/traditional-layout/layout-audit.pending.jsonl`

These files are not implementation truth. They exist to define schema, review status, and the manual capture path.

## Rules

- Do not infer layout semantics from vibes or memory.
- Do not scrape or copy unclear-license keymaps.
- Do not implement the Traditional engine from pending files.
- If web access or human layout verification is unavailable, keep actual key capture pending.
- Phase 0.5 audit may run in parallel with Phase 1.
- Traditional engine implementation belongs to Prompt 2 after the layout decision is available.

## Fixture Schema

Each audited key event fixture should include:

```json
{
  "id": "ltk_key_a_normal",
  "layoutId": "traditional-ltk-compatible",
  "status": "verified",
  "key": "a",
  "code": "KeyA",
  "modifiers": {
    "shift": false,
    "ctrl": false,
    "alt": false,
    "meta": false
  },
  "expectedOutput": "क",
  "source": "manual-ltk-capture",
  "sourceUrl": "https://ltk.org.np",
  "verifiedBy": "human reviewer",
  "notes": "Example only; do not copy into pending fixtures until verified."
}
```

## Current Decision

Layout capture is pending human/manual audit. Prompt 2 may implement only placeholder Traditional behavior if the final audited layout remains unavailable.
