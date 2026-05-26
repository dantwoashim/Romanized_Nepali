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

## Implementation Boundaries

The foundation layer covers verification truth, targeted bug fixes, UI engine routing, diagnostic fingerprints, and scorecard hygiene.

The Preeti decoder covers deterministic legacy-font conversion, source-text audit, verifier, oracle, and fuzz factory.

The Romanized correctness layer covers candidate intelligence, alias factory, ranking, confidence, memory, and public scorecard gates.

## Preeti Cutover Rule

The deterministic Preeti decoder is built beside the baseline converter:

1. Build semantic profile maps from verified-safe bundled sources only.
2. Tokenize with greedy longest-match mapping.
3. Assemble Unicode through typed atoms and reviewed token previews.
4. Verify structural safety.
5. Compare against the baseline.
6. Select atom output only when requested or verifier-gated by `legacyDecoder: "auto"`.

The default path must keep the baseline fallback. Unsupported profiles must stay diagnostic-only until legal, reviewed maps exist.

## Romanized Cutover Rule

The Romanized engine keeps the existing core converter and adds correctness controls behind `src/engine`:

1. Tokenization, syllable candidates, number policy, loanword policy, and confidence diagnostics live in `src/engine/romanized`.
2. Local correction memory may boost exact user-approved choices, but it must not become bundled global lexicon data.
3. Weighted alias variants are generated for recall and collision review; collisions are not hidden and do not automatically become public-proof data.
4. Phrase-first mixed conversion may bypass protected-node segmentation only when every protected original survives byte-exactly.
5. Candidate explosion is controlled by hard caps.
6. `benchmark:romanized:self` verifies facade invariants, while `benchmark:romanized` remains the quality benchmark.
7. Competitor claims remain blocked until manual probe outputs exist.
