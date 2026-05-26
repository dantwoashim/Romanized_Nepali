import { convert, convertPreeti, convertRomanized } from "./index";

describe("engine facade wrappers", () => {
  it("routes auto conversion through the classifier and returns timing in benchmark mode", () => {
    const result = convert("PDF ma date milena", { benchmark: true });
    expect(result.mode).toBe("romanized-mixed");
    expect(result.timingMs).toBeGreaterThanOrEqual(0);
    expect(result.output).toContain("PDF");
    expect(result.output).toContain("date");
  });

  it("wraps Romanized mixed conversion without corrupting protected spans", () => {
    const cases = [
      "mero NID form ma naam wrong cha",
      "PDF ma date milena",
      "email address test@example.com ho",
      "phone number 9841000000 ho",
      "ward-05 ko online form submit bhayena",
      "X-ray report upload garna mildaina",
      "Form No. 2079-080 ko record system ma dekhaudaina",
      "user le correct final output herna parcha",
      'phrase detect garna "swasthya" jasto example parcha'
    ];

    for (const input of cases) {
      const result = convertRomanized(input, { mode: "romanized-mixed" });
      for (const span of result.protectedSpans) {
        expect(result.output, `${input} -> ${span.original}`).toContain(span.original);
      }
      expect(result.diagnostics.some((diagnostic) => diagnostic.code === "PROTECTED_SPANS_APPLIED")).toBe(true);
    }
  });

  it("wraps Preeti mixed conversion without sending protected spans through the legacy converter", () => {
    const result = convertPreeti("sfof{no NID PDF email@test.com Form No. 2079-080", { mode: "preeti-mixed" });
    expect(result.output).toContain("कार्यालय");
    for (const expected of ["NID", "PDF", "email@test.com", "Form No.", "2079-080"]) {
      expect(result.output).toContain(expected);
    }
    expect(result.protectedSpans.map((span) => span.original)).toEqual(
      expect.arrayContaining(["NID", "PDF", "email@test.com", "Form No.", "2079-080"])
    );
  });

  it("keeps strict Preeti available and warns when protected-like spans are present", () => {
    const result = convertPreeti("NID PDF sfof{no", { mode: "preeti-strict" });
    expect(result.mode).toBe("preeti-strict");
    expect(result.output).toContain("NID");
    expect(result.warnings.some((warning) => warning.code === "STRICT_PREETI_MIXED_CONTENT_WARNING")).toBe(true);
  });

  it("does not regress the existing strict Romanized converter path", () => {
    const result = convertRomanized("janma miti", { mode: "romanized-strict" });
    expect(result.output).toBe("जन्म मिति");
    expect(result.alternatives.length).toBeGreaterThan(0);
  });

  it("applies mode-aware digit policy without corrupting protected identifiers", () => {
    expect(convertRomanized("Bi.Sam. 2083", { mode: "romanized-government" }).normalizedOutput).toBe("बि.साम. २०८३");
    expect(convertRomanized("Form No. 2079-080", { mode: "romanized-government" }).normalizedOutput).toBe("Form No. 2079-080");
    expect(convertRomanized("ward-05 ko online form", { mode: "romanized-government" }).normalizedOutput).toBe("ward-05 को online form");
    expect(convertRomanized("phone number 9841000000 ho", { mode: "romanized-mixed" }).normalizedOutput).toBe("phone number 9841000000 हो");
  });

  it("does not call fetch from the core engine facade", () => {
    const originalFetch = globalThis.fetch;
    const fetchSpy = vi.fn(() => {
      throw new Error("fetch must not be called by the engine");
    });
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      writable: true,
      value: fetchSpy
    });

    try {
      const result = convert("NID form ko naam field", { mode: "romanized-mixed" });
      expect(result.output).toContain("NID");
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      Object.defineProperty(globalThis, "fetch", {
        configurable: true,
        writable: true,
        value: originalFetch
      });
    }
  });
});
