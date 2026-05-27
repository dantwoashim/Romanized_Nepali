# Universal Span Engine Baseline Audit

Generated: 2026-05-27T05:47:59Z

## Scope

This audit records the state before adding the universal typed span segmentation and span-routed conversion pipeline. The key finding is that existing pure-mode benchmark suites pass, but mixed real-office text still exposes document-level routing failures.

## Baseline Commands

| Command | Status | Notes |
| --- | --- | --- |
| `npm run typecheck` | Pass | TypeScript project builds with `tsc -b --noEmit`. |
| `npm run test` | Pass | 21 files, 133 tests, exits cleanly in 26.53s. |
| `npm run benchmark:preeti` | Pass | 10,225 fixtures, exact match rate 1.0000 on current suites. |
| `npm run benchmark:romanized` | Pass | 6,756 fixtures, top-1/top-3/top-5/MRR 1.0000 on current suites. |
| `npm run benchmark:protected` | Pass | 12/12 protected-span cases preserved. |
| `npm run bench:perf` | Pass | Romanized p95 16ms; mixed Preeti p95 199ms under gross-slowdown gate. |

The full final verification loop must be rerun after implementation.

## Current Hard Mixed Failures

### Mixed Unicode + Preeti

The current `preeti-mixed` path converts pure Preeti runs, but it does not treat every span independently inside Unicode office text. Sample probe results:

| Input | Current output | Expected behavior |
| --- | --- | --- |
| `मृत्य' btf{` | `मृत्य' दर्ता` | `मृत्यु दर्ता` |
| `a;fOF;/fO` | `बसाइँसराइ` | `बसाइँसराइ` |
| `hUuf wgL k\|df0fk'र्जा` | `जग्गा धनी प्रमाणपुर्जा` | `जग्गा धनी प्रमाणपुर्जा` |
| `बहाद'/ yfkf` | `बहादुर थापा` | `बहादुर थापा` |
| `s'dg clwsf/L` | `कुमन अधिकारी` | mixed input should preserve Unicode `स` when present, e.g. `स'dg` -> `सुमन` |
| `lxdfn u'रुङ` | `हिमाल गुरुङ` | `हिमाल गुरुङ` |
| `p"jL{o bz{gfg';f/` | `उूर्वीय दर्शनानुसार` | `पूर्वीय दर्शनानुसार` |
| `j;'w}j s'6'Dasd\` | `वस'w}j s'टुम्बकम्` | `वसुधैव कुटुम्बकम्` |
| `ctM b[9 ;ª\slNkt` | `अतः दृढ सङ्कल्पित` | `अतः दृढ सङ्कल्पित` |
| `b'em]/ sfo{qmdsf nIox? k\|fKt` | `दुझेर कार्यक्रमका लक्ष्यहरू प्राप्त` | `बुझेर कार्यक्रमका लक्ष्यहरू प्राप्त` |

### Romanized Mixed Office Text

The current Romanized benchmark reports perfect scores, but mixed office morphology still fails in real probes:

| Input | Current output | Expected behavior |
| --- | --- | --- |
| `English tokenharu` | `एङ्लिश तोकेनहरु` | `English tokenहरू` |
| `jastaa` | `जस्ताआः` | `जस्ता` |
| `karyalayakaa` | `कार्यालयकाआः` | `कार्यालयका` |
| `bhandaa bhandai` | `भाँड्आः भँडाइ` | `भन्दा भन्दै` |
| `shabdaharu pani` | `शबदहरु पानी` | `शब्दहरू पनि` |
| `samrakshaN` | `समरक्षण` | `संरक्षण` |
| `raajanitigya` | `राजनीतिज्ञ` | `राजनीतिज्ञ` |
| `bhayeko` | `भयेको` | `भएको` |
| `rakhnuparne` | `रख्नुपर्ने` | `राख्नुपर्ने` |
| `kothamaa` | `कोथमा` | `कोठामा` |

## Current UI Routing

The visible Romanized and Preeti tools route through `src/engine`, but the engine result needs richer span/action metadata so the UI can explain preserved spans, candidates, warnings, and unsafe decisions.

## Scorecard Trust Status

Current scorecards are fresh for existing suites, but they are incomplete as public proof because the hostile/mutation mixed-span suites do not yet exist. Public claims remain limited to local-first, protected-span, and benchmark-driven engine work.

## Implementation Direction

The fix is to add a universal typed span layer:

`InputDocument -> UniversalSpanSegmenter -> SpanRouter -> CandidateLattice -> StructuralVerifier -> ConfidenceGate -> ConversionResult`

Modes will become conversion policies. They must not replace span-level classification.
