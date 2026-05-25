import { describe, expect, it } from "vitest";
import {
  deIdentifyUnicodeText,
  ingestRealPreetiManifest,
  segmentUnicodeText,
  type RealPreetiManifest
} from "./preetiRealFixturePipeline";

describe("real Preeti validation fixture pipeline", () => {
  it("requires explicit consent metadata and segments de-identified fixtures", () => {
    const manifest: RealPreetiManifest = {
      schemaVersion: 1,
      collectedAt: "2026-05-25",
      documents: [
        {
          id: "school-001",
          domain: "education",
          sourceLabel: "school-admin-consented-sample",
          permission: {
            status: "consented",
            permissionId: "perm-school-001",
            holderRole: "school administrator"
          },
          rawPreeti: "g]kfn\nनाम: राम ९८४१२३४५६७\ng]kfn\tg]kfn",
          failureTypes: ["layout", "mixed-english"],
          redactions: ["राम"]
        }
      ]
    };

    const result = ingestRealPreetiManifest(manifest);

    expect(result.documentCount).toBe(1);
    expect(result.fixtureCount).toBeGreaterThanOrEqual(3);
    expect(result.fixtures.every((fixture) => fixture.permissionId === "perm-school-001")).toBe(true);
    expect(result.fixtures.some((fixture) => fixture.category === "form-field")).toBe(true);
    expect(result.fixtures.some((fixture) => fixture.category === "table-row")).toBe(true);
    expect(result.fixtures.map((fixture) => fixture.expected).join("\n")).toContain("[REDACTED]");
    expect(result.fixtures.map((fixture) => fixture.expected).join("\n")).toContain("[REDACTED_PHONE]");
  });

  it("redacts explicit values, emails, phones, dates, and long ids", () => {
    const redacted = deIdentifyUnicodeText(
      "सीता sita@example.com 9841234567 2080/01/03 123456789",
      ["सीता"]
    );

    expect(redacted.text).toBe("[REDACTED] [REDACTED_EMAIL] [REDACTED_PHONE] [REDACTED_DATE] [REDACTED_ID]");
    expect(redacted.count).toBe(5);
  });

  it("classifies table rows, form fields, sentences, and paragraphs", () => {
    const segments = segmentUnicodeText(
      ["नाम: विवरण", "कक्षा | विद्यार्थी", "यो पहिलो वाक्य हो। यो दोस्रो वाक्य हो।", "लामो विवरण ".repeat(16)].join("\n")
    );

    expect(segments.some((segment) => segment.type === "form-field")).toBe(true);
    expect(segments.some((segment) => segment.type === "table-row")).toBe(true);
    expect(segments.filter((segment) => segment.type === "sentence").length).toBeGreaterThanOrEqual(2);
    expect(segments.some((segment) => segment.type === "paragraph")).toBe(true);
  });
});
