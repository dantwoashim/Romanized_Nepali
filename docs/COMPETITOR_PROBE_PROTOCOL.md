# Competitor Probe Protocol

Checked: 2026-05-26

Competitor probes are manual black-box comparison fixtures. They are designed to compare user-visible behavior legally and narrowly.

## Rules

- Do not scrape competitors.
- Do not automate private APIs.
- Do not bypass limits.
- Do not decompile apps.
- Do not copy competitor code, maps, outputs, or data into Lekh.
- Do not train or tune directly from competitor outputs.
- Do not claim "beats Google" or "best" until the locked probe suite has enough manually verified cases and published methodology.

## Workflow

1. Lock a probe input and expected output in `bench/fixtures/competitor-probes/`.
2. Run `npm run benchmark:competitor` to record Lekh's local output.
3. Manually test public competitor UI if allowed by its terms.
4. Record only small observed outputs and notes in the probe file.
5. Publish methodology before making any comparative claim.

Empty competitor fields mean pending manual collection. The benchmark must not fail simply because competitor fields are blank.
