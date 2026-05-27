import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
process.env.LEKH_BENCHMARK_IMPORT = "1";

const { runPreetiBenchmark } = await import("./benchmark-preeti");
const { runRomanizedBenchmark } = await import("./benchmark-romanized");
const { runProofreadBenchmark } = await import("./benchmark-proofread");
const { runCompetitorProbeBenchmark } = await import("./benchmark-competitor-probes");
const { runBenchmarkDisjointnessCheck } = await import("./check-benchmark-disjointness");
const { runRomanizedAliasFactoryReport } = await import("./generate-romanized-alias-factory");
const { runRomanizedAliasCollisionReport } = await import("./report-romanized-alias-collisions");
const { runRomanizedSelfConsistencyBenchmark } = await import("./benchmark-romanized-self-consistency");
const { runMixedSpanMutationBenchmark } = await import("./benchmark-mixed-span-mutations");
const { runTypingSessionBenchmark } = await import("./benchmark-typing-session");

const preeti = runPreetiBenchmark();
const romanized = await runRomanizedBenchmark();
const proofread = runProofreadBenchmark();
const competitor = runCompetitorProbeBenchmark();
const disjointness = runBenchmarkDisjointnessCheck();
const romanizedAliasFactory = runRomanizedAliasFactoryReport();
const romanizedAliasCollisions = runRomanizedAliasCollisionReport();
const romanizedSelfConsistency = runRomanizedSelfConsistencyBenchmark();
const mixedSpanMutations = runMixedSpanMutationBenchmark();
const typingSession = runTypingSessionBenchmark();

const scorecard = {
  generatedAt: new Date().toISOString(),
  romanized: {
    top1: romanized.top1,
    top3: romanized.top3,
    top5: romanized.top5,
    mrr: romanized.meanReciprocalRank,
    missingCandidateCount: romanized.remainingFailures.filter((failure) => failure.failureCategory === "missing-candidate").length,
    rankingFailureCount: romanized.remainingFailures.filter((failure) => failure.failureCategory === "ranking-failure").length,
    phraseAccuracy: romanized.phraseAccuracy,
    nameAccuracy: romanized.nameAccuracy,
    mixedEnglishCorruptionRate: romanized.mixedEnglishCorruptionRate,
    suggestionHitAt5: romanized.suggestionHitAt5,
    hardHostile: romanized.hardHostile ?? null,
    selfConsistency: {
      fixtureCount: romanizedSelfConsistency.fixtureCount,
      normalizedStabilityRate: romanizedSelfConsistency.normalizedStabilityRate,
      outputInTopCandidatesRate: romanizedSelfConsistency.outputInTopCandidatesRate,
      hardCandidateCapRate: romanizedSelfConsistency.hardCandidateCapRate,
      protectedPreservationRate: romanizedSelfConsistency.protectedPreservationRate,
      failureCount: romanizedSelfConsistency.failureCount
    },
    aliasFactory: {
      variantCount: romanizedAliasFactory.variantCount,
      aliasCount: romanizedAliasFactory.aliasCount,
      outputCount: romanizedAliasFactory.outputCount,
      reviewedOrManualVariantCount: romanizedAliasFactory.reviewedOrManualVariantCount,
      importedUnreviewedVariantCount: romanizedAliasFactory.importedUnreviewedVariantCount
    },
    aliasCollisions: {
      collisionCount: romanizedAliasCollisions.collisionCount,
      expectedAmbiguousCount: romanizedAliasCollisions.collisions.filter((collision) => collision.severity === "expected-ambiguous").length,
      reviewNeededCount: romanizedAliasCollisions.collisions.filter((collision) => collision.severity === "review-needed").length
    }
  },
  preeti: {
    exactMatchRate: preeti.exactMatchRate,
    characterErrorRate: preeti.characterErrorRate,
    wordErrorRate: preeti.wordErrorRate,
    matraErrorCount: preeti.matraErrorCount,
    rephErrorCount: preeti.rephErrorCount,
    englishPreservationRate: preeti.englishPreservationRate,
    lineBreakPreservationRate: preeti.lineBreakPreservationRate,
    warningQuality: preeti.warningQuality,
    decoderSuites: preeti.decoderSuites
  },
  proofread: {
    fixtureCount: proofread.fixtureCount,
    exactMatchRate: proofread.exactMatchRate,
    autoFixPrecisionProxy: proofread.autoFixPrecisionProxy,
    hintsGenerated: proofread.hintsGenerated,
    appliedCount: proofread.appliedCount
  },
  mixedSpanMutations: {
    fixtureCount: mixedSpanMutations.fixtureCount,
    exactOutputRate: mixedSpanMutations.exactOutputRate,
    actionMatchRate: mixedSpanMutations.actionMatchRate,
    protectedPreservationRate: mixedSpanMutations.protectedPreservationRate,
    silentCorruptionRate: mixedSpanMutations.silentCorruptionRate,
    bySuite: mixedSpanMutations.bySuite,
    failureCount: mixedSpanMutations.failures.length
  },
  typingSession: {
    fixtureCount: typingSession.fixtureCount,
    romanized: typingSession.romanized,
    traditionalPlaceholder: typingSession.traditionalPlaceholder,
    latency: typingSession.latency,
    keystrokeSavingsRatioMean: typingSession.keystrokeSavingsRatioMean,
    failedSessions: typingSession.failedSessions
  },
  competitor: {
    fixtureCount: competitor.fixtureCount,
    lekhExpectedPassCount: competitor.lekhExpectedPassCount,
    protectedFailureCount: competitor.protectedFailureCount,
    competitorCollectionStatus: competitor.competitorCollectionStatus
  },
  disjointness: {
    contaminatedSuites: disjointness.contaminatedSuites,
    hardFailureSuites: disjointness.hardFailureSuites,
    reportPath: "bench/reports/benchmark-disjointness-report.json"
  },
  publicClaims: {
    allowed: [
      "local-first prototype",
      "mixed-document protected-span support",
      "benchmark-driven engine architecture",
      "early Romanized/Preeti engine under active validation"
    ],
    forbiddenUntilEvidence: [
      "best Nepali converter",
      "beats Google",
      "government-ready",
      "99% accurate",
      "production-grade legal/health tool",
      "fully supports Kantipur/Sagarmatha"
    ]
  }
};

mkdirSync(join(root, "bench/reports"), { recursive: true });
writeFileSync(join(root, "bench/reports/engine-scorecard.json"), `${JSON.stringify(scorecard, null, 2)}\n`);
writeFileSync(join(root, "docs/ENGINE_QUALITY_SCORECARD.md"), renderMarkdown());
console.log(JSON.stringify(scorecard, null, 2));

function renderMarkdown(): string {
  return `# Engine Quality Scorecard

Updated: ${scorecard.generatedAt}

This scorecard is internal validation evidence. It is not a public superiority claim.

## Benchmark Breakdown

| Engine | Generated | Manual | Hostile / Held-out | Competitor probes | User submitted / real docs |
| --- | ---: | ---: | ---: | ---: | ---: |
| Preeti | ${preeti.byType.generated?.fixtureCount ?? 0} | ${preeti.byType.manual?.fixtureCount ?? 0} | ${preeti.byType["held-out"]?.fixtureCount ?? 0} | ${preeti.byType.competitor?.fixtureCount ?? 0} | 0 |
| Romanized | ${romanized.byType.generated?.fixtureCount ?? 0} | ${romanized.byType.manual?.fixtureCount ?? 0} | ${(romanized.byType["held-out"]?.fixtureCount ?? 0) + (romanized.byType.hostile?.fixtureCount ?? 0) + (romanized.byType["hostile-heldout"]?.fixtureCount ?? 0)} | ${romanized.byType.competitor?.fixtureCount ?? 0} | 0 |
| Proofread | 0 | ${proofread.fixtureCount} | included above | 0 | 0 |
| Competitor probes | 0 | 0 | 0 | ${competitor.fixtureCount} | 0 |
| Mixed span mutations | 0 | ${mixedSpanMutations.fixtureCount} | ${mixedSpanMutations.bySuite["mixed-unicode-legacy-repair"]?.fixtureCount ?? 0} | 0 | 0 |
| Typing sessions | 0 | ${typingSession.fixtureCount} | 0 | 0 | 0 |

## Benchmark Disjointness

Generated from \`npm run check:benchmark-disjointness\`.

| Status | Value |
| --- | --- |
| contaminated suites | ${disjointness.contaminatedSuites.length === 0 ? "none" : disjointness.contaminatedSuites.join(", ")} |
| held-out hard failures | ${disjointness.hardFailureSuites.length === 0 ? "none" : disjointness.hardFailureSuites.join(", ")} |
| public proof policy | Contaminated suites are internal regression evidence, not public superiority proof. |

## Romanized Metrics

| Metric | Value |
| --- | ---: |
| top-1 | ${romanized.top1.toFixed(4)} |
| top-3 | ${romanized.top3.toFixed(4)} |
| top-5 | ${romanized.top5.toFixed(4)} |
| MRR | ${romanized.meanReciprocalRank.toFixed(4)} |
| missing-candidate count | ${scorecard.romanized.missingCandidateCount} |
| ranking-failure count | ${scorecard.romanized.rankingFailureCount} |
| phrase accuracy | ${romanized.phraseAccuracy.toFixed(4)} |
| name accuracy | ${romanized.nameAccuracy.toFixed(4)} |
| mixed-English corruption | ${romanized.mixedEnglishCorruptionRate.toFixed(4)} |
| suggestion hit@5 | ${romanized.suggestionHitAt5.toFixed(4)} |

## Romanized Hard Hostile Prose

This section is intentionally separate from generated/internal fixtures. It is the long-form stress suite used to prevent polished-looking aggregate scores from hiding prose failures.

| Metric | Value |
| --- | ---: |
| fixtures | ${romanized.byType["hostile-heldout"]?.fixtureCount ?? 0} |
| top-1 | ${(romanized.byType["hostile-heldout"]?.top1 ?? 0).toFixed(4)} |
| top-3 | ${(romanized.byType["hostile-heldout"]?.top3 ?? 0).toFixed(4)} |
| top-5 | ${(romanized.byType["hostile-heldout"]?.top5 ?? 0).toFixed(4)} |
| MRR | ${(romanized.byType["hostile-heldout"]?.mrr ?? 0).toFixed(4)} |

## Romanized Correctness Layer

| Metric | Value |
| --- | ---: |
| self-consistency fixtures | ${romanizedSelfConsistency.fixtureCount} |
| NFC stability | ${romanizedSelfConsistency.normalizedStabilityRate.toFixed(4)} |
| output in top candidates | ${romanizedSelfConsistency.outputInTopCandidatesRate.toFixed(4)} |
| hard candidate cap honored | ${romanizedSelfConsistency.hardCandidateCapRate.toFixed(4)} |
| protected preservation in self-check | ${romanizedSelfConsistency.protectedPreservationRate.toFixed(4)} |
| self-consistency failures | ${romanizedSelfConsistency.failureCount} |
| weighted alias variants | ${romanizedAliasFactory.variantCount} |
| unique alias keys | ${romanizedAliasFactory.aliasCount} |
| alias outputs | ${romanizedAliasFactory.outputCount} |
| alias collisions | ${romanizedAliasCollisions.collisionCount} |
| alias collisions needing review | ${romanizedAliasCollisions.collisions.filter((collision) => collision.severity === "review-needed").length} |

## Universal Span Routing And Mutation Suites

These suites are separate from generated Romanized and Preeti fixtures. They measure mixed Unicode, Preeti legacy islands, protected tokens, English suffixes, and silent-corruption behavior.

| Metric | Value |
| --- | ---: |
| fixtures | ${mixedSpanMutations.fixtureCount} |
| exact output rate | ${mixedSpanMutations.exactOutputRate.toFixed(4)} |
| action match rate | ${mixedSpanMutations.actionMatchRate.toFixed(4)} |
| protected preservation | ${mixedSpanMutations.protectedPreservationRate.toFixed(4)} |
| silent corruption rate | ${mixedSpanMutations.silentCorruptionRate.toFixed(4)} |
| failures | ${mixedSpanMutations.failures.length} |

## Keyboard Typing Sessions

This Prompt 1 benchmark measures the new \`KeyboardEngine\` session API. Traditional sessions are reported as placeholders until the source-of-truth layout audit is complete.

| Metric | Value |
| --- | ---: |
| total fixtures | ${typingSession.fixtureCount} |
| Romanized sessions | ${typingSession.romanized.totalSessions} |
| Romanized top-1 hit rate | ${typingSession.romanized.top1HitRate.toFixed(4)} |
| Romanized top-3 hit rate | ${typingSession.romanized.top3HitRate.toFixed(4)} |
| Traditional placeholder sessions | ${typingSession.traditionalPlaceholder.placeholderSessions} |
| candidate p50 ms | ${typingSession.latency.candidateP50Ms.toFixed(2)} |
| candidate p95 ms | ${typingSession.latency.candidateP95Ms.toFixed(2)} |
| update p95 ms | ${typingSession.latency.updateP95Ms.toFixed(2)} |
| commit p95 ms | ${typingSession.latency.commitP95Ms.toFixed(2)} |
| mean KSR baseline | ${typingSession.keystrokeSavingsRatioMean === null ? "n/a" : typingSession.keystrokeSavingsRatioMean.toFixed(4)} |
| failed sessions | ${typingSession.failedSessions} |

## Preeti Metrics

| Metric | Value |
| --- | ---: |
| exact match | ${preeti.exactMatchRate.toFixed(4)} |
| CER | ${preeti.characterErrorRate.toFixed(4)} |
| WER | ${preeti.wordErrorRate.toFixed(4)} |
| matra errors | ${preeti.matraErrorCount} |
| reph errors | ${preeti.rephErrorCount} |
| English preservation | ${preeti.englishPreservationRate.toFixed(4)} |
| line-break preservation | ${preeti.lineBreakPreservationRate.toFixed(4)} |
| unknown glyph warnings | ${preeti.warningQuality.unknownGlyphWarnings} |

## Preeti Deterministic Decoder Suites

These suites validate the verifier-gated atom decoder beside the baseline converter. Generated/oracle suites are regression pressure, not real-document proof.

| Suite | Count | Metric |
| --- | ---: | ---: |
| source-audit fixtures | ${preeti.decoderSuites.sourceAudit.fixtureCount} | ${preeti.decoderSuites.sourceAudit.includeInConversionBenchmarkCount} conversion-scored |
| source-audit converter bugs | ${preeti.decoderSuites.sourceAudit.converterBugCount} | ${preeti.decoderSuites.sourceAudit.sourceTypoOrAmbiguousCount} source-ambiguous |
| fuzz legal/illegal | ${preeti.decoderSuites.fuzz.fixtureCount} | ${preeti.decoderSuites.fuzz.failureCount} failures |
| fuzz legal exact | ${preeti.decoderSuites.fuzz.fixtureCount} | ${preeti.decoderSuites.fuzz.legalExactRate.toFixed(4)} |
| fuzz illegal safety | ${preeti.decoderSuites.fuzz.fixtureCount} | ${preeti.decoderSuites.fuzz.illegalUnsafeOrWarnRate.toFixed(4)} |
| roundtrip oracle | ${preeti.decoderSuites.roundtrip.fixtureCount} | ${preeti.decoderSuites.roundtrip.exactRate.toFixed(4)} |

## Proofread Metrics

| Metric | Value |
| --- | ---: |
| fixtures | ${proofread.fixtureCount} |
| exact match | ${proofread.exactMatchRate.toFixed(4)} |
| auto-fix precision proxy | ${proofread.autoFixPrecisionProxy.toFixed(4)} |
| hints generated | ${proofread.hintsGenerated} |
| fixes applied in benchmark | ${proofread.appliedCount} |

## Competitor Probe Status

| Metric | Value |
| --- | --- |
| probe fixtures | ${competitor.fixtureCount} |
| Lekh expected-pass count | ${competitor.lekhExpectedPassCount} |
| protected-span failures | ${competitor.protectedFailureCount} |
| competitor collection | ${competitor.competitorCollectionStatus} |

## Public Claim Status

Allowed if phrased honestly:

- local-first prototype
- mixed-document protected-span support
- benchmark-driven engine architecture
- early Romanized/Preeti engine under active validation

Forbidden until external evidence exists:

- best Nepali converter
- beats Google or Microsoft
- government-ready
- 99% accurate
- production-grade legal/health tool
- full Kantipur/Sagarmatha/Himali support

## Remaining Evidence Gaps

- No consented real-user documents are committed.
- Competitor outputs are still pending manual collection.
- Health terms are a tiny reviewed starter only.
- Kantipur/Sagarmatha/Himali profiles are planned diagnostics, not supported conversion profiles.
- Desktop/native input surfaces are strategy docs only.
`;
}
