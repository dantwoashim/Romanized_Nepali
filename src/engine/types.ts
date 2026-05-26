export type EngineMode =
  | "auto"
  | "romanized-strict"
  | "romanized-mixed"
  | "romanized-government"
  | "romanized-legal"
  | "romanized-education"
  | "romanized-health"
  | "romanized-name-heavy"
  | "preeti-strict"
  | "preeti-mixed"
  | "legacy-profile"
  | "unicode-passthrough"
  | "proofread-only"
  | "unknown-diagnostic";

export type ProtectedSpanKind =
  | "email"
  | "url"
  | "phone"
  | "identifier"
  | "date"
  | "number"
  | "acronym"
  | "file"
  | "quoted"
  | "code"
  | "english-preserve"
  | "office-phrase";

export type ProtectedSpanClass = "hard-preserve" | "soft-preserve" | "quoted-example";

export interface ProtectedSpan {
  id: string;
  range: [start: number, end: number];
  original: string;
  placeholder: string;
  kind: ProtectedSpanKind;
  spanClass: ProtectedSpanClass;
  policy: "preserve" | "warn";
  confidence: number;
  reason: string;
}

export type SpanRoutingPolicy = "protect" | "convert-loanword" | "convert-romanized" | "ask-user" | "warn";

export type ClassifiedSpanKind =
  | "romanized"
  | "preeti"
  | "kantipur"
  | "sagarmatha"
  | "himalb"
  | "devanagari"
  | "latin-protected"
  | "latin-loanword-candidate"
  | "digit"
  | "mixed"
  | "unknown"
  | "ambiguous";

export interface ClassifiedSpan {
  kind: ClassifiedSpanKind;
  range: [start: number, end: number];
  text: string;
  confidence: number;
  routingPolicy?: SpanRoutingPolicy;
  reason: string;
}

export interface ClassifiedDocument {
  modeRecommendation: EngineMode;
  documentConfidence: number;
  spans: ClassifiedSpan[];
  warnings: EngineWarning[];
  diagnostics: EngineDiagnostic[];
  stats: {
    devanagariRatio: number;
    latinRatio: number;
    digitSymbolRatio: number;
    protectedTokenCount: number;
    preetiLikelihood: number;
    romanizedLikelihood: number;
    englishDigitalLikelihood: number;
    officePatternLikelihood: number;
  };
}

export type ProtectedNode =
  | { kind: "text"; text: string; range: [number, number] }
  | { kind: "protected"; span: ProtectedSpan };

export interface ProtectedResult {
  input: string;
  mode: EngineMode;
  protectedText: string;
  nodes: ProtectedNode[];
  spans: ProtectedSpan[];
  salt: string;
}

export interface EngineWarning {
  code: string;
  message: string;
  severity: "info" | "warning" | "error";
  range?: [start: number, end: number];
}

export interface EngineDiagnostic {
  code: string;
  message: string;
  severity: "info" | "warning" | "error";
  data?: Record<string, unknown>;
}

export interface CandidateEvidence {
  source: string;
  detail: string;
  weight?: number;
}

export interface CandidateScore {
  phraseBoost: number;
  aliasBoost: number;
  phoneticScore: number;
  dictionaryScore: number;
  hunspellScore: number;
  frequencyScore: number;
  domainScore: number;
  contextScore: number;
  namePlaceScore: number;
  loanwordScore: number;
  userMemoryBoost: number;
  englishCorruptionPenalty: number;
  protectedSpanPenalty: number;
  unknownTokenPenalty: number;
  malformedOutputPenalty: number;
  badMatraPenalty: number;
  mixedScriptPenalty: number;
  rareWordPenalty: number;
  total: number;
}

export interface Candidate {
  text: string;
  normalizedText: string;
  source:
    | "phrase"
    | "alias"
    | "phonetic"
    | "dictionary"
    | "hunspell"
    | "domain"
    | "name"
    | "place"
    | "loanword"
    | "memory"
    | "fallback"
    | "rule"
    | "variant"
    | "user-feedback";
  confidence: number;
  score: CandidateScore;
  evidence: CandidateEvidence[];
  warnings: EngineWarning[];
}

export interface ConvertedToken {
  input: string;
  output: string;
  range: [number, number];
  confidence: number;
  chosen?: Candidate;
  alternatives: Candidate[];
  protected?: boolean;
}

export interface ConversionTrace {
  steps: Array<{
    name: string;
    message: string;
    data?: Record<string, unknown>;
  }>;
}

export interface ConvertOptions {
  mode?: EngineMode;
  benchmark?: boolean;
  development?: boolean;
  localCorrections?: import("../core/transliteration/localCorrectionMemory").LocalCorrection[];
  correctionMemoryEntries?: import("./memory/types").CorrectionMemoryEntry[];
  digitPolicy?: "preserve-ascii" | "convert-devanagari" | "context-dependent";
  legacyDecoder?: "baseline" | "atom" | "compare" | "auto";
  proofread?: boolean | {
    autoFix?: boolean;
    normalizePluralHaru?: boolean;
    normalizePostpositions?: boolean;
    normalizeDanda?: boolean;
  };
}

export interface ConversionResult {
  input: string;
  output: string;
  normalizedOutput: string;
  mode: EngineMode;
  documentConfidence: number;
  tokens: ConvertedToken[];
  alternatives: Candidate[];
  protectedSpans: ProtectedSpan[];
  warnings: EngineWarning[];
  diagnostics: EngineDiagnostic[];
  trace?: ConversionTrace;
  timingMs?: number;
  proofread?: import("./proofread/types").ProofreadResult;
  schemaVersion: 1;
}

export class EngineCorruption extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EngineCorruption";
  }
}
