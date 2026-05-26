import dictionaryNe from "dictionary-ne";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { normalizeNepaliText } from "../src/core/normalize/normalizeNepaliText";
import type { SuggestionDomain } from "../src/core/types";
import { devanagariToRomanizedAliases } from "./lib/devanagariAlias";

const root = process.cwd();
const outputPath = process.argv[2] ?? join(root, "reports/dictionary-ne-review.tsv");
const limit = Number(process.argv[3] ?? 2500);

const rows = extractDictionaryWords(Buffer.from(dictionaryNe.dic).toString("utf8"))
  .slice(0, limit)
  .flatMap((word) =>
    devanagariToRomanizedAliases(word).map((alias) => ({
      word,
      alias,
      domain: classifyDomain(word),
      reviewStatus: "needs-human-review",
      source: "dictionary-ne@2.0.0",
      license: "LGPL-2.1"
    }))
  );

mkdirSync(join(root, "reports"), { recursive: true });
writeFileSync(
  outputPath,
  [
    "word\talias\tdomain\treviewStatus\tsource\tlicense",
    ...rows.map((row) => `${row.word}\t${row.alias}\t${row.domain}\t${row.reviewStatus}\t${row.source}\t${row.license}`)
  ].join("\n") + "\n"
);

console.log(`Wrote ${rows.length} dictionary-ne alias review rows to ${outputPath}`);

function extractDictionaryWords(dic: string): string[] {
  const [, ...lines] = dic.split(/\n/);
  return Array.from(
    new Set(
      lines
        .map((line) => normalizeNepaliText(line.split("/")[0]?.trim() ?? ""))
        .filter((word) => /^[\u0900-\u097F]{2,28}$/.test(word))
    )
  ).sort((a, b) => scoreWord(b) - scoreWord(a) || a.localeCompare(b));
}

function scoreWord(word: string): number {
  let score = 0;
  if (/्/.test(word)) score += 8;
  if (/(क्ष|त्र|ज्ञ|श्र|द्ध|द्द|त्त|द्य|प्र|क्र|ग्र|न्म|म्प|र्क)/.test(word)) score += 6;
  if (/[ािीुूृेैोौंँ]/.test(word)) score += 3;
  if (word.length >= 6) score += 2;
  return score;
}

function classifyDomain(word: string): SuggestionDomain {
  if (/(निवेदन|कार्यालय|प्रशासन|नागरिक|वडा|पालिका|मन्त्रालय|अधिकारी|सूचना)/.test(word)) return "government";
  if (/(विद्यालय|शिक्षा|विद्यार्थी|शिक्षक|कक्षा|परीक्षा|पुस्तक)/.test(word)) return "education";
  if (/(कानुन|मुद्दा|अदालत|प्रमाण|पत्र|न्याय|करार)/.test(word)) return "legal";
  if (/(फाइल|रिपोर्ट|दर्ता|हाजिरी|बैठक|सम्पर्क|विवरण)/.test(word)) return "office";
  return "common";
}
