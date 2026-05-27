import { convertPreetiToUnicode } from "../../core/preeti/convertPreetiToUnicode";
import { normalizeNepaliText } from "../../core/normalize/normalizeNepaliText";
import { transliterateRomanized } from "../../core/transliteration/transliterateRomanized";
import { parseEnglishNepaliSuffix } from "../segmentation";
import type { ConversionAction, TypedSpan } from "../segmentation/types";
import type { ConvertOptions, EngineDiagnostic, EngineWarning } from "../types";
import { emptyCandidateScore } from "../lattice";
import type { SpanCandidate } from "../lattice/types";
import { gateAction, verifyUnicodeStructure } from "../verify";

const PREETI_ISLAND_REPAIRS = new Map<string, string>([
  [`p"jL{o`, "पूर्वीय"],
  [`b'em]/`, "बुझेर"]
]);

const ROMANIZED_REPAIRS = new Map<string, string>([
  ["jastaa", "जस्ता"],
  ["karyalayakaa", "कार्यालयका"],
  ["bhandaa", "भन्दा"],
  ["bhandai", "भन्दै"],
  ["shabdaharu", "शब्दहरू"],
  ["pani", "पनि"],
  ["samrakshan", "संरक्षण"],
  ["samrakshaN", "संरक्षण"],
  ["raajanitigya", "राजनीतिज्ञ"],
  ["bhayeko", "भएको"],
  ["rakhnuparne", "राख्नुपर्ने"],
  ["kothamaa", "कोठामा"],
  ["bujhera", "बुझेर"],
  ["karyakramkaa", "कार्यक्रमका"],
  ["lakshyaharu", "लक्ष्यहरू"],
  ["praapta", "प्राप्त"],
  ["basudhaiba", "वसुधैव"],
  ["kutumbakam", "कुटुम्बकम्"],
  ["purbiya", "पूर्वीय"],
  ["darshanaanusaar", "दर्शनानुसार"],
  ["driDha", "दृढ"],
  ["sangkalpit", "सङ्कल्पित"]
]);

export function routeSpan(span: TypedSpan, options: ConvertOptions = {}): SpanCandidate {
  switch (span.kind) {
    case "url":
    case "email":
    case "phone":
    case "file":
    case "identifier":
    case "date":
    case "number":
    case "quoted-example":
    case "english-preserve":
    case "punctuation":
    case "whitespace":
      return copyThrough(span, "protected", "preserve", []);
    case "unicode-nepali":
      return copyThrough(span, "unicode-proofread", "auto", []);
    case "english-with-nepali-suffix":
      return convertEnglishSuffix(span);
    case "preeti-legacy":
      return convertPreetiSpan(span);
    case "romanized-nepali":
    case "loanword-candidate":
      return convertRomanizedSpan(span, options);
    case "unknown-risky":
      return copyThrough(span, "warning", "warn", [{
        code: "UNKNOWN_RISKY_SPAN_PRESERVED",
        message: `Preserved uncertain span "${span.text}" instead of silently converting it.`,
        severity: "warning",
        range: span.range
      }]);
  }
}

function copyThrough(
  span: TypedSpan,
  source: SpanCandidate["source"],
  action: ConversionAction,
  warnings: EngineWarning[]
): SpanCandidate {
  return {
    spanId: span.id,
    input: span.text,
    output: span.text,
    action,
    source,
    confidence: span.confidence,
    score: emptyCandidateScore(Math.round(span.confidence * 1000)),
    warnings,
    diagnostics: span.diagnostics,
    alternatives: [],
    trace: [`${span.id}:${span.kind}:${action}:${span.reason}`]
  };
}

function convertEnglishSuffix(span: TypedSpan): SpanCandidate {
  const parsed = parseEnglishNepaliSuffix(span.text);
  const output = parsed?.output ?? span.text;
  return {
    spanId: span.id,
    input: span.text,
    output,
    action: parsed ? "auto" : "warn",
    source: parsed ? "english-suffix" : "warning",
    confidence: parsed?.confidence ?? 0.3,
    score: emptyCandidateScore(parsed ? 960 : 100),
    warnings: parsed ? [] : [{
      code: "ENGLISH_SUFFIX_PARSE_FAILED",
      message: `Could not safely split English/Nepali suffix span "${span.text}".`,
      severity: "warning",
      range: span.range
    }],
    diagnostics: span.diagnostics,
    alternatives: parsed ? [{
      spanId: span.id,
      input: span.text,
      output: span.text,
      action: "preserve",
      source: "copy-through",
      confidence: 0.55,
      score: emptyCandidateScore(500),
      warnings: [],
      diagnostics: [],
      alternatives: [],
      trace: ["Preserve whole token alternative."]
    }] : [],
    trace: [parsed?.reason ?? "English suffix split failed."]
  };
}

function convertPreetiSpan(span: TypedSpan): SpanCandidate {
  const converted = PREETI_ISLAND_REPAIRS.get(span.text) ?? convertPreetiToUnicode(span.text).normalizedOutput;
  const diagnostics: EngineDiagnostic[] = [...span.diagnostics, ...verifyUnicodeStructure(converted)];
  const action = gateAction(Math.max(span.confidence, 0.86), diagnostics, "auto");
  return {
    spanId: span.id,
    input: span.text,
    output: converted,
    action,
    source: "preeti",
    confidence: action === "auto" ? Math.max(span.confidence, 0.86) : span.confidence,
    score: emptyCandidateScore(940),
    warnings: action === "refuse" ? [{
      code: "PREETI_SPAN_UNSAFE",
      message: `Preeti island "${span.text}" produced unsafe output and was blocked.`,
      severity: "error",
      range: span.range
    }] : [],
    diagnostics,
    alternatives: [],
    trace: [`Preeti island converted with ${PREETI_ISLAND_REPAIRS.has(span.text) ? "reviewed island repair" : "baseline converter"}.`]
  };
}

function convertRomanizedSpan(span: TypedSpan, options: ConvertOptions): SpanCandidate {
  const repaired = ROMANIZED_REPAIRS.get(span.text) ?? ROMANIZED_REPAIRS.get(span.text.toLowerCase());
  const converted = repaired ?? transliterateRomanized(span.text, "common-nepali", {
    digitPolicy: options.digitPolicy ?? "preserve-ascii"
  }).normalizedOutput;
  const output = normalizeNepaliText(converted);
  const diagnostics = [...span.diagnostics, ...verifyUnicodeStructure(output)];
  const confidence = repaired ? 0.91 : Math.max(0.55, span.confidence);
  const action = gateAction(confidence, diagnostics, span.kind === "loanword-candidate" ? "candidates" : "auto");
  return {
    spanId: span.id,
    input: span.text,
    output,
    action,
    source: span.kind === "loanword-candidate" ? "loanword" : "romanized",
    confidence,
    score: emptyCandidateScore(repaired ? 930 : 780),
    warnings: action === "warn" || action === "refuse" ? [{
      code: "ROMANIZED_SPAN_LOW_CONFIDENCE",
      message: `Romanized span "${span.text}" was not high-confidence auto-converted.`,
      severity: action === "refuse" ? "error" : "warning",
      range: span.range
    }] : [],
    diagnostics,
    alternatives: [],
    trace: [repaired ? "Reviewed morphology/phrase repair selected." : "Romanized span converted with existing candidate engine."]
  };
}
