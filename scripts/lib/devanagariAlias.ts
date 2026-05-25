const INDEPENDENT_VOWELS: Record<string, string> = {
  अ: "a",
  आ: "aa",
  इ: "i",
  ई: "ii",
  उ: "u",
  ऊ: "uu",
  ए: "e",
  ऐ: "ai",
  ओ: "o",
  औ: "au",
  ऋ: "ri"
};

const MATRAS: Record<string, string> = {
  "ा": "aa",
  "ि": "i",
  "ी": "ii",
  "ु": "u",
  "ू": "uu",
  "े": "e",
  "ै": "ai",
  "ो": "o",
  "ौ": "au",
  "ृ": "ri"
};

const CONSONANTS: Record<string, string> = {
  क: "k",
  ख: "kh",
  ग: "g",
  घ: "gh",
  ङ: "ng",
  च: "ch",
  छ: "chh",
  ज: "j",
  झ: "jh",
  ञ: "ny",
  ट: "T",
  ठ: "Th",
  ड: "D",
  ढ: "Dh",
  ण: "N",
  त: "t",
  थ: "th",
  द: "d",
  ध: "dh",
  न: "n",
  प: "p",
  फ: "ph",
  ब: "b",
  भ: "bh",
  म: "m",
  य: "y",
  र: "r",
  ल: "l",
  व: "v",
  श: "sh",
  ष: "Sh",
  स: "s",
  ह: "h",
  ळ: "L"
};

const VIRAMA = "्";

export function devanagariToRomanizedAliases(word: string): string[] {
  const base = devanagariToRomanized(word);
  const aliases = new Set<string>([base]);
  aliases.add(base.replace(/ii/g, "ee"));
  aliases.add(base.replace(/v/g, "b"));
  aliases.add(base.replace(/b/g, "v"));
  aliases.add(base.replace(/ph/g, "f"));
  aliases.add(base.replace(/Sh/g, "sh"));
  aliases.add(base.replace(/sh/g, "s"));
  aliases.add(base.replace(/kSh/g, "ksh"));
  aliases.add(base.replace(/jny/g, "gya"));
  aliases.add(base.replace(/aa/g, "a"));

  return Array.from(aliases)
    .map((alias) => alias.replace(/[^A-Za-z]/g, "").toLowerCase())
    .filter((alias) => alias.length >= 2)
    .slice(0, 8);
}

export function devanagariToRomanized(word: string): string {
  let output = "";
  for (let index = 0; index < word.length; index += 1) {
    const char = word[index];
    const next = word[index + 1];

    if (INDEPENDENT_VOWELS[char]) {
      output += INDEPENDENT_VOWELS[char];
      continue;
    }

    if (CONSONANTS[char]) {
      output += CONSONANTS[char];
      if (next === VIRAMA) {
        index += 1;
        continue;
      }
      if (next && MATRAS[next]) {
        output += MATRAS[next];
        index += 1;
        continue;
      }
      output += "a";
      continue;
    }

    if (char === "ं") output += "n";
    if (char === "ँ") output += "n";
  }

  return output;
}
