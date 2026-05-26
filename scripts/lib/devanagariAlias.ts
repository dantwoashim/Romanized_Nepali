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
  aliases.add(stripFinalSchwa(base));
  aliases.add(base.replace(/ii/g, "ee"));
  aliases.add(base.replace(/v/g, "b"));
  aliases.add(base.replace(/b/g, "v"));
  aliases.add(base.replace(/ph/g, "f"));
  aliases.add(base.replace(/Sh/g, "sh"));
  aliases.add(base.replace(/sh/g, "s"));
  aliases.add(base.replace(/sv/g, "sw"));
  aliases.add(base.replace(/shv/g, "shw"));
  aliases.add(base.replace(/kSh/g, "ksh"));
  aliases.add(base.replace(/jny/g, "gya"));
  aliases.add(base.replace(/aa/g, "a"));
  for (const alias of [...aliases]) {
    aliases.add(alias.replace(/sv/g, "sw"));
    aliases.add(alias.replace(/shv/g, "shw"));
    aliases.add(alias.replace(/aa/g, "a"));
  }
  for (const alias of [...aliases]) {
    aliases.add(alias.replace(/vishw/g, "bishw"));
    aliases.add(alias.replace(/^v/, "b"));
  }

  return Array.from(aliases)
    .flatMap((alias) => [alias, stripFinalSchwa(alias)])
    .map((alias) => alias.replace(/[^A-Za-z]/g, "").toLowerCase())
    .filter((alias) => alias.length >= 2)
    .filter((alias, index, all) => all.indexOf(alias) === index)
    .slice(0, 16);
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

function stripFinalSchwa(alias: string): string {
  if (alias.length <= 2) return alias;
  return alias.endsWith("a") ? alias.slice(0, -1) : alias;
}
