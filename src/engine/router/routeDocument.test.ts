import { describe, expect, it } from "vitest";
import { convert } from "../index";

describe("span-routed document conversion", () => {
  it("repairs Preeti islands inside Unicode office text", () => {
    const cases = new Map([
      [`मृत्य' btf{`, "मृत्यु दर्ता"],
      ["a;fOF;/fO", "बसाइँसराइ"],
      [`hUuf wgL k|df0fk'र्जा`, "जग्गा धनी प्रमाणपुर्जा"],
      [`बहाद'/ yfkf`, "बहादुर थापा"],
      [`स'dg clwsf/L`, "सुमन अधिकारी"],
      [`lxdfn u'रुङ`, "हिमाल गुरुङ"],
      [`p"jL{o bz{gfg';f/`, "पूर्वीय दर्शनानुसार"],
      [`j;'w}j s'6'Dasd\\`, "वसुधैव कुटुम्बकम्"],
      [`ctM b[9 ;ª\\slNkt`, "अतः दृढ सङ्कल्पित"],
      [`b'em]/ sfo{qmdsf nIox? k|fKt`, "बुझेर कार्यक्रमका लक्ष्यहरू प्राप्त"]
    ]);
    for (const [input, expected] of cases) {
      expect(convert(input, { mode: "mixed-unicode-legacy-repair" }).output).toBe(expected);
    }
  });

  it("preserves English stems and converts Nepali suffixes", () => {
    expect(convert("English tokenharu", { mode: "romanized-mixed-office" }).output).toBe("English tokenहरू");
    expect(convert("fileharu systemmaa recordko", { mode: "romanized-mixed-office" }).output).toBe("fileहरू systemमा recordको");
  });

  it("handles hard Romanized morphology through the routed path", () => {
    const cases = new Map([
      ["jastaa", "जस्ता"],
      ["karyalayakaa", "कार्यालयका"],
      ["bhandaa bhandai", "भन्दा भन्दै"],
      ["shabdaharu pani", "शब्दहरू पनि"],
      ["samrakshaN", "संरक्षण"],
      ["raajanitigya", "राजनीतिज्ञ"],
      ["bhayeko", "भएको"],
      ["rakhnuparne", "राख्नुपर्ने"],
      ["kothamaa", "कोठामा"]
    ]);
    for (const [input, expected] of cases) {
      const result = convert(input, { mode: "romanized-mixed-office" });
      expect(result.output).toBe(expected);
      expect(result.action).not.toBe("refuse");
    }
  });

  it("preserves protected structured spans through routed conversion", () => {
    const result = convert("Form No. 2079-080 ko record systemmaa PDF chha", { mode: "romanized-mixed-office" });
    expect(result.output).toContain("Form No. 2079-080");
    expect(result.output).toContain("PDF");
    expect(result.typedSpans?.some((span) => span.kind === "identifier")).toBe(true);
  });
});
