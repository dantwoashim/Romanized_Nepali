import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
process.env.LEKH_BENCHMARK_IMPORT = "1";

const { runPreetiBenchmark } = await import("./benchmark-preeti");
const { runRomanizedBenchmark } = await import("./benchmark-romanized");
const { runProofreadBenchmark } = await import("./benchmark-proofread");
const { runCompetitorProbeBenchmark } = await import("./benchmark-competitor-probes");
const { runBenchmarkDisjointnessCheck } = await import("./check-benchmark-disjointness");

const preeti = runPreetiBenchmark();
const romanized = await runRomanizedBenchmark();
const proofread = runProofreadBenchmark();
const competitor = runCompetitorProbeBenchmark();
const disjointness = runBenchmarkDisjointnessCheck();

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
    suggestionHitAt5: romanized.suggestionHitAt5
  },
  preeti: {
    exactMatchRate: preeti.exactMatchRate,
    characterErrorRate: preeti.characterErrorRate,
    wordErrorRate: preeti.wordErrorRate,
    matraErrorCount: preeti.matraErrorCount,
    rephErrorCount: preeti.rephErrorCount,
    englishPreservationRate: preeti.englishPreservationRate,
    lineBreakPreservationRate: preeti.lineBreakPreservationRate,
    warningQuality: preeti.warningQuality
  },
  proofread: {
    fixtureCount: proofread.fixtureCount,
    exactMatchRate: proofread.exactMatchRate,
    autoFixPrecisionProxy: proofread.autoFixPrecisionProxy,
    hintsGenerated: proofread.hintsGenerated,
    appliedCount: proofread.appliedCount
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

Generated: ${scorecard.generatedAt}

This scorecard is internal validation evidence. It is not a public superiority claim.

## Benchmark Breakdown

| Engine | Generated | Manual | Hostile / Held-out | Competitor probes | User submitted / real docs |
| --- | ---: | ---: | ---: | ---: | ---: |
| Preeti | ${preeti.byType.generated?.fixtureCount ?? 0} | ${preeti.byType.manual?.fixtureCount ?? 0} | ${preeti.byType["held-out"]?.fixtureCount ?? 0} | ${preeti.byType.competitor?.fixtureCount ?? 0} | 0 |
| Romanized | ${romanized.byType.generated?.fixtureCount ?? 0} | ${romanized.byType.manual?.fixtureCount ?? 0} | ${(romanized.byType["held-out"]?.fixtureCount ?? 0) + (romanized.byType.hostile?.fixtureCount ?? 0)} | ${romanized.byType.competitor?.fixtureCount ?? 0} | 0 |
| Proofread | 0 | ${proofread.fixtureCount} | included above | 0 | 0 |
| Competitor probes | 0 | 0 | 0 | ${competitor.fixtureCount} | 0 |

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
