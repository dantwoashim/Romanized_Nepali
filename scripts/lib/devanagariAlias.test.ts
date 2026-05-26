import { describe, expect, it } from "vitest";
import { devanagariToRomanizedAliases } from "./devanagariAlias";

describe("devanagariToRomanizedAliases", () => {
  it("generates reachable sw/v aliases without final schwa pollution", () => {
    expect(devanagariToRomanizedAliases("स्वास्थ्य")).toEqual(expect.arrayContaining(["swasthya"]));
    expect(devanagariToRomanizedAliases("विकास")).toEqual(expect.arrayContaining(["vikas"]));
    expect(devanagariToRomanizedAliases("विश्व")).toEqual(expect.arrayContaining(["vishwa", "bishwa"]));
    expect(devanagariToRomanizedAliases("समाचार")).toContain("samachar");
  });
});
