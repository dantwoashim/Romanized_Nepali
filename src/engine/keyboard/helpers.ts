import type { Candidate, TypingContext } from "./types";

interface HelperRow {
  prefix: string;
  romanized: string;
  unicode?: string;
  reason: string;
  confidence: number;
}

const HELPER_ROWS: HelperRow[] = [
  { prefix: "swas", romanized: "swasthya", unicode: "स्वास्थ्य", reason: "health word completion", confidence: 0.62 },
  { prefix: "swas", romanized: "swastha", unicode: "स्वस्थ", reason: "health adjective completion", confidence: 0.56 },
  { prefix: "swas", romanized: "swasthy", unicode: "स्वास्थ्य", reason: "common partial spelling", confidence: 0.5 },
  { prefix: "karya", romanized: "karyalaya", unicode: "कार्यालय", reason: "office word completion", confidence: 0.62 },
  { prefix: "karya", romanized: "karyakram", unicode: "कार्यक्रम", reason: "office word completion", confidence: 0.58 },
  { prefix: "nagarik", romanized: "nagarikta", unicode: "नागरिकता", reason: "government word completion", confidence: 0.64 },
  { prefix: "rajaniti", romanized: "raajaniti", unicode: "राजनीति", reason: "canonical long-vowel helper", confidence: 0.54 },
  { prefix: "rajaniti", romanized: "rajanitik", unicode: "राजनीतिक", reason: "related adjective helper", confidence: 0.5 },
  { prefix: "shik", romanized: "shiksha", unicode: "शिक्षा", reason: "education word completion", confidence: 0.6 },
  { prefix: "pra", romanized: "prashasan", unicode: "प्रशासन", reason: "government administration helper", confidence: 0.61 },
  { prefix: "pra", romanized: "praman", unicode: "प्रमाण", reason: "certificate word helper", confidence: 0.57 },
  { prefix: "pra", romanized: "pradesh", unicode: "प्रदेश", reason: "government place helper", confidence: 0.55 },
  { prefix: "pram", romanized: "pramanpatra", unicode: "प्रमाणपत्र", reason: "government word completion", confidence: 0.58 }
];

export function romanizedHelperCandidates(input: string, context?: TypingContext): Candidate[] {
  const normalized = input.toLowerCase().replace(/\s+/g, " ").trim();
  if (!normalized || !helpersEnabled(context)) return [];

  return HELPER_ROWS
    .filter((row) => row.romanized.startsWith(normalized) || normalized.startsWith(row.prefix))
    .slice(0, 4)
    .map((row, index): Candidate => ({
      id: `romanized-helper-${index}-${row.romanized}`,
      text: row.romanized,
      label: row.unicode,
      type: "romanized-helper",
      confidence: row.confidence,
      reason: [`Romanized helper: ${row.reason}`],
      replaceRange: [0, input.length]
    }));
}

export function canonicalRomanizedLabel(text: string, fallback?: string): string | undefined {
  if (!/[\u0900-\u097F]/.test(text)) return undefined;
  const known: Record<string, string> = {
    "स्वास्थ्य": "swasthya",
    "स्वस्थ": "swastha",
    "स्वास": "swas",
    "स्वास्थ्य कार्यालय": "swasthya karyalaya",
    "स्वास्थ्य बीमा": "swasthya bima",
    "कार्यालय": "karyalaya",
    "कार्यक्रम": "karyakram",
    "प्रशासन": "prashasan",
    "प्रमाण": "praman",
    "प्रमाणपत्र": "pramanpatra",
    "प्रदेश": "pradesh",
    "जिल्ला प्रशासन": "jilla prashasan",
    "जिल्ला प्रशासन कार्यालय": "jilla prashasan karyalaya",
    "नागरिकता": "nagarikta",
    "नागरिकता प्रमाणपत्र": "nagarikta pramanpatra",
    "नागरिकता प्रमाण पत्र": "nagarikta praman patra",
    "राजनीति": "rajaniti",
    "राजनीतिज्ञ": "raajanitigya",
    "शिक्षा मन्त्रालय": "shiksha mantralaya",
    "शिक्षा": "shiksha",
    "मन्त्रालय": "mantralaya",
    "समाचार": "samachar",
    "विकास": "bikas / vikas",
    "संकल्प": "sankalpa",
    "दृढ": "driDha",
    "प्रबिन": "prabin",
    "प्रवीण": "prabin",
    "जन्म दर्ता": "janma darta",
    "मृत्यु दर्ता": "mrityu darta",
    "राजस्व शाखा": "rajaswa shakha",
    "कर कार्यालय": "kar karyalaya",
    "मेरो NID form": "mero NID form"
  };
  return known[text] ?? fallback;
}

function helpersEnabled(context?: TypingContext): boolean {
  return Boolean(
    context?.mode === "diagnostic" ||
    context?.enabledSurfaces.includes("romanized-to-romanized") ||
    context?.enabledSurfaces.includes("romanized-to-unicode-with-labels")
  );
}
