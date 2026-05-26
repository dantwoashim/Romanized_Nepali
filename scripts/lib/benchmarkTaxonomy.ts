export type FailureSeverity = "P0" | "P1" | "P2";

export interface FailureSummary {
  category: string;
  count: number;
  severity: Record<FailureSeverity, number>;
}

export interface BenchmarkFailure {
  id: string;
  type: string;
  category: string;
  failureCategory: string;
  severity: FailureSeverity;
  input?: string;
  expected: string;
  actual: string;
  rank?: number;
  expectedInTop3?: boolean;
  expectedInTop5?: boolean;
  topCandidates?: string[];
  suggestedFix?: string;
}

interface FailureInput {
  id?: string;
  input: string;
  type?: string;
  category: string;
  severity?: FailureSeverity;
}

export function classifyPreetiFailure(item: FailureInput, expected: string, actual: string): BenchmarkFailure {
  const failureCategory = (() => {
    if (!preservesAnyEnglish(expected, actual)) return "english-preservation";
    if (!preservesNumbers(expected, actual)) return "number-preservation";
    if (newlineCount(expected) !== newlineCount(actual)) return "line-break-preservation";
    if (/[।,;:!?]/.test(expected + actual)) return "punctuation-spacing";
    if (/र्/.test(expected + actual)) return "reph-ordering";
    if (/[िीुूेैोौ]/.test(expected + actual)) return "matra-ordering";
    if (/्/.test(expected + actual)) return "conjunct-or-halanta";
    return "preeti-substitution";
  })();

  return {
    id: item.id ?? item.input,
    type: item.type ?? "manual",
    category: item.category,
    failureCategory,
    severity: item.severity ?? inferSeverity(failureCategory, item.category),
    expected,
    actual
  };
}

export function classifyRomanizedFailure(
  item: FailureInput,
  expected: string,
  actual: string,
  rank: number,
  topCandidates: string[] = []
): BenchmarkFailure {
  const failureCategory = (() => {
    if (!preservesEnglish(item.input, actual)) return "english-corruption";
    if (rank > 1 && rank <= 5) return "ranking-failure";
    if (rank === 0) return "missing-candidate";
    if (/name|surname/.test(item.category)) return "name-gap";
    if (/place|province|district|municipality/.test(item.category)) return "place-gap";
    if (/phrase/.test(item.category)) return "phrase-gap";
    if (/government|admin|office|legal|education/.test(item.category)) return "lexicon-gap";
    if (/compound|morphology|oov/.test(item.category)) return "morphology-gap";
    if (/misspelling|variant|alias/.test(item.category)) return "alias-gap";
    if (/spacing/.test(item.category)) return "postposition-spacing";
    if (/normalization/.test(item.category)) return "spelling-normalization";
    return "unknown";
  })();

  return {
    id: item.id ?? item.input,
    type: item.type ?? "generated",
    category: item.category,
    failureCategory,
    severity: item.severity ?? inferSeverity(failureCategory, item.category),
    input: item.input,
    expected,
    actual,
    rank,
    expectedInTop3: rank > 0 && rank <= 3,
    expectedInTop5: rank > 0 && rank <= 5,
    topCandidates,
    suggestedFix: suggestedRomanizedFix(failureCategory)
  };
}

export function summarizeFailures(failures: BenchmarkFailure[]): FailureSummary[] {
  const summaries = new Map<string, FailureSummary>();
  for (const failure of failures) {
    const summary = summaries.get(failure.failureCategory) ?? {
      category: failure.failureCategory,
      count: 0,
      severity: { P0: 0, P1: 0, P2: 0 }
    };
    summary.count += 1;
    summary.severity[failure.severity] += 1;
    summaries.set(summary.category, summary);
  }

  return Array.from(summaries.values()).sort((a, b) => b.count - a.count || a.category.localeCompare(b.category));
}

export function mergeFailureSummaries(groups: FailureSummary[][]): FailureSummary[] {
  const merged = new Map<string, FailureSummary>();
  for (const group of groups) {
    for (const item of group) {
      const summary = merged.get(item.category) ?? {
        category: item.category,
        count: 0,
        severity: { P0: 0, P1: 0, P2: 0 }
      };
      summary.count += item.count;
      summary.severity.P0 += item.severity.P0;
      summary.severity.P1 += item.severity.P1;
      summary.severity.P2 += item.severity.P2;
      merged.set(item.category, summary);
    }
  }
  return Array.from(merged.values()).sort((a, b) => b.count - a.count || a.category.localeCompare(b.category));
}

function inferSeverity(failureCategory: string, caseCategory: string): FailureSeverity {
  if (failureCategory === "english-corruption" || failureCategory === "protected-span-failure" || failureCategory === "english-preservation") return "P0";
  if (/competitor|paragraph|government|admin|legal|office/.test(caseCategory)) return "P1";
  if (failureCategory === "ranking") return "P2";
  return "P1";
}

function preservesEnglish(expectedOrInput: string, actual: string): boolean {
  const tokens = expectedOrInput.match(/\b(?:[A-Z]{2,}|[A-Za-z]+(?:[-.][A-Za-z0-9]+)+|PDF|NID|URL|Excel|Word|file|form|field|report|office|system|data)\b/g) ?? [];
  return tokens.every((token) => actual.includes(token));
}

function suggestedRomanizedFix(failureCategory: string): string {
  return {
    "missing-candidate": "Add phrase, alias, or lexicon recall before tuning ranking.",
    "ranking-failure": "Tune source/review/domain scores without changing expected fixture output.",
    "phrase-gap": "Add reviewed phrase row or sliding-window phrase coverage.",
    "alias-gap": "Add reviewed romanized alias row.",
    "lexicon-gap": "Add reviewed domain lexicon row or validate Hunspell recall.",
    "name-gap": "Add reviewed name/surname alias and ambiguity candidate.",
    "place-gap": "Add reviewed place/admin starter row with source notes.",
    "morphology-gap": "Check Hunspell expansion and compound repair candidates.",
    "english-corruption": "Route token through protected-span/English-preserve policy.",
    "protected-span-failure": "Fix protected-span detector or wrapper restoration.",
    "long-sentence-context-failure": "Add sliding-window phrase or context ranking regression.",
    "postposition-spacing": "Add spacing/postposition regression fixture.",
    "spelling-normalization": "Check normalizeNepaliText and alias spelling.",
    unknown: "Inspect manually and classify before fixing."
  }[failureCategory] ?? "Inspect manually and classify before fixing.";
}

function preservesAnyEnglish(expected: string, actual: string): boolean {
  const tokens = expected.match(/\b[A-Za-z][A-Za-z0-9.-]*\b/g) ?? [];
  return tokens.every((token) => actual.includes(token));
}

function preservesNumbers(expected: string, actual: string): boolean {
  const tokens = expected.match(/\b\d+\b/g) ?? [];
  return tokens.every((token) => actual.includes(token));
}

function newlineCount(value: string) {
  return (value.match(/\n/g) ?? []).length;
}
