import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type Domain = "common" | "government" | "education" | "legal" | "office" | "names" | "places";

interface Entry {
  word: string;
  romanized: string;
  frequency: number;
  domain: Domain;
  source: string;
}

const root = process.cwd();
const wordlistPath = join(root, "src/data/wordlists/ne-seed.tsv");
const header = "word\tromanized\tfrequency\tdomain\tsource";
const blockedWords = new Set(["बिराटनगर"]);

const domainPacks: Entry[] = [
  ...pack("names", "manual-pack:names", 948, [
    ["प्रबिन", "prabin"], ["निरज", "niraj"], ["भुसाल", "bhusal"], ["श्रेष्ठ", "shrestha"],
    ["अधिकारी", "adhikari"], ["कोइराला", "koirala"], ["गिरी", "giri"], ["खड्का", "khadka"],
    ["सुमना", "sumana"], ["आशिम", "ashim"], ["सुमन", "suman"], ["सुगम", "sugam"],
    ["अन्जन", "anjan"], ["सुष्मा", "sushma"], ["राम", "ram"], ["सीता", "sita"],
    ["कृष्ण", "krishna"], ["गीता", "gita"], ["राजन", "rajan"], ["सुशील", "sushil"],
    ["माया", "maya"], ["सरिता", "sarita"], ["बिमला", "bimala"], ["बिनोद", "binod"],
    ["कमल", "kamal"], ["लक्ष्मी", "laxmi"], ["सन्तोष", "santosh"], ["संगीता", "sangita"],
    ["रमेश", "ramesh"], ["दिनेश", "dinesh"], ["महेश", "mahesh"], ["उमेश", "umesh"],
    ["सविना", "sabina"], ["सपना", "sapana"], ["प्रकाश", "prakash"], ["दीपक", "dipak"],
    ["कविता", "kabita"], ["मनोज", "manoj"], ["सरोज", "saroj"], ["अमृत", "amrit"],
    ["अनिता", "anita"], ["सुनिता", "sunita"], ["पुजा", "puja"], ["रोजिना", "rojina"],
    ["सन्देश", "sandesh"], ["नवीन", "nabin"], ["सागर", "sagar"], ["दीक्षा", "diksha"],
    ["निशा", "nisha"], ["रचना", "rachana"], ["सुजाता", "sujata"], ["प्रमोद", "pramod"]
  ]),
  ...pack("places", "manual-pack:places", 946, [
    ["काठमाडौं", "kathmandu"], ["ललितपुर", "lalitpur"], ["भक्तपुर", "bhaktapur"], ["पोखरा", "pokhara"],
    ["धरान", "dharan"], ["विराटनगर", "biratnagar"], ["भरतपुर", "bharatpur"], ["बुटवल", "butwal"],
    ["नेपालगञ्ज", "nepalganj"], ["जनकपुर", "janakpur"], ["हेटौंडा", "hetauda"], ["दमक", "damak"],
    ["इटहरी", "itahari"], ["धनगढी", "dhangadhi"], ["वीरगञ्ज", "birgunj"], ["लुम्बिनी", "lumbini"],
    ["बागमती", "bagmati"], ["गण्डकी", "gandaki"], ["कर्णाली", "karnali"], ["कोशी", "koshi"],
    ["मधेश", "madhesh"], ["सुदूरपश्चिम", "sudurpashchim"], ["कैलाली", "kailali"], ["कञ्चनपुर", "kanchanpur"],
    ["चितवन", "chitwan"], ["मकवानपुर", "makwanpur"], ["धादिङ", "dhading"], ["काभ्रे", "kavre"],
    ["सिन्धुपाल्चोक", "sindhupalchok"], ["नुवाकोट", "nuwakot"], ["गोरखा", "gorkha"], ["लमजुङ", "lamjung"],
    ["तनहुँ", "tanahu"], ["स्याङ्जा", "syangja"], ["पाल्पा", "palpa"], ["गुल्मी", "gulmi"],
    ["रुपन्देही", "rupandehi"], ["कपिलवस्तु", "kapilvastu"], ["दाङ", "dang"], ["बाँके", "banke"],
    ["बर्दिया", "bardiya"], ["सुर्खेत", "surkhet"], ["दैलेख", "dailekh"], ["जुम्ला", "jumla"],
    ["मुस्ताङ", "mustang"], ["मनाङ", "manang"], ["इलाम", "ilam"], ["झापा", "jhapa"],
    ["मोरङ", "morang"], ["सुनसरी", "sunsari"], ["उदयपुर", "udayapur"], ["सप्तरी", "saptari"],
    ["सिरहा", "siraha"], ["धनुषा", "dhanusha"], ["महोत्तरी", "mahottari"], ["सर्लाही", "sarlahi"]
  ]),
  ...pack("government", "manual-pack:government", 932, [
    ["प्रशासन", "prasashan"], ["सम्पर्क", "samparka"], ["निर्णय", "nirnaya"], ["प्रस्ताव", "prastav"],
    ["सिफारिस", "sifarish"], ["अनुसूची", "anusuchi"], ["दर्ता", "darta"], ["चलानी", "chalani"],
    ["शाखा", "shakha"], ["एकाइ", "ekai"], ["आयोग", "aayog"], ["समिति", "samiti"],
    ["परिपत्र", "paripatra"], ["कार्यविधि", "karyabidhi"], ["मापदण्ड", "mapdanda"], ["स्वीकृति", "swikriti"],
    ["अनुमति", "anumati"], ["करदाता", "kardata"], ["लेखा", "lekha"], ["राजपत्र", "rajpatra"],
    ["सूचक", "suchak"], ["प्राधिकरण", "pradhikaran"], ["सचिव", "sachib"], ["उपसचिव", "upasachib"],
    ["अधिकृत", "adhikrit"], ["कर्मचारी", "karmachari"], ["परियोजना", "pariyojana"], ["कार्यक्रम", "karyakram"]
  ]),
  ...pack("education", "manual-pack:education", 930, [
    ["पाठ्यक्रम", "pathyakram"], ["पुस्तकालय", "pustakalaya"], ["अभिभावक", "abhibhabak"], ["प्रधानाध्यापक", "pradhanadhyapak"],
    ["प्राध्यापक", "pradhyapak"], ["कक्षा", "kaksha"], ["भर्ना", "bharna"], ["नतिजा", "natija"],
    ["अंकपत्र", "ankapatra"], ["प्रयोगशाला", "prayogshala"], ["छात्रवृत्ति", "chhatrabritti"], ["अनुसन्धान", "anusandhan"],
    ["तालिम", "talim"], ["शैक्षिक", "shaikshik"], ["शुल्क", "shulka"], ["हाजिरी", "hajiri"]
  ]),
  ...pack("legal", "manual-pack:legal", 928, [
    ["अदालत", "adalat"], ["मुद्दा", "mudda"], ["फैसला", "faisala"], ["पुनरावेदन", "punarabedan"],
    ["वारेसनामा", "waresnama"], ["सर्वोच्च", "sarbochcha"], ["संविधान", "samvidhan"], ["ऐन", "ain"],
    ["नियमावली", "niyamawali"], ["कानुनी", "kanuni"], ["प्रतिवादी", "pratiwadi"], ["निवेदक", "nibedak"],
    ["म्याद", "myad"], ["इजलास", "ijalas"], ["बहस", "bahas"], ["प्रमाण", "praman"]
  ]),
  ...pack("office", "manual-pack:office", 926, [
    ["रेकर्ड", "record"], ["डाटा", "data"], ["प्रिन्ट", "print"], ["सेभ", "save"],
    ["ढाँचा", "dhancha"], ["प्रतिवेदन", "pratibedan"], ["प्रतिलिपि", "pratilipi"], ["हस्ताक्षर", "hastakshar"],
    ["मिति", "miti"], ["पत्राचार", "patrachar"], ["फोल्डर", "folder"], ["तालिका", "talika"],
    ["बैठक", "baithak"], ["कार्यसूची", "karyasuchi"], ["टिप्पणी", "tippani"], ["सन्दर्भ", "sandarbha"]
  ])
];

const suffixes = [
  ["को", "ko", 0],
  ["का", "ka", -4],
  ["की", "ki", -4],
  ["मा", "ma", -5],
  ["ले", "le", -6],
  ["लाई", "lai", -7],
  ["बाट", "bata", -8],
  ["सँग", "sanga", -9],
  ["हरू", "haru", -10]
] as const;

const existing = parseExisting(readFileSync(wordlistPath, "utf8"));
const baseEntries = existing.filter((entry) => !entry.source.includes("derived") && !blockedWords.has(entry.word));
const merged = new Map<string, Entry>();

for (const entry of [...baseEntries, ...domainPacks]) {
  upsert(entry);
}

const seedBase = [...merged.values()];
for (const entry of seedBase) {
  for (const [suffix, romanSuffix, boost] of suffixes) {
    const source = entry.source.startsWith("manual-pack") ? `${entry.source}:derived` : "seed-derived";
    upsert({
      word: `${entry.word}${suffix}`,
      romanized: `${entry.romanized}${romanSuffix}`,
      frequency: Math.max(1, entry.frequency + boost - 170),
      domain: entry.domain,
      source
    });
  }
}

const rows = [...merged.values()]
  .sort((a, b) => b.frequency - a.frequency || a.domain.localeCompare(b.domain) || a.word.localeCompare(b.word, "ne"))
  .map((entry) => [entry.word, entry.romanized, String(entry.frequency), entry.domain, entry.source].join("\t"));

writeFileSync(wordlistPath, `${header}\n${rows.join("\n")}\n`);
console.log(`Wrote ${rows.length} wordlist rows to ${wordlistPath}`);

function pack(domain: Domain, source: string, startFrequency: number, pairs: Array<[string, string]>): Entry[] {
  return pairs.map(([word, romanized], index) => ({
    word,
    romanized,
    frequency: startFrequency - index,
    domain,
    source
  }));
}

function parseExisting(raw: string): Entry[] {
  const [first, ...rows] = raw.trim().split(/\r?\n/);
  if (first !== header) throw new Error(`Unexpected wordlist header: ${first}`);
  return rows.map((row) => {
    const [word, romanized, frequency, domain, source] = row.split("\t");
    return { word, romanized, frequency: Number(frequency), domain: domain as Domain, source };
  });
}

function upsert(entry: Entry) {
  const key = entry.word.normalize("NFC");
  const existingEntry = merged.get(key);
  if (!existingEntry || domainPriority(entry.domain) > domainPriority(existingEntry.domain) || entry.frequency > existingEntry.frequency) {
    merged.set(key, { ...entry, word: key });
  }
}

function domainPriority(domain: Domain) {
  return {
    names: 7,
    places: 6,
    government: 5,
    legal: 4,
    office: 3,
    education: 2,
    common: 1
  }[domain];
}
