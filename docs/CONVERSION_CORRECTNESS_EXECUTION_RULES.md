# Conversion Correctness Execution Rules

Checked: 2026-05-26

## Preserve Existing Infrastructure

The following infrastructure must be preserved and improved, not replaced blindly:

1. `src/engine` facade
2. existing `ConversionResult` contract
3. existing protected span engine and detectors
4. existing classifier module
5. existing proofread module
6. existing memory module
7. existing benchmark/report structure
8. existing UI components: `RomanizedEditor.tsx`, `CandidateBar.tsx`, `SpellHintPanel.tsx`, `PreetiConverter.tsx`
9. existing core converters until new engine paths prove equivalence
10. existing data governance docs
11. existing public claim policy

## No-Rewrite Rule

Do not replace a working converter in one step.

Wrap first. Test second. Add regression coverage third. Cut over only after benchmark proof. Keep the fallback path until the new route passes hard fixtures.

This repository is not greenfield. The current protected-span, classifier, benchmark, memory, proofread, Preeti, and Romanized paths are valuable infrastructure.

## No Silent Corruption

The product guarantee is:

1. convert correctly when confidence is provable;
2. show ranked candidates when ambiguous;
3. preserve, warn, or refuse mutation when unsafe.

Any new rule must be fixture-backed and must avoid broad mutation when source evidence is ambiguous.

## Diagnostic Fingerprint

`DiagnosticFingerprint` is defined in `src/engine/legacy/profile.ts` and used by legacy font profiles.

Fields:

- `glyphRatios`: expected ratios for high-signal single legacy codepoints or escaped labels.
- `sequenceRatios`: expected ratios for high-signal multi-character sequences.
- `coverageRange`: minimum and maximum expected profile-token coverage in plain text.
- `minAutoSelectScore`: threshold for automatic profile selection.
- `negativeSignals`: optional profile-specific confidence reducers.
- `notes`: human-readable explanation of the signals.

Current profile ratios are provisional. Preeti uses safe baseline conversion; Kantipur, Sagarmatha, and Himali remain diagnostic placeholders until verified bundle-safe maps exist.

## Benchmark Truth Rules

- No benchmark may pass with zero cases unless explicitly marked pending.
- Held-out suites with exact source overlap must fail or be reclassified away from public proof.
- Generated/self-consistency fixtures are useful for regression but are not public quality evidence.
- Scorecards must include generated timestamps and commands.
- Contaminated suites are reported and excluded from public proof.

## Prompt Boundaries

Prompt 1 fixes verification truth, six targeted bugs, UI engine routing, diagnostic fingerprints, and scorecard hygiene.

Prompt 2 should handle deterministic Preeti core work, source-text audit, verifier, oracle, and fuzz factory.

Prompt 3 should handle Romanized candidate intelligence, alias factory, ranking/confidence/memory, and final public scorecard gates.

