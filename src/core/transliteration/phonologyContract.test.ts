import { composeRomanizedToken } from "./devanagariComposer";
import { transliterateRomanized } from "./transliterateRomanized";

describe("common-nepali phonology contract", () => {
  it("handles s / sh / Sh with candidates", () => {
    expect(transliterateRomanized("sarkar").normalizedOutput).toBe("सरकार");
    const shakti = transliterateRomanized("shakti");
    expect(shakti.normalizedOutput).toBe("शक्ति");
    expect(shakti.candidates.some((candidate) => candidate.normalizedText.includes("ष"))).toBe(true);
    expect(composeRomanizedToken("Shastra").output.startsWith("ष")).toBe(true);
  });

  it("handles ch / chh / c defaults", () => {
    expect(transliterateRomanized("chala").normalizedOutput).toBe("चल");
    expect(transliterateRomanized("chhaina").normalizedOutput).toBe("छैन");
    expect(transliterateRomanized("cala").normalizedOutput).toBe("चल");
  });

  it("handles ksh default and x as candidate/profile-dependent", () => {
    expect(transliterateRomanized("kshamata").normalizedOutput).toBe("क्षमता");
    expect(transliterateRomanized("kshetra").normalizedOutput).toBe("क्षेत्र");
    expect(transliterateRomanized("x").normalizedOutput).toBe("x");
    expect(transliterateRomanized("X").normalizedOutput).toBe("X");
    expect(transliterateRomanized("xalo").candidates.some((candidate) => candidate.normalizedText.includes("क्ष"))).toBe(true);
    expect(transliterateRomanized("xetra").normalizedOutput).toBe("क्षेत्र");
  });

  it("handles gya / jnya, tra, and shra", () => {
    expect(transliterateRomanized("gyan").normalizedOutput).toBe("ज्ञान");
    expect(transliterateRomanized("jnya").normalizedOutput).toBe("ज्ञ");
    expect(transliterateRomanized("patra").normalizedOutput).toBe("पत्र");
    expect(transliterateRomanized("shram").normalizedOutput).toBe("श्रम");
  });

  it("handles ri default versus dictionary ऋ", () => {
    expect(transliterateRomanized("rishi").normalizedOutput).toBe("ऋषि");
    expect(transliterateRomanized("rimjhim").normalizedOutput).toBe("रिमझिम");
    expect(transliterateRomanized("kri").normalizedOutput).toBe("कृ");
    expect(transliterateRomanized("krishi").normalizedOutput).toBe("कृषि");
    expect(transliterateRomanized("driDha").normalizedOutput).toBe("दृढ");
    expect(transliterateRomanized("atibrishTi").normalizedOutput).toBe("अतिवृष्टि");
    expect(transliterateRomanized("anaabrishTi").normalizedOutput).toBe("अनावृष्टि");
    expect(transliterateRomanized("khaNDabrishTi").normalizedOutput).toBe("खण्डवृष्टि");
    expect(transliterateRomanized("kri").normalizedOutput).not.toContain("़");
  });

  it("handles v / w and f / ph", () => {
    expect(transliterateRomanized("vidyalaya").normalizedOutput).toBe("विद्यालय");
    expect(transliterateRomanized("sewa").normalizedOutput).toBe("सेवा");
    expect(transliterateRomanized("file").candidates.some((candidate) => candidate.normalizedText === "फाइल")).toBe(true);
    expect(transliterateRomanized("phal").normalizedOutput).toBe("फल");
  });

  it("preserves digits, periods, and uppercase acronyms while supporting explicit danda", () => {
    expect(transliterateRomanized("nagarikta 123").normalizedOutput).toBe("नागरिकता 123");
    expect(transliterateRomanized("Bi.Sam. 2083", "common-nepali", { digitPolicy: "convert-devanagari" }).normalizedOutput).toBe("वि.सं. २०८३");
    expect(transliterateRomanized("nepal.").normalizedOutput).toBe("नेपाल.");
    expect(transliterateRomanized("nepal ||").normalizedOutput).toBe("नेपाल ।");
    expect(transliterateRomanized("NID PDF").normalizedOutput).toBe("NID PDF");
  });

  it("keeps rule-only unknown plausible Nepali words usable", () => {
    expect(transliterateRomanized("kamal").normalizedOutput).toBe("कमल");
    expect(transliterateRomanized("nawa").normalizedOutput).toBe("नव");
    expect(transliterateRomanized("gharbar").normalizedOutput).toBe("घरबर");
  });

  it("composes generic halanta clusters without dictionary rescue", () => {
    const cases = [
      ["samparka", "सम्पर्क"],
      ["rk", "र्क"],
      ["rm", "र्म"],
      ["rn", "र्न"],
      ["ry", "र्य"],
      ["rsh", "र्श"],
      ["sw", "स्व"],
      ["kt", "क्त"],
      ["lt", "ल्त"],
      ["nd", "न्द"],
      ["mb", "म्ब"],
      ["mp", "म्प"],
      ["nm", "न्म"],
      ["nt", "न्त"],
      ["st", "स्त"],
      ["sk", "स्क"],
      ["sp", "स्प"],
      ["rt", "र्त"],
      ["rd", "र्द"],
      ["lp", "ल्प"]
    ] as const;

    for (const [input, expected] of cases) {
      const composed = composeRomanizedToken(input);
      expect(composed.output, input).toBe(expected);
      expect(composed.trace.some((trace) => trace.notes?.includes("generic-halanta-before-consonant")), input).toBe(true);
    }
  });

  it("can disable dictionary lookup to expose rule-only parser output", () => {
    expect(transliterateRomanized("samparka", "common-nepali", { useDictionary: false }).normalizedOutput).toBe("सम्पर्क");
    expect(transliterateRomanized("sarkar").normalizedOutput).toBe("सरकार");
    expect(transliterateRomanized("sarkar", "common-nepali", { useDictionary: false }).normalizedOutput).toBe("सर्कर");
  });

  it("handles failure-prone mixed text, names, spacing, and long phrases", () => {
    expect(transliterateRomanized("Excel report ma naam").normalizedOutput).toBe("Excel report मा नाम");
    expect(transliterateRomanized("prashasan").normalizedOutput).toBe("प्रशासन");
    expect(transliterateRomanized("janma miti").normalizedOutput).toBe("जन्म मिति");
    expect(transliterateRomanized("lakshmi").normalizedOutput).toBe("लक्ष्मी");
    expect(transliterateRomanized("x ray").normalizedOutput).toBe("x ray");
    expect(transliterateRomanized("X-ray").normalizedOutput).toBe("X-ray");
    expect(transliterateRomanized("shrestha").normalizedOutput).toBe("श्रेष्ठ");
    expect(transliterateRomanized("srestha").normalizedOutput).toBe("श्रेष्ठ");
    expect(transliterateRomanized("shresta").normalizedOutput).toBe("श्रेष्ठ");
    expect(transliterateRomanized("prabin niraj shrestha").normalizedOutput).toBe("प्रबिन निरज श्रेष्ठ");
    expect(transliterateRomanized("niraj").candidates.some((candidate) => candidate.normalizedText === "नीरज")).toBe(true);
    expect(transliterateRomanized("  sarkar   ko   suchana  ").normalizedOutput).toBe(" सरकार को सूचना ");
    expect(transliterateRomanized("nagarikta ko pramanpatra karyalaya ma darta").normalizedOutput).toBe(
      "नागरिकता को प्रमाणपत्र कार्यालय मा दर्ता"
    );
  });

  it("treats title-case Romanized words as presentation capitalization, not phoneme intent", () => {
    expect(transliterateRomanized("Sarkar").normalizedOutput).toBe("सरकार");
    expect(transliterateRomanized("Shastra").normalizedOutput).toBe("शास्त्र");
    expect(transliterateRomanized("Thapa").normalizedOutput).toBe("थापा");
    expect(transliterateRomanized("Tika").normalizedOutput).toBe("टीका");
    expect(transliterateRomanized("Laxmi").normalizedOutput).toBe("लक्ष्मी");
  });
});
