const unicodeToPreetiMap = new Map<string, string>([
  ["अ", "c"],
  ["आ", "cf"],
  ["ा", "f"],
  ["इ", "O"],
  ["ई", "O{"],
  ["र्", "{"],
  ["उ", "p"],
  ["ए", "P"],
  ["े", "]"],
  ["ै", "}"],
  ["ो", "f]"],
  ["ौ", "f}"],
  ["ओ", "cf]"],
  ["औ", "cf}"],
  ["ं", "+"],
  ["ँ", "F"],
  ["ि", "l"],
  ["ी", "L"],
  ["ु", "'"],
  ["ू", '"'],
  ["क", "s"],
  ["ख", "v"],
  ["ग", "u"],
  ["घ", "3"],
  ["ङ", "ª"],
  ["च", "r"],
  ["छ", "5"],
  ["ज", "h"],
  ["झ", "´"],
  ["ञ", "`"],
  ["ट", "6"],
  ["ठ", "7"],
  ["ड", "8"],
  ["ढ", "9"],
  ["ण", "0f"],
  ["त", "t"],
  ["थ", "y"],
  ["द", "b"],
  ["ध", "w"],
  ["न", "g"],
  ["प", "k"],
  ["फ", "km"],
  ["ब", "a"],
  ["भ", "e"],
  ["म", "d"],
  ["य", "o"],
  ["र", "/"],
  ["रू", "?"],
  ["ृ", "["],
  ["ल", "n"],
  ["व", "j"],
  ["स", ";"],
  ["श", "z"],
  ["ष", "if"],
  ["ज्ञ", "1"],
  ["ह", "x"],
  ["१", "!"],
  ["२", "@"],
  ["३", "#"],
  ["४", "$"],
  ["५", "%"],
  ["६", "^"],
  ["७", "&"],
  ["८", "*"],
  ["९", "("],
  ["०", ")"],
  ["।", "."],
  ["्", "\\"],
  ["ऊ", "pm"],
  ["-", " "],
  ["(", "-"],
  [")", "_"]
]);

const halfLetterSource = new Set(Array.from("wertyuxasdghjkzvn"));
const halfConjunctSource = new Set(Array.from("WERTYUXASDGHJK:ZVNIi"));
const rephMatras = new Set(["ा", "ो", "ौ", "े", "ै", "ी"]);

// Adapted for fixture generation from GlobalPolicy UnicodeToPreeti (MIT).
export function unicodeToPreeti(input: string): string {
  const normalized = normalizeUnicodeForPreeti(input);
  const chars = Array.from(normalized);
  let converted = "";

  for (let index = 0; index < chars.length; index += 1) {
    const char = chars[index];

    if (chars[index + 1] === "ि") {
      converted += char === "q" ? `l${char}` : `l${lookup(char)}`;
      index += 1;
      continue;
    }

    if (chars[index + 2] === "ि" && halfConjunctSource.has(char)) {
      if (chars[index + 1] !== "q") {
        converted += `l${char}${lookup(chars[index + 1])}`;
        index += 2;
        continue;
      }
      converted += `l${char}${chars[index + 1]}`;
      index += 2;
      continue;
    }

    if (chars[index + 1] === "्" && char === "र") {
      const base = chars[index + 2];
      const matra = chars[index + 3];
      if (rephMatras.has(matra)) {
        converted += `${lookup(base)}${lookup(matra)}{`;
        index += 3;
        continue;
      }
      if (matra === "ि") {
        converted += `${lookup(matra)}${lookup(base)}{`;
        index += 3;
        continue;
      }
      converted += `${lookup(base)}{`;
      index += 2;
      continue;
    }

    if (chars[index + 3] === "ि" && (chars[index + 2] === "|" || chars[index + 2] === "«") && halfConjunctSource.has(char)) {
      converted += `l${char}${lookup(chars[index + 1])}${chars[index + 2]}`;
      index += 3;
      continue;
    }

    converted += lookup(char);
  }

  return converted
    .replaceAll("Si", "I")
    .replaceAll("H`", "1")
    .replaceAll("b\\w", "4")
    .replaceAll("z|", ">")
    .replaceAll("/'", "?")
    .replaceAll('/"', "¿")
    .replaceAll("Tt", "Q")
    .replaceAll("b\\lj", "lå")
    .replaceAll("b\\j", "å")
    .replaceAll("0f\\", "0")
    .replaceAll("`\\", "~");
}

function normalizeUnicodeForPreeti(input: string): string {
  const chars = Array.from(input);
  let normalized = "";

  for (let index = 0; index < chars.length; index += 1) {
    const char = chars[index];
    const next = chars[index + 1];
    const afterNext = chars[index + 2];

    if (char !== "र" && next === "्" && afterNext && ![" ", "।", ","].includes(afterNext)) {
      if (afterNext !== "र") {
        const mapped = unicodeToPreetiMap.get(char);
        if (mapped && halfLetterSource.has(mapped)) {
          normalized += mapped.toUpperCase();
          index += 1;
          continue;
        }
        if (char === "स") {
          normalized += ":";
          index += 1;
          continue;
        }
        if (char === "ष") {
          normalized += "i";
          index += 1;
          continue;
        }
      }
    }

    if (chars[index - 1] !== "र" && char === "्" && next === "र") {
      normalized += chars[index - 1] !== "ट" && chars[index - 1] !== "ठ" && chars[index - 1] !== "ड" ? "|" : "«";
      index += 1;
      continue;
    }

    normalized += char;
  }

  return normalized.replaceAll("त|", "q");
}

function lookup(char: string): string {
  return unicodeToPreetiMap.get(char) ?? char;
}
