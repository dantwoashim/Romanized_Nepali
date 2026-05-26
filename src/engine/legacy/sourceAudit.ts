import type { EngineDiagnostic } from "../types";

export type PreetiSourceAuditStatus =
  | "converter-bug"
  | "source-text-typo"
  | "expected-output-bug"
  | "style-normalization"
  | "proofread-correction"
  | "ambiguous-legacy-encoding"
  | "verified-gold";

export type PreetiSourceAuditCategory =
  | "conjunct"
  | "matra"
  | "suffix"
  | "reph"
  | "rakar"
  | "punctuation"
  | "protected-span"
  | "unknown";

export interface PreetiSourceAuditFixture {
  id: string;
  preetiInput: string;
  expectedUnicode: string;
  observedCurrent?: string;
  observedCompetitor?: Record<string, string>;
  status: PreetiSourceAuditStatus;
  category: PreetiSourceAuditCategory;
  notes: string;
}

export interface PreetiSourceAuditDecision {
  fixture: PreetiSourceAuditFixture;
  includeInConversionBenchmark: boolean;
  includeInProofreadBenchmark: boolean;
  diagnostics: EngineDiagnostic[];
}

export function classifyPreetiSourceAuditFixture(fixture: PreetiSourceAuditFixture): PreetiSourceAuditDecision {
  const includeInConversionBenchmark = fixture.status === "verified-gold" || fixture.status === "converter-bug";
  const includeInProofreadBenchmark = fixture.status === "style-normalization" || fixture.status === "proofread-correction";
  const diagnostics: EngineDiagnostic[] = [];

  if (fixture.status === "source-text-typo" || fixture.status === "ambiguous-legacy-encoding") {
    diagnostics.push({
      code: "PREETI_SOURCE_NOT_GOLD",
      message: "Fixture is audit-only until source text semantics are reviewed.",
      severity: "warning",
      data: { id: fixture.id, status: fixture.status }
    });
  }

  if (fixture.status === "expected-output-bug") {
    diagnostics.push({
      code: "PREETI_EXPECTED_OUTPUT_BUG",
      message: "Fixture expected output must be corrected before benchmark inclusion.",
      severity: "error",
      data: { id: fixture.id }
    });
  }

  return {
    fixture,
    includeInConversionBenchmark,
    includeInProofreadBenchmark,
    diagnostics
  };
}
