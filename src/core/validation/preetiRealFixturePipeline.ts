import { normalizeNepaliText } from "../normalize/normalizeNepaliText";
import { convertPreetiToUnicode } from "../preeti/convertPreetiToUnicode";
import type { TextWarning } from "../types";

export type RealPreetiDomain = "government" | "education" | "legal" | "office" | "other";
export type RealPreetiSegmentType = "sentence" | "table-row" | "form-field" | "paragraph";
export type RealPreetiFailureType =
  | "unknown"
  | "matra-reordering"
  | "half-letter"
  | "reph"
  | "punctuation"
  | "layout"
  | "mixed-english"
  | "font-variant";

export interface RealPreetiManifest {
  schemaVersion: 1;
  collectedAt: string;
  documents: RealPreetiDocument[];
}

export interface RealPreetiDocument {
  id: string;
  domain: RealPreetiDomain;
  sourceLabel: string;
  permission: {
    status: "consented";
    permissionId: string;
    holderRole: string;
    notes?: string;
  };
  rawPreeti: string;
  sourceFormat?: "docx" | "pdf-copy" | "txt" | "spreadsheet-copy" | "other";
  failureTypes?: RealPreetiFailureType[];
  redactions?: string[];
}

export interface RealPreetiFixture {
  name: string;
  category: RealPreetiSegmentType;
  input: string;
  expected: string;
  source: string;
  domain: RealPreetiDomain;
  permissionId: string;
  sourceLabel: string;
  failureTypes: RealPreetiFailureType[];
  redactionCount: number;
  warningCodes: string[];
}

export interface RealPreetiIngestResult {
  fixtures: RealPreetiFixture[];
  documentCount: number;
  fixtureCount: number;
  warnings: TextWarning[];
}

const ASCII_EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const ASCII_PHONE = /(?:\+?977[-\s]?)?(?:9[78]\d{8}|0\d{1,2}[-\s]?\d{6,8})/g;
const NEPALI_PHONE = /(?:९[७८][०-९]{8}|०[०-९]{1,2}[-\s]?[०-९]{6,8})/g;
const ASCII_LONG_ID = /\b\d{5,}(?:[-/]\d{2,})*\b/g;
const NEPALI_LONG_ID = /[०-९]{5,}(?:[-/][०-९]{2,})*/g;
const DATE_LIKE =
  /\b(?:\d{1,4}|[०-९]{1,4})[-/.](?:\d{1,2}|[०-९]{1,2})[-/.](?:\d{1,4}|[०-९]{1,4})\b/g;

export function ingestRealPreetiManifest(manifest: RealPreetiManifest): RealPreetiIngestResult {
  validateManifest(manifest);

  const fixtures: RealPreetiFixture[] = [];
  const warnings: TextWarning[] = [];

  for (const document of manifest.documents) {
    const conversion = convertPreetiToUnicode(document.rawPreeti);
    const redacted = deIdentifyUnicodeText(conversion.normalizedOutput, document.redactions ?? []);
    const segments = segmentUnicodeText(redacted.text, document.rawPreeti);
    const warningCodes = conversion.warnings.map((warning) => warning.code);

    if (segments.length === 0) {
      warnings.push({
        code: "real-preeti-empty-document",
        message: `No usable fixture segments were found in ${document.id}.`,
        severity: "warning"
      });
    }

    segments.forEach((segment, index) => {
      fixtures.push({
        name: `${document.id}-${index + 1}`,
        category: segment.type,
        input: document.rawPreeti,
        expected: segment.text,
        source: `consented-real-preeti:${document.id}`,
        domain: document.domain,
        permissionId: document.permission.permissionId,
        sourceLabel: document.sourceLabel,
        failureTypes: document.failureTypes?.length ? document.failureTypes : ["unknown"],
        redactionCount: redacted.count,
        warningCodes
      });
    });
  }

  return {
    fixtures,
    documentCount: manifest.documents.length,
    fixtureCount: fixtures.length,
    warnings
  };
}

export function deIdentifyUnicodeText(input: string, explicitRedactions: string[] = []) {
  let text = normalizeNepaliText(input);
  let count = 0;

  for (const value of explicitRedactions.filter(Boolean)) {
    const normalizedValue = normalizeNepaliText(value);
    if (!normalizedValue) continue;
    const escaped = normalizedValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    text = text.replace(new RegExp(escaped, "g"), () => {
      count += 1;
      return "[REDACTED]";
    });
  }

  for (const [pattern, label] of [
    [ASCII_EMAIL, "[REDACTED_EMAIL]"],
    [DATE_LIKE, "[REDACTED_DATE]"],
    [ASCII_PHONE, "[REDACTED_PHONE]"],
    [NEPALI_PHONE, "[REDACTED_PHONE]"],
    [ASCII_LONG_ID, "[REDACTED_ID]"],
    [NEPALI_LONG_ID, "[REDACTED_ID]"]
  ] as const) {
    text = text.replace(pattern, () => {
      count += 1;
      return label;
    });
  }

  return { text: normalizeNepaliText(text), count };
}

export function segmentUnicodeText(input: string, rawInput = ""): Array<{ type: RealPreetiSegmentType; text: string }> {
  const normalized = normalizeNepaliText(input);
  const lines = normalized
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const rawLines = rawInput.split(/\r?\n/);
  const segments: Array<{ type: RealPreetiSegmentType; text: string }> = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const rawLine = rawLines[index] ?? "";
    if (isTableRow(rawLine) || isTableRow(line)) {
      segments.push({ type: "table-row", text: line });
      continue;
    }
    if (isFormField(rawLine) || isFormField(line)) {
      segments.push({ type: "form-field", text: line });
      continue;
    }

    const sentenceParts = line
      .split(/(?<=[।?!])\s+/)
      .map((part) => normalizeNepaliText(part.trim()))
      .filter((part) => part.length >= 2);

    if (sentenceParts.length > 1) {
      for (const sentence of sentenceParts) segments.push({ type: "sentence", text: sentence });
    } else {
      segments.push({ type: line.length > 120 ? "paragraph" : "sentence", text: line });
    }
  }

  return segments;
}

function validateManifest(manifest: RealPreetiManifest) {
  if (manifest.schemaVersion !== 1) throw new Error("Real Preeti manifest schemaVersion must be 1.");
  if (!Array.isArray(manifest.documents)) throw new Error("Real Preeti manifest documents must be an array.");

  const seen = new Set<string>();
  for (const document of manifest.documents) {
    if (!document.id || seen.has(document.id)) throw new Error("Each real Preeti document needs a unique id.");
    seen.add(document.id);
    if (document.permission?.status !== "consented" || !document.permission.permissionId) {
      throw new Error(`Document ${document.id} must have explicit consent metadata.`);
    }
    if (!document.rawPreeti.trim()) throw new Error(`Document ${document.id} has no rawPreeti content.`);
  }
}

function isTableRow(line: string): boolean {
  return /\t|\|/.test(line) || /\S\s{2,}\S/.test(line);
}

function isFormField(line: string): boolean {
  return (
    /^[^:：]{2,40}[:：]/.test(line) ||
    /^[\u0900-\u097F\s]{2,40}\s*[-–]\s+\S/.test(line) ||
    /^[\u0900-\u097F\s]{2,40}स्\s+\S/.test(line)
  );
}
