import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { normalizeNepaliText } from "../src/core/normalize/normalizeNepaliText";
import { unicodeToPreeti } from "./lib/unicodeToPreeti";

interface WordRow {
  word: string;
  romanized: string;
  frequency: number;
  domain: string;
  source: string;
}

interface PhraseRow {
  input: string;
  output: string;
  domain: string;
  frequency: number;
  source: string;
}

interface AliasRow {
  word: string;
  romanized: string;
  frequencyBoost: number;
  domain: string;
  source: string;
}

type BenchmarkSeverity = "P0" | "P1" | "P2";

interface CompetitorOutputs {
  googleInputTools: string;
  microsoftIndic: string;
  keyman: string;
  ashesh: string;
  easyNepaliTyping: string;
  unicodeNepali: string;
  nepalibhashaConverter: string;
  notes: string;
}

interface RomanizedBenchmark {
  id: string;
  type: "manual" | "held-out" | "competitor" | "user-submitted";
  category: string;
  input: string;
  expected: string;
  expected_top1?: string;
  acceptable_candidates?: string[];
  difficulty?: "easy" | "medium" | "hard" | "hostile";
  source: string;
  severity?: BenchmarkSeverity;
  probeSet?: string;
  competitorOutputs?: CompetitorOutputs;
  lekhOutput?: string;
  winner?: string;
  failureCategory?: string;
  notes?: string;
}

interface PreetiBenchmark {
  id: string;
  type: "manual" | "held-out" | "competitor" | "user-submitted";
  category: string;
  input: string;
  expected: string;
  source: string;
  severity?: BenchmarkSeverity;
  probeSet?: string;
  competitorOutputs?: CompetitorOutputs;
  lekhOutput?: string;
  winner?: string;
  failureCategory?: string;
  notes?: string;
}

const root = process.cwd();
const wordRows = parseWordRows(readFileSync(join(root, "src/data/wordlists/ne-seed.tsv"), "utf8"));
const phraseRows = parsePhraseRows(readFileSync(join(root, "src/data/phrases/romanized-phrases.tsv"), "utf8"));
const aliasRows = parseAliasRows(readFileSync(join(root, "src/data/aliases/romanized-aliases.tsv"), "utf8"));
const preservedRomanized = new Set(["nid", "pdf", "excel", "word", "file", "folder", "form", "field", "desk", "result", "mismatch", "report", "office", "system", "record", "data", "print", "save", "format", "table", "sheet", "document", "doc", "docx", "id", "number", "phone", "mobile", "passport", "date", "email", "url", "copy", "link", "upload", "row", "draft", "final", "slow", "branch", "campus", "card", "meeting", "update", "check", "voucher", "bank", "address", "old", "online", "payment", "budget", "screenshot", "clear", "browser", "cache", "school", "parent", "match", "ward", "library", "barcode", "class", "group", "case", "entry", "urgent", "submit", "verify", "name", "sms"]);

mkdirSync(join(root, "benchmarks/preeti"), { recursive: true });
mkdirSync(join(root, "benchmarks/preeti/competitor"), { recursive: true });
mkdirSync(join(root, "benchmarks/romanized"), { recursive: true });
mkdirSync(join(root, "benchmarks/romanized/competitor"), { recursive: true });

writeJson(join(root, "benchmarks/romanized/manual-high-value.json"), buildRomanizedManualCases());
writeJson(join(root, "benchmarks/romanized/held-out.json"), buildRomanizedHeldOutCases());
writeJson(join(root, "benchmarks/romanized/hostile-manual-v1.json"), buildRomanizedHostileCases());
writeJson(join(root, "benchmarks/romanized/competitor-probes.json"), preserveCompetitorOutputs(join(root, "benchmarks/romanized/competitor-probes.json"), buildRomanizedCompetitorProbes()));
writeJson(join(root, "benchmarks/romanized/competitor/romanized_competitor_probe_v1.json"), preserveCompetitorOutputs(join(root, "benchmarks/romanized/competitor/romanized_competitor_probe_v1.json"), buildRomanizedCompetitorProbes()));
writeJson(join(root, "benchmarks/romanized/user-submitted.json"), []);
writeJson(join(root, "benchmarks/preeti/manual-hard.json"), buildPreetiManualCases());
writeJson(join(root, "benchmarks/preeti/held-out-paragraphs.json"), buildPreetiHeldOutParagraphs());
writeJson(join(root, "benchmarks/preeti/competitor-probes.json"), preserveCompetitorOutputs(join(root, "benchmarks/preeti/competitor-probes.json"), buildPreetiCompetitorProbes()));
writeJson(join(root, "benchmarks/preeti/competitor/preeti_competitor_probe_v1.json"), preserveCompetitorOutputs(join(root, "benchmarks/preeti/competitor/preeti_competitor_probe_v1.json"), buildPreetiCompetitorProbes()));
writeJson(join(root, "benchmarks/preeti/user-submitted.json"), []);

console.log("Wrote benchmark fixtures");

function buildRomanizedManualCases(): RomanizedBenchmark[] {
  const cases: RomanizedBenchmark[] = [];
  for (const phrase of phraseRows) {
    cases.push({
      id: `romanized-phrase-${cases.length + 1}`,
      type: "manual",
      category: `phrase:${phrase.domain}`,
      input: phrase.input,
      expected: phrase.output,
      source: phrase.source
    });
  }

  for (const alias of aliasRows.filter((row) => !isAmbiguousAlias(row))) {
    cases.push({
      id: `romanized-alias-${cases.length + 1}`,
      type: "manual",
      category: `alias:${alias.domain}`,
      input: alias.romanized,
      expected: alias.word,
      source: alias.source
    });
  }

  const highValueRows = wordRows
    .filter((row) => !row.source.includes("derived") && !/^(file|form|report|office|system|data)$/i.test(row.romanized))
    .filter((row) => !preservedRomanized.has(row.romanized.toLowerCase()))
    .sort((a, b) => b.frequency - a.frequency);
  const templates = [
    (row: WordRow) => ({ category: `word:${row.domain}`, input: row.romanized, expected: row.word }),
    (row: WordRow) => ({ category: `postposition:${row.domain}`, input: `${row.romanized} ko`, expected: `${row.word} को` }),
    (row: WordRow) => ({ category: `postposition:${row.domain}`, input: `${row.romanized} ma`, expected: `${row.word} मा` }),
    (row: WordRow) => ({ category: `phrase:${row.domain}`, input: `${row.romanized} ra sewa`, expected: `${row.word} र सेवा` }),
    (row: WordRow) => ({ category: `phrase:${row.domain}`, input: `${row.romanized} ko file`, expected: `${row.word} को file` }),
    (row: WordRow) => ({ category: `mixed:${row.domain}`, input: `${row.romanized} report`, expected: `${row.word} report` }),
    (row: WordRow) => ({ category: `mixed:${row.domain}`, input: `PDF ${row.romanized}`, expected: `PDF ${row.word}` })
  ];

  for (const row of highValueRows) {
    for (const makeCase of templates) {
      const item = makeCase(row);
      cases.push({
        id: `romanized-manual-${cases.length + 1}`,
        type: "manual",
        category: item.category,
        input: item.input,
        expected: item.expected,
        source: row.source
      });
    }
  }

  return dedupeRomanized(cases).slice(0, 500);
}

function buildRomanizedCompetitorProbes(): RomanizedBenchmark[] {
  const rows: Array<[string, string, string, BenchmarkSeverity]> = [
    ["phrase:government", "jilla prashasan karyalaya", "जिल्ला प्रशासन कार्यालय", "P0"],
    ["phrase:office", "janma miti", "जन्म मिति", "P0"],
    ["name", "lakshmi", "लक्ष्मी", "P0"],
    ["name", "laxmi", "लक्ष्मी", "P0"],
    ["mixed", "NID form ko naam field", "NID form को नाम field", "P0"],
    ["mixed", "X-ray report", "X-ray report", "P0"],
    ["phrase:government", "rastriya parichayapatra", "राष्ट्रिय परिचयपत्र", "P0"],
    ["phrase:education", "shiksha mantralaya", "शिक्षा मन्त्रालय", "P0"],
    ["phrase:government", "warda sifaris patra", "वडा सिफारिस पत्र", "P1"],
    ["phrase:government", "nibedan darta number", "निवेदन दर्ता number", "P1"],
    ["phrase:government", "kar karyalaya ma file", "कर कार्यालय मा file", "P1"],
    ["phrase:government", "rajaswa dakhila report", "राजस्व दाखिला report", "P1"],
    ["phrase:office", "hajiri pustika", "हाजिरी पुस्तिका", "P1"],
    ["phrase:office", "karmachari bibaran", "कर्मचारी विवरण", "P1"],
    ["phrase:office", "suchana patra", "सूचना पत्र", "P1"],
    ["phrase:office", "baithak nirnaya", "बैठक निर्णय", "P1"],
    ["phrase:legal", "jilla adalat ko aadesh", "जिल्ला अदालत को आदेश", "P1"],
    ["phrase:legal", "kanuni salah", "कानुनी सल्लाह", "P1"],
    ["phrase:legal", "likhit jawaf", "लिखित जवाफ", "P1"],
    ["phrase:legal", "muddha darta", "मुद्दा दर्ता", "P1"],
    ["phrase:education", "vidyarthi parichayapatra", "विद्यार्थी परिचयपत्र", "P1"],
    ["phrase:education", "pariksha talika", "परीक्षा तालिका", "P1"],
    ["phrase:education", "shikshak hajiri", "शिक्षक हाजिरी", "P1"],
    ["phrase:education", "bidyalaya byabasthapan samiti", "विद्यालय व्यवस्थापन समिति", "P1"],
    ["name", "niraj bhusal", "निरज भुसाल", "P1"],
    ["name", "neeraj bhusal", "नीरज भुसाल", "P1"],
    ["name", "prabin ghimire", "प्रबिन घिमिरे", "P1"],
    ["name", "sumana shrestha", "सुमना श्रेष्ठ", "P1"],
    ["name", "sushma karki", "सुष्मा कार्की", "P1"],
    ["name", "ramesh adhikari", "रमेश अधिकारी", "P1"],
    ["place", "lalitpur mahanagarpalika", "ललितपुर महानगरपालिका", "P1"],
    ["place", "kathmandu jilla", "काठमाडौं जिल्ला", "P1"],
    ["place", "pokhara lekhnath", "पोखरा लेखनाथ", "P1"],
    ["place", "bhaktapur nagarpalika", "भक्तपुर नगरपालिका", "P1"],
    ["mixed", "PDF file ma hastakshar", "PDF file मा हस्ताक्षर", "P0"],
    ["mixed", "Excel sheet ko bibaran", "Excel sheet को विवरण", "P0"],
    ["mixed", "email address sachyaunu", "email address सच्याउनु", "P0"],
    ["mixed", "URL field khali cha", "URL field खाली छ", "P0"],
    ["mixed", "NID 123456 ko record", "NID 123456 को record", "P0"],
    ["mixed", "Form No 7 bharne", "Form No 7 भर्ने", "P0"],
    ["punctuation", "yo thik cha.", "यो ठीक छ.", "P1"],
    ["punctuation", "nibedan swikrit bhayo?", "निवेदन स्वीकृत भयो?", "P1"],
    ["punctuation", "naam, thar ra thau", "नाम, थर र ठाउ", "P1"],
    ["punctuation", "kripaya file hernus", "कृपया file हेर्नुस", "P1"],
    ["misspelling", "prasasan karyalaya", "प्रशासन कार्यालय", "P1"],
    ["misspelling", "parichay patra", "परिचय पत्र", "P1"],
    ["misspelling", "janma mithi", "जन्म मिति", "P1"],
    ["misspelling", "siksha mantralaya", "शिक्षा मन्त्रालय", "P1"],
    ["misspelling", "rastriya parichaya patra", "राष्ट्रिय परिचय पत्र", "P1"],
    ["misspelling", "sifaris patra", "सिफारिस पत्र", "P1"],
    ["oov-like", "pharakpath garna", "फरकपथ गर्न", "P2"],
    ["oov-like", "sanchalanmukhi sewa", "सञ्चालनमुखी सेवा", "P2"],
    ["oov-like", "fileghar byabastha", "fileघर व्यवस्था", "P2"],
    ["oov-like", "talimmukhi karyakram", "तालिममुखी कार्यक्रम", "P2"],
    ["oov-like", "suchanapath suchi", "सूचनापथ सूची", "P2"],
    ["oov-like", "rojgarmukhi yojana", "रोजगारमुखी योजना", "P2"],
    ["phrase:admin", "sewa prabah sudhar", "सेवा प्रवाह सुधार", "P1"],
    ["phrase:admin", "gunaso sunuwai", "गुनासो सुनुवाइ", "P1"],
    ["phrase:admin", "nagrik sahayata kaksha", "नागरिक सहायता कक्ष", "P1"],
    ["phrase:admin", "pratibedan pes garnu", "प्रतिवेदन पेश गर्नु", "P1"],
    ["phrase:admin", "suchana adhikari", "सूचना अधिकारी", "P1"],
    ["phrase:admin", "karyakram samyojak", "कार्यक्रम संयोजक", "P1"],
    ["phrase:office", "darta chalani kitab", "दर्ता चलानी किताब", "P1"],
    ["phrase:office", "phone number milena", "phone number मिलेन", "P0"],
    ["phrase:office", "mobile number rakhnus", "mobile number राख्नुस", "P0"],
    ["phrase:office", "office copy pathaunu", "office copy पठाउनु", "P0"],
    ["phrase:legal", "wakil ko pratinidhi", "वकिल को प्रतिनिधि", "P1"],
    ["phrase:legal", "sarbajanik mudda", "सार्वजनिक मुद्दा", "P1"],
    ["phrase:legal", "adhikar patra", "अधिकार पत्र", "P1"],
    ["phrase:legal", "sambidhan anusar", "संविधान अनुसार", "P1"],
    ["phrase:education", "pathyakram bikas kendra", "पाठ्यक्रम विकास केन्द्र", "P1"],
    ["phrase:education", "shulka rasid", "शुल्क रसिद", "P1"],
    ["phrase:education", "abhibhabak bhela", "अभिभावक भेला", "P1"],
    ["phrase:education", "kaksha das ko result", "कक्षा दस को result", "P0"],
    ["phrase:finance", "bank voucher number", "bank voucher number", "P0"],
    ["phrase:finance", "bhuktani sifaris", "भुक्तानी सिफारिस", "P1"],
    ["phrase:finance", "kharcha bibaran", "खर्च विवरण", "P1"],
    ["phrase:finance", "bajet nikasa", "बजेट निकासा", "P1"],
    ["name", "sita rai", "सीता राई", "P1"],
    ["name", "gita thapa", "गीता थापा", "P1"],
    ["name", "maya gurung", "माया गुरुङ", "P1"],
    ["name", "ashim basnet", "आशिम बस्नेत", "P1"],
    ["name", "rohan basnet", "रोहन बस्नेत", "P1"],
    ["name", "sagar poudel", "सागर पौडेल", "P1"],
    ["place", "chitwan bharatpur", "चितवन भरतपुर", "P1"],
    ["place", "biratnagar office", "विराटनगर office", "P0"],
    ["place", "janakpur dham", "जनकपुर धाम", "P1"],
    ["place", "butwal upamahanagarpalika", "बुटवल उपमहानगरपालिका", "P1"],
    ["spacing", "jilla   prashasan", "जिल्ला प्रशासन", "P1"],
    ["spacing", "nagarikta-pramanpatra", "नागरिकता-प्रमाणपत्र", "P1"],
    ["spacing", "naam/thar", "नाम/थर", "P1"],
    ["spacing", "suchana\nadhikari", "सूचना\nअधिकारी", "P1"],
    ["mixed", "record ID milena", "record ID मिलेन", "P0"],
    ["mixed", "data entry sakiyo", "data entry सकियो", "P0"],
    ["mixed", "print garera dinus", "print गरेर दिनुस", "P0"],
    ["mixed", "save gareko file", "save गरेको file", "P0"],
    ["phrase:admin", "janma darta pramanpatra", "जन्म दर्ता प्रमाणपत्र", "P1"],
    ["phrase:admin", "basai sarai kagaj", "बसाइ सराइ कागज", "P1"],
    ["phrase:legal", "pratinidhi patra", "प्रतिनिधि पत्र", "P1"],
    ["mixed", "office system slow cha", "office system slow छ", "P0"]
  ];

  return rows.map(([category, input, expected, severity], index) => ({
    id: `romanized-competitor-${index + 1}`,
    type: "competitor",
    category,
    input,
    expected,
    expected_top1: expected,
    acceptable_candidates: [expected],
    difficulty: severity === "P0" ? "hostile" : severity === "P1" ? "hard" : "medium",
    source: "manual-black-box-probe",
    severity,
    probeSet: "competitor-probe-001",
    competitorOutputs: emptyCompetitorOutputs(),
    lekhOutput: "",
    winner: "",
    failureCategory: "",
    notes: ""
  }));
}

function buildRomanizedHeldOutCases(): RomanizedBenchmark[] {
  const rows: Array<[string, string, string, BenchmarkSeverity]> = [
    ["heldout:admin", "jilla prashasan bata sifaris", "जिल्ला प्रशासन बाट सिफारिस", "P1"],
    ["heldout:admin", "warda bata patra aayo", "वडा बाट पत्र आयो", "P1"],
    ["heldout:admin", "kar chukta pramanpatra", "कर चुक्ता प्रमाणपत्र", "P1"],
    ["heldout:admin", "darta rasid harayo", "दर्ता रसिद हरायो", "P1"],
    ["heldout:admin", "gunaso darta garne", "गुनासो दर्ता गर्ने", "P1"],
    ["heldout:admin", "sahayata kaksha ma pathaunu", "सहायता कक्ष मा पठाउनु", "P1"],
    ["heldout:admin", "niyam anusaar karbahi", "नियम अनुसार कारबाही", "P1"],
    ["heldout:admin", "sarbajanik suchana prakashan", "सार्वजनिक सूचना प्रकाशन", "P1"],
    ["heldout:admin", "bibhag ko aadesh", "विभाग को आदेश", "P1"],
    ["heldout:admin", "karyalaya pramukh upasthit", "कार्यालय प्रमुख उपस्थित", "P1"],
    ["heldout:office", "aaja ko hajiri hernus", "आज को हाजिरी हेर्नुस", "P1"],
    ["heldout:office", "chalani number milena", "चलानी number मिलेन", "P0"],
    ["heldout:office", "file pathaeko chaina", "file पठाएको छैन", "P0"],
    ["heldout:office", "meeting ko nirnaya lekhnus", "meeting को निर्णय लेख्नुस", "P0"],
    ["heldout:office", "record update garnus", "record update गर्नुस", "P0"],
    ["heldout:office", "phone garera sodhnus", "phone गरेर सोध्नुस", "P0"],
    ["heldout:office", "prastab final bhayo", "प्रस्ताव final भयो", "P0"],
    ["heldout:office", "patra ko draft hernus", "पत्र को draft हेर्नुस", "P0"],
    ["heldout:office", "suchi print bhayo", "सूची print भयो", "P0"],
    ["heldout:office", "dayari ma tipnu", "दायरी मा टिप्नु", "P1"],
    ["heldout:legal", "muddha ko faisala aayo", "मुद्दा को फैसला आयो", "P1"],
    ["heldout:legal", "wakil sanga samparka", "वकिल सँग सम्पर्क", "P1"],
    ["heldout:legal", "kanuni prakriya suru", "कानुनी प्रक्रिया सुरु", "P1"],
    ["heldout:legal", "adhikar ko raksha", "अधिकार को रक्षा", "P1"],
    ["heldout:legal", "likhit ujuri dinu", "लिखित उजुरी दिनु", "P1"],
    ["heldout:legal", "sarbajanik sunuwai", "सार्वजनिक सुनुवाइ", "P1"],
    ["heldout:legal", "praman sangai pathaunu", "प्रमाण सँगै पठाउनु", "P1"],
    ["heldout:legal", "niyamawali hernus", "नियमावली हेर्नुस", "P1"],
    ["heldout:legal", "sahamati patra banayo", "सहमति पत्र बनायो", "P1"],
    ["heldout:legal", "aadesh palana garne", "आदेश पालना गर्ने", "P1"],
    ["heldout:education", "pariksha form bharne", "परीक्षा form भर्ने", "P0"],
    ["heldout:education", "vidyarthi ko naam sachyaune", "विद्यार्थी को नाम सच्याउने", "P1"],
    ["heldout:education", "shikshak ko hajiri", "शिक्षक को हाजिरी", "P1"],
    ["heldout:education", "result publish bhayo", "result publish भयो", "P0"],
    ["heldout:education", "kaksha nau ko talika", "कक्षा नौ को तालिका", "P1"],
    ["heldout:education", "pradhyapak sanga bhela", "प्राध्यापक सँग भेला", "P1"],
    ["heldout:education", "pustakalaya band cha", "पुस्तकालय बन्द छ", "P1"],
    ["heldout:education", "shulka tirna baki", "शुल्क तिर्न बाँकी", "P1"],
    ["heldout:education", "pathyakram paribartan", "पाठ्यक्रम परिवर्तन", "P1"],
    ["heldout:education", "abhibhabak ko hastakshar", "अभिभावक को हस्ताक्षर", "P1"],
    ["heldout:name", "laxman khadka", "लक्ष्मण खड्का", "P1"],
    ["heldout:name", "laxmi bhandari", "लक्ष्मी भण्डारी", "P1"],
    ["heldout:name", "niraula sir", "निरौला सर", "P1"],
    ["heldout:name", "nirajan poudel", "निराजन पौडेल", "P1"],
    ["heldout:name", "srijana lama", "सृजना लामा", "P1"],
    ["heldout:name", "pratiksha shahi", "प्रतीक्षा शाही", "P1"],
    ["heldout:name", "bishnu maya", "विष्णु माया", "P1"],
    ["heldout:name", "gopal acharya", "गोपाल आचार्य", "P1"],
    ["heldout:name", "deepak kc", "दीपक KC", "P0"],
    ["heldout:name", "anita maharjan", "अनिता महर्जन", "P1"],
    ["heldout:place", "dhankuta bazar", "धनकुटा बजार", "P1"],
    ["heldout:place", "hetauda office", "हेटौडा office", "P0"],
    ["heldout:place", "dhangadhi upamahanagar", "धनगढी उपमहानगर", "P1"],
    ["heldout:place", "nepalgunj warda", "नेपालगन्ज वडा", "P1"],
    ["heldout:place", "ilam nagarpalika", "इलाम नगरपालिका", "P1"],
    ["heldout:place", "baneshwor branch", "बानेश्वर branch", "P0"],
    ["heldout:place", "kirtipur campus", "कीर्तिपुर campus", "P0"],
    ["heldout:place", "sindhupalchok jilla", "सिन्धुपाल्चोक जिल्ला", "P1"],
    ["heldout:place", "gorkha palika", "गोरखा पालिका", "P1"],
    ["heldout:place", "nuwakot sewa kendra", "नुवाकोट सेवा केन्द्र", "P1"],
    ["heldout:mixed", "NID ko photo update", "NID को photo update", "P0"],
    ["heldout:mixed", "PDF upload garna mildaina", "PDF upload गर्न मिल्दैन", "P0"],
    ["heldout:mixed", "Excel row ma galti", "Excel row मा गल्ती", "P0"],
    ["heldout:mixed", "email bata patra pathaunu", "email बाट पत्र पठाउनु", "P0"],
    ["heldout:mixed", "X-ray ko report liyera aaunu", "X-ray को report लिएर आउनु", "P0"],
    ["heldout:mixed", "passport number check garnu", "passport number check गर्नु", "P0"],
    ["heldout:mixed", "URL link khulena", "URL link खुलेन", "P0"],
    ["heldout:mixed", "data entry ma naam chutyo", "data entry मा नाम छुट्यो", "P0"],
    ["heldout:mixed", "ID card print garne", "ID card print गर्ने", "P0"],
    ["heldout:mixed", "mobile number update", "mobile number update", "P0"],
    ["heldout:misspelling", "prasashan karyalaya ma", "प्रशासन कार्यालय मा", "P1"],
    ["heldout:misspelling", "parichaya patra ko copy", "परिचय पत्र को copy", "P0"],
    ["heldout:misspelling", "janma miti sachyaune", "जन्म मिति सच्याउने", "P1"],
    ["heldout:misspelling", "sikshya ko kagaj", "शिक्षा को कागज", "P1"],
    ["heldout:misspelling", "bhuktani sipharis", "भुक्तानी सिफारिस", "P1"],
    ["heldout:misspelling", "nagrikta pramanpatra", "नागरिकता प्रमाणपत्र", "P1"],
    ["heldout:misspelling", "hastachar chaina", "हस्ताक्षर छैन", "P1"],
    ["heldout:misspelling", "gunasho sunuwai", "गुनासो सुनुवाइ", "P1"],
    ["heldout:misspelling", "rajashwa dakhila", "राजस्व दाखिला", "P1"],
    ["heldout:misspelling", "pratibedan pes", "प्रतिवेदन पेश", "P1"],
    ["heldout:oov", "karyapath milan", "कार्यपथ मिलान", "P2"],
    ["heldout:oov", "suchanalekha banau", "सूचनालेखा बनाउ", "P2"],
    ["heldout:oov", "sewamukhi prayog", "सेवामुखी प्रयोग", "P2"],
    ["heldout:oov", "kagajghar sanchalan", "कागजघर सञ्चालन", "P2"],
    ["heldout:oov", "pratilekhan kaksha", "प्रतिलेखन कक्ष", "P2"],
    ["heldout:oov", "dastabajikaran garne", "दस्ताबजीकरण गर्ने", "P2"],
    ["heldout:oov", "nirdeshpatra hernus", "निर्देशपत्र हेर्नुस", "P2"],
    ["heldout:oov", "sahayogdesk kholnus", "सहयोगdesk खोल्नुस", "P0"],
    ["heldout:oov", "upalabdhimukhi yojana", "उपलब्धिमुखी योजना", "P2"],
    ["heldout:oov", "suchanaghar ma file", "सूचनाघर मा file", "P0"],
    ["heldout:spacing", "naam  thar   thik cha", "नाम थर ठीक छ", "P1"],
    ["heldout:spacing", "nibedan\nswikrit bhayo", "निवेदन\nस्वीकृत भयो", "P1"],
    ["heldout:spacing", "kagaj/rasid", "कागज/रसिद", "P1"],
    ["heldout:spacing", "form-7 ko bibaran", "form-7 को विवरण", "P0"],
    ["heldout:spacing", "miti: 2081-01-12", "मिति: 2081-01-12", "P0"],
    ["heldout:spacing", "file, record ra data", "file, record र data", "P0"],
    ["heldout:spacing", "yo thik cha.", "यो ठीक छ.", "P1"],
    ["heldout:spacing", "ke garnu parcha?", "के गर्नु पर्छ?", "P1"],
    ["heldout:spacing", "kripaya heri dinus", "कृपया हेरी दिनुस", "P1"],
    ["heldout:spacing", "dhanyabad.", "धन्यवाद.", "P1"]
  ];

  return rows.map(([category, input, expected, severity], index) => ({
    id: `romanized-held-out-${index + 1}`,
    type: "held-out",
    category,
    input,
    expected,
    source: "manual-held-out-romanized-001",
    severity
  }));
}

function buildRomanizedHostileCases(): RomanizedBenchmark[] {
  const cases: RomanizedBenchmark[] = [];
  const source = "manual-hostile-v2";

  for (const row of buildTrulyHostileRomanizedRows()) {
    cases.push({
      id: "romanized-hostile-pending",
      type: "held-out",
      category: row.category,
      input: row.input,
      expected: row.expected,
      expected_top1: row.expected,
      acceptable_candidates: row.acceptableCandidates ?? [row.expected],
      difficulty: row.difficulty,
      source,
      severity: row.severity
    });
  }

  for (const row of buildGeneratedOovCompoundRows()) {
    cases.push({
      id: "romanized-hostile-pending",
      type: "held-out",
      category: row.category,
      input: row.input,
      expected: row.expected,
      expected_top1: row.expected,
      acceptable_candidates: [row.expected],
      difficulty: "hostile",
      source,
      severity: "P1"
    });
  }

  const rows = wordRows
    .filter((row) => !row.source.includes("derived"))
    .filter((row) => !preservedRomanized.has(row.romanized.toLowerCase()))
    .filter((row) => /^[A-Za-z]+$/.test(row.romanized))
    .sort((a, b) => b.frequency - a.frequency || a.romanized.localeCompare(b.romanized));

  const templates = [
    (row: WordRow) => makeHostile(row, `hostile:word:${row.domain}`, row.romanized, row.word, "easy"),
    (row: WordRow) => makeHostile(row, `hostile:postposition:${row.domain}`, `${row.romanized} ko`, `${row.word} को`, "medium"),
    (row: WordRow) => makeHostile(row, `hostile:postposition:${row.domain}`, `${row.romanized} ma`, `${row.word} मा`, "medium"),
    (row: WordRow) => makeHostile(row, `hostile:postposition:${row.domain}`, `${row.romanized} bata`, `${row.word} बाट`, "medium"),
    (row: WordRow) => makeHostile(row, `hostile:sentence:${row.domain}`, `${row.romanized} thik cha.`, `${row.word} ठीक छ.`, "hard")
  ];

  for (const row of rows) {
    for (const template of templates) {
      cases.push(template(row));
      if (cases.length >= 1000) return dedupeHostile(cases, source).slice(0, 1000);
    }
  }

  return dedupeHostile(cases, source).slice(0, 1000);
}

function buildTrulyHostileRomanizedRows(): Array<{
  category: string;
  input: string;
  expected: string;
  difficulty: RomanizedBenchmark["difficulty"];
  severity: BenchmarkSeverity;
  acceptableCandidates?: string[];
}> {
  return [
    ["hostile:oov-compound", "suchanapath ko file update garnu parcha", "सूचनापथ को file update गर्नु पर्छ", "hostile", "P1"],
    ["hostile:oov-compound", "kagajghar ma NID form ko record harayo", "कागजघर मा NID form को record हरायो", "hostile", "P1"],
    ["hostile:oov-compound", "sewamukhi desk bata PDF report pathaunu", "सेवामुखी desk बाट PDF report पठाउनु", "hostile", "P1"],
    ["hostile:oov-compound", "dastabajikaran kendra ko final draft hernus", "दस्ताबजीकरण केन्द्र को final draft हेर्नुस", "hostile", "P1"],
    ["hostile:oov-compound", "pratilekhan kaksha ma old file scan garnu", "प्रतिलेखन कक्ष मा old file scan गर्नु", "hostile", "P1"],
    ["hostile:oov-compound", "sahayogdesk ko email address milena", "सहयोगdesk को email address मिलेन", "hostile", "P0"],
    ["hostile:oov-compound", "upalabdhimukhi yojana ko budget sheet check garnu", "उपलब्धिमुखी योजना को budget sheet check गर्नु", "hostile", "P0"],
    ["hostile:oov-compound", "rojgarmukhi talimko online form bharna garo cha", "रोजगारमुखी तालिमको online form भर्न गाह्रो छ", "hostile", "P1"],
    ["hostile:name-variant", "qiran shresthaa ko NID form ma name mismatch cha", "किरण श्रेष्ठ को NID form मा name mismatch छ", "hostile", "P0"],
    ["hostile:name-variant", "niraazz bhushall le office copy magyo", "निराज भुसाल ले office copy माग्यो", "hostile", "P1"],
    ["hostile:name-variant", "laxmii bhandarii ko X-ray report upload bhayena", "लक्ष्मी भण्डारी को X-ray report upload भएन", "hostile", "P0"],
    ["hostile:name-variant", "srijnaa lama lai phone number update garnu cha", "सृजना लामा लाई phone number update गर्नु छ", "hostile", "P0"],
    ["hostile:name-variant", "rohaan basneet ko bank voucher number milena", "रोहन बस्नेत को bank voucher number मिलेन", "hostile", "P0"],
    ["hostile:name-variant", "geetaa thaapaa ko janma miti feri hernus", "गीता थापा को जन्म मिति फेरि हेर्नुस", "hostile", "P1"],
    ["hostile:mixed-sentence", "NID form ko date Excel sheet sanga match hudaina", "NID form को date Excel sheet सँग match हुँदैन", "hostile", "P0"],
    ["hostile:mixed-sentence", "PDF file ma ward number ra phone number dubai chaina", "PDF file मा ward number र phone number दुवै छैन", "hostile", "P0"],
    ["hostile:mixed-sentence", "record ID milena bhane office ma report pathaunu", "record ID मिलेन भने office मा report पठाउनु", "hostile", "P0"],
    ["hostile:mixed-sentence", "online payment voucher ko screenshot clear chaina", "online payment voucher को screenshot clear छैन", "hostile", "P0"],
    ["hostile:mixed-sentence", "URL link khulena bhane browser cache clear garnu", "URL link खुलेन भने browser cache clear गर्नु", "hostile", "P0"],
    ["hostile:mixed-sentence", "school result publish bhayepachi parent lai SMS pathaunu", "school result publish भएपछि parent लाई SMS पठाउनु", "hostile", "P0"],
    ["hostile:unlisted-admin", "samyojanpatra bina darta shakha le file lidaina", "समायोजनपत्र बिना दर्ता शाखा ले file लिँदैन", "hostile", "P1"],
    ["hostile:unlisted-admin", "dastur rasidko QR code scan bhayena", "दस्तुर रसिदको QR code scan भएन", "hostile", "P0"],
    ["hostile:unlisted-admin", "suchana suchikaranko draft ma hastakshar chaina", "सूचना सूचीकरणको draft मा हस्ताक्षर छैन", "hostile", "P1"],
    ["hostile:unlisted-legal", "pratinidhitwapatra bina wakil ko entry rokyo", "प्रतिनिधित्वपत्र बिना वकिल को entry रोक्यो", "hostile", "P1"],
    ["hostile:unlisted-legal", "muddasuchi ma purano case number dekhiyo", "मुद्दासूची मा पुरानो case number देखियो", "hostile", "P0"],
    ["hostile:unlisted-education", "library card ko barcode scan garna mildaina", "library card को barcode scan गर्न मिल्दैन", "hostile", "P0"],
    ["hostile:unlisted-education", "pathyasamagri ko PDF link class group ma pathaunu", "पाठ्यसामग्री को PDF link class group मा पठाउनु", "hostile", "P0"],
    ["hostile:punctuation", "yo file--urgent ho; aaja nai submit garnu!", "यो file--urgent हो; आज नै submit गर्नु!", "hostile", "P0"],
    ["hostile:punctuation", "naam/thar/address field sabai verify garnu parcha?", "नाम/थर/address field सबै verify गर्नु पर्छ?", "hostile", "P0"],
    ["hostile:spacing", "jilla   prashasan    karyalaya ko   old record", "जिल्ला प्रशासन कार्यालय को old record", "hostile", "P0"]
  ].map(([category, input, expected, difficulty, severity]) => ({
    category,
    input,
    expected,
    difficulty: difficulty as RomanizedBenchmark["difficulty"],
    severity: severity as BenchmarkSeverity
  }));
}

function buildGeneratedOovCompoundRows() {
  const roots = [
    ["suchana", "सूचना"], ["sewa", "सेवा"], ["kagaj", "कागज"], ["darta", "दर्ता"], ["yojana", "योजना"],
    ["praman", "प्रमाण"], ["sahayog", "सहयोग"], ["rojgar", "रोजगार"], ["lekha", "लेखा"], ["shiksha", "शिक्षा"]
  ];
  const tails = [
    ["path", "पथ"], ["ghar", "घर"], ["desk", "desk"], ["mukhi", "मुखी"], ["patra", "पत्र"],
    ["lekhan", "लेखन"], ["suchi", "सूची"], ["kendra", "केन्द्र"], ["pranali", "प्रणाली"], ["sala", "शाला"]
  ];
  const frames = [
    (input: string, output: string) => [`${input} ko file update garnu`, `${output} को file update गर्नु`],
    (input: string, output: string) => [`${input} ma PDF report pathaunu`, `${output} मा PDF report पठाउनु`],
    (input: string, output: string) => [`${input} bata record ID check garnu`, `${output} बाट record ID check गर्नु`]
  ];

  const rows: Array<{ category: string; input: string; expected: string }> = [];
  for (const [rootInput, rootOutput] of roots) {
    for (const [tailInput, tailOutput] of tails) {
      for (const frame of frames) {
        const [input, expected] = frame(`${rootInput}${tailInput}`, `${rootOutput}${tailOutput}`);
        rows.push({ category: "hostile:generated-oov-compound", input, expected });
      }
    }
  }
  return rows;
}

function makeHostile(
  row: WordRow,
  category: string,
  input: string,
  expected: string,
  difficulty: RomanizedBenchmark["difficulty"]
): RomanizedBenchmark {
  return {
    id: "romanized-hostile-pending",
    type: "held-out",
    category,
    input,
    expected,
    expected_top1: expected,
    acceptable_candidates: [expected],
    difficulty,
    source: `manual-hostile-domain-matrix-v1:${row.source}`,
    severity: difficulty === "hostile" ? "P1" : "P2"
  };
}

function dedupeHostile(cases: RomanizedBenchmark[], source: string): RomanizedBenchmark[] {
  const seen = new Set<string>();
  const deduped: RomanizedBenchmark[] = [];
  for (const item of cases) {
    const key = item.input.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push({ ...item, id: `romanized-hostile-${deduped.length + 1}`, source });
  }
  return deduped;
}

function buildPreetiManualCases(): PreetiBenchmark[] {
  const expectedTexts = [
    ...phraseRows.map((row) => row.output),
    ...wordRows.filter((row) => !row.source.includes("derived")).slice(0, 90).map((row) => row.word),
    "कार्यालयमा सूचना दर्ता भयो।",
    "जिल्ला प्रशासन कार्यालय",
    "राष्ट्रिय परिचयपत्र",
    "शिक्षा मन्त्रालय",
    "NID form रिपोर्ट 123",
    "PDF file मा नाम",
    "X-ray report"
  ];

  return Array.from(new Set(expectedTexts.map((text) => normalizeNepaliText(text))))
    .slice(0, 120)
    .map((expected, index) => ({
      id: `preeti-manual-${index + 1}`,
      type: "manual",
      category: classifyPreeti(expected),
      input: toPreetiInput(expected),
      expected,
      source: "manual-hard-clean-room"
    }));
}

function buildPreetiCompetitorProbes(): PreetiBenchmark[] {
  const rows: Array<[string, string, BenchmarkSeverity]> = [
    ["reph", "निर्णय", "P0"],
    ["reph", "कर्मचारी", "P0"],
    ["conjunct", "क्षेत्र", "P0"],
    ["reph", "प्रार्थना", "P0"],
    ["paragraph:admin", "कार्यालयमा सूचना दर्ता भयो।", "P0"],
    ["mixed-english", "NID form रिपोर्ट 123", "P0"],
    ["mixed-english", "X-ray report", "P0"],
    ["matra", "जन्म मिति", "P0"],
    ["conjunct", "नागरिकता प्रमाणपत्र", "P0"],
    ["reph", "जिल्ला प्रशासन कार्यालय", "P0"],
    ["reph", "राष्ट्रिय परिचयपत्र", "P0"],
    ["matra", "शिक्षा मन्त्रालय", "P0"],
    ["reph", "कार्यालय को कर्मचारी", "P1"],
    ["matra", "प्रमाणपत्र वितरण", "P1"],
    ["reph", "निर्णय र प्रस्ताव", "P1"],
    ["matra", "जिल्ला अदालत", "P1"],
    ["matra", "नागरिकता सिफारिस", "P1"],
    ["conjunct", "लिखित जवाफ", "P1"],
    ["conjunct", "हस्ताक्षर आवश्यक छ।", "P1"],
    ["matra", "विद्यार्थी परिचयपत्र", "P1"],
    ["reph", "कार्यालय प्रमुख उपस्थित छन्।", "P1"],
    ["mixed-english", "PDF file मा नाम", "P0"],
    ["mixed-english", "Excel sheet को विवरण", "P0"],
    ["mixed-english", "URL field खाली छ।", "P0"],
    ["mixed-english", "Form No 7 भरियो।", "P0"],
    ["paragraph:office", "दर्ता चलानी किताब अद्यावधिक भयो।", "P1"],
    ["paragraph:admin", "गुनासो सुनुवाइ कक्ष खुला छ।", "P1"],
    ["paragraph:legal", "कानुनी सल्लाह उपलब्ध छ।", "P1"],
    ["paragraph:education", "परीक्षा तालिका प्रकाशित भयो।", "P1"],
    ["paragraph:names", "लक्ष्मी बिष्टको नाम सच्याइयो।", "P1"],
    ["paragraph:names", "नीरज भुसालको file तयार भयो।", "P0"],
    ["paragraph:admin", "वडा सिफारिस पत्र जारी भयो।", "P1"],
    ["paragraph:finance", "राजस्व दाखिला रसिद आयो।", "P1"],
    ["paragraph:legal", "मुद्दा दर्ता नम्बर 123 हो।", "P0"],
    ["paragraph:office", "meeting को निर्णय लेखियो।", "P0"],
    ["paragraph:admin", "सार्वजनिक सूचना प्रकाशित भयो।", "P1"],
    ["paragraph:school", "शिक्षक हाजिरी प्रमाणित भयो।", "P1"],
    ["paragraph:admin", "सेवा प्रवाह सुधार योजना तयार भयो।", "P1"],
    ["paragraph:admin", "सूचना अधिकारी आज अनुपस्थित छन्।", "P1"],
    ["paragraph:legal", "लिखित उजुरी दर्ता भयो।", "P1"],
    ["paragraph:mixed", "NID 123456 को record मिल्यो।", "P0"],
    ["paragraph:mixed", "passport number check गर्नुहोस्।", "P0"],
    ["paragraph:mixed", "email address सच्याउनुहोस्।", "P0"],
    ["paragraph:mixed", "mobile number update भयो।", "P0"],
    ["paragraph:linebreak", "कार्यालयमा सूचना आयो।\nदर्ता नम्बर 45 हो।", "P0"],
    ["paragraph:linebreak", "विद्यालयमा बैठक बस्यो।\nनिर्णय आज भयो।", "P1"],
    ["paragraph:linebreak", "NID form बुझाइयो।\nरिपोर्ट पछि आयो।", "P0"],
    ["paragraph:linebreak", "PDF file राखियो।\nनाम मिलेन।", "P0"],
    ["punctuation", "नाम, थर र ठेगाना मिलाउनुहोस्।", "P1"],
    ["punctuation", "के कागज पुगेन?", "P1"]
  ];

  return rows.map(([category, expected, severity], index) => ({
    id: `preeti-competitor-${index + 1}`,
    type: "competitor",
    category,
    input: toPreetiInput(expected),
    expected,
    source: "manual-black-box-probe",
    severity,
    probeSet: "competitor-probe-001",
    competitorOutputs: emptyCompetitorOutputs(),
    lekhOutput: "",
    winner: "",
    failureCategory: "",
    notes: ""
  }));
}

function buildPreetiHeldOutParagraphs(): PreetiBenchmark[] {
  const rows: Array<[string, string, BenchmarkSeverity]> = [
    ["heldout-paragraph:admin", "जिल्ला प्रशासन कार्यालयमा निवेदन दर्ता भयो।\nदर्ता नम्बर 2081-01 राखियो।", "P0"],
    ["heldout-paragraph:admin", "नागरिकता प्रमाणपत्रको प्रतिलिपि माग गरिएको छ।\nकागज आज पेश भयो।", "P1"],
    ["heldout-paragraph:admin", "राष्ट्रिय परिचयपत्र शाखामा भीड थियो।\nNID form पछि भरियो।", "P0"],
    ["heldout-paragraph:office", "कार्यालय प्रमुखले सूचना पढे।\nकर्मचारी हाजिरीमा थिए।", "P1"],
    ["heldout-paragraph:office", "दर्ता चलानी किताब अद्यावधिक भयो।\nfile नम्बर 45 मिलेन।", "P0"],
    ["heldout-paragraph:office", "PDF file मा हस्ताक्षर छैन।\nExcel sheet फेरि जाँचियो।", "P0"],
    ["heldout-paragraph:legal", "जिल्ला अदालतमा मुद्दा दर्ता भयो।\nलिखित जवाफ पछि आयो।", "P1"],
    ["heldout-paragraph:legal", "कानुनी सल्लाहका लागि समय तोकियो।\nप्रमाणपत्र साथमा ल्याउनुहोस्।", "P1"],
    ["heldout-paragraph:legal", "अधिकार पत्रमा नाम फरक छ।\nवकिललाई जानकारी दिइयो।", "P1"],
    ["heldout-paragraph:school", "विद्यालयमा परीक्षा तालिका टाँसियो।\nविद्यार्थी परिचयपत्र चाहिन्छ।", "P1"],
    ["heldout-paragraph:school", "शिक्षक हाजिरी प्रमाणित भयो।\nकक्षा दस को result आयो।", "P0"],
    ["heldout-paragraph:school", "अभिभावक भेलामा निर्णय भयो।\nशुल्क रसिद सुरक्षित राखियो।", "P1"],
    ["heldout-paragraph:names", "लक्ष्मी बिष्टको जन्म मिति सच्याइयो।\nनीरज भुसालको नाम यथावत छ।", "P1"],
    ["heldout-paragraph:names", "प्रबिन घिमिरेले निवेदन दिए।\nसुमना श्रेष्ठले file बुझाइन्।", "P0"],
    ["heldout-paragraph:names", "रमेश अधिकारीको मोबाइल नम्बर फेरियो।\nसीता राईको ठेगाना मिलेन।", "P1"],
    ["heldout-paragraph:mixed", "NID form को नाम field खाली छ।\nrecord ID फेरि जाँच्नुहोस्।", "P0"],
    ["heldout-paragraph:mixed", "X-ray report आज आयो।\nPDF copy कार्यालयमा राखियो।", "P0"],
    ["heldout-paragraph:mixed", "URL link खुलेन।\nemail address सच्याउनुहोस्।", "P0"],
    ["heldout-paragraph:mixed", "mobile number update भयो।\npassport number बाँकी छ।", "P0"],
    ["heldout-paragraph:finance", "राजस्व दाखिला रसिद संलग्न छ।\nभुक्तानी सिफारिस पछि हुन्छ।", "P1"],
    ["heldout-paragraph:finance", "बजेट निकासा सम्बन्धी पत्र आयो।\nखर्च विवरण मिलाइएको छ।", "P1"],
    ["heldout-paragraph:finance", "bank voucher number उल्लेख छैन।\nदाखिला रिपोर्ट पठाइयो।", "P0"],
    ["heldout-paragraph:admin", "गुनासो सुनुवाइ कक्ष खुला छ।\nसेवा प्रवाह सुधार गर्ने निर्णय भयो।", "P1"],
    ["heldout-paragraph:admin", "सूचना अधिकारी अनुपस्थित छन्।\nसार्वजनिक सूचना भोलि टाँसिनेछ।", "P1"],
    ["heldout-paragraph:admin", "नागरिक सहायता कक्षमा लामो लाइन छ।\nटोकन नम्बर 12 बाँडियो।", "P0"],
    ["heldout-paragraph:place", "ललितपुर महानगरपालिकामा बैठक बस्यो।\nकाठमाडौँ जिल्ला बाट पत्र आयो।", "P1"],
    ["heldout-paragraph:place", "भक्तपुर नगरपालिकाले सूचना निकालेको छ।\nपोखरा कार्यालयमा copy पठाइयो।", "P0"],
    ["heldout-paragraph:place", "जनकपुर धाममा कार्यक्रम भयो।\nचितवन भरतपुरको विवरण मागियो।", "P1"],
    ["heldout-paragraph:punctuation", "नाम, थर, ठेगाना र मिति मिलाउनुहोस्।\nके कागज पुगेन?", "P1"],
    ["heldout-paragraph:punctuation", "यो विवरण ठीक छ।\nकृपया हस्ताक्षर गर्नुहोस्।", "P1"],
    ["heldout-paragraph:admin", "वडा सिफारिस पत्र आज जारी भयो।\nदर्ता शाखामा रसिद राखियो।", "P1"],
    ["heldout-paragraph:admin", "जिल्ला प्रशासन बाट सूचना आयो।\nसेवा केन्द्र भोलि बन्द हुन्छ।", "P1"],
    ["heldout-paragraph:admin", "राष्ट्रिय परिचयपत्रको biometrics छुटेको छ।\nNID status फेरि check गर्नुहोस्।", "P0"],
    ["heldout-paragraph:office", "दायरीमा नयाँ file खोलियो।\noffice copy आज पठाउनुहोस्।", "P0"],
    ["heldout-paragraph:office", "meeting minutes तयार भयो।\nfinal draft मा नाम सच्याइयो।", "P0"],
    ["heldout-paragraph:office", "data entry सकियो।\nprint गरेर record मा राखियो।", "P0"],
    ["heldout-paragraph:legal", "सार्वजनिक मुद्दामा सुनुवाइ भयो।\nलिखित उजुरी पेश गरियो।", "P1"],
    ["heldout-paragraph:legal", "अदालतको आदेश पालना गर्नुहोस्।\nप्रतिनिधि पत्र साथमा ल्याउनुहोस्।", "P1"],
    ["heldout-paragraph:legal", "कानुनी प्रक्रिया सुरु भयो।\nम्याद भित्र जवाफ दिनुहोस्।", "P1"],
    ["heldout-paragraph:school", "पाठ्यक्रम विकास केन्द्रको पत्र आयो।\nविद्यालय व्यवस्थापन समितिले निर्णय गर्‍यो।", "P1"],
    ["heldout-paragraph:school", "छात्रवृत्ति form भर्न बाँकी छ।\nअंकपत्रको copy चाहिन्छ।", "P0"],
    ["heldout-paragraph:school", "कक्षा नौको तालिका प्रकाशित भयो।\nresult publish भएपछि सूचना दिनुहोस्।", "P0"],
    ["heldout-paragraph:names", "आशिम बस्नेतको file तयार भयो।\nरोहन बस्नेतले हस्ताक्षर गरे।", "P0"],
    ["heldout-paragraph:names", "गीता थापाको जन्म दर्ता मिल्यो।\nमाया गुरुङको ठेगाना बाँकी छ।", "P1"],
    ["heldout-paragraph:names", "सुष्मा कार्कीको निवेदन आयो।\nलक्ष्मी भण्डारीको नाम सच्याइयो।", "P1"],
    ["heldout-paragraph:mixed", "fileघर व्यवस्था परीक्षणमा छ।\nसहयोगdesk खोल्नुस।", "P0"],
    ["heldout-paragraph:mixed", "Form No 7 भरियो।\nQR code scan भएन।", "P0"],
    ["heldout-paragraph:mixed", "X-ray report मा date मिलेन।\nPDF upload फेरि गर्नुहोस्।", "P0"],
    ["heldout-paragraph:place", "बुटवल उपमहानगरपालिकामा कार्यक्रम भयो।\nधनकुटा बजारमा सूचना टाँसियो।", "P1"],
    ["heldout-paragraph:place", "किर्तिपुर campus बाट पत्र आयो।\nबानेश्वर branch मा copy पठाइयो।", "P0"]
  ];

  return rows.map(([category, expected, severity], index) => ({
    id: `preeti-held-out-paragraph-${index + 1}`,
    type: "held-out",
    category,
    input: toPreetiInput(expected),
    expected,
    source: "manual-held-out-preeti-paragraph-001",
    severity
  }));
}

function classifyPreeti(text: string): string {
  if (/[A-Za-z]/.test(text)) return "mixed-english";
  if (/र्/.test(text)) return "reph";
  if (/ि/.test(text)) return "matra";
  if (/्/.test(text)) return "conjunct";
  return "word";
}

function toPreetiInput(expected: string): string {
  return expected
    .split(/(\s+)/)
    .map((token) => {
      if (!token || /^\s+$/.test(token)) return token;
      if (/[A-Za-z0-9]/.test(token)) return token;
      return unicodeToPreeti(token);
    })
    .join("");
}

function parseWordRows(raw: string): WordRow[] {
  return raw.trim().split(/\n/).slice(1).map((line) => {
    const [word, romanized, frequency, domain, source] = line.split("\t");
    return { word, romanized, frequency: Number(frequency), domain, source };
  });
}

function parsePhraseRows(raw: string): PhraseRow[] {
  return raw.trim().split(/\n/).slice(1).map((line) => {
    const [input, output, domain, frequency, source] = line.split("\t");
    return { input, output, domain, frequency: Number(frequency), source };
  });
}

function parseAliasRows(raw: string): AliasRow[] {
  return raw.trim().split(/\n/).slice(1).map((line) => {
    const [word, romanized, frequencyBoost, domain, source] = line.split("\t");
    return { word, romanized, frequencyBoost: Number(frequencyBoost), domain, source };
  });
}

function isAmbiguousAlias(alias: AliasRow): boolean {
  return wordRows.some((row) => row.romanized.toLowerCase() === alias.romanized.toLowerCase() && row.word !== alias.word);
}

function dedupeRomanized(cases: RomanizedBenchmark[]): RomanizedBenchmark[] {
  const seen = new Set<string>();
  const deduped: RomanizedBenchmark[] = [];
  for (const item of cases) {
    const key = item.input.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push({ ...item, id: `romanized-manual-${deduped.length + 1}` });
  }
  return deduped;
}

function emptyCompetitorOutputs(): CompetitorOutputs {
  return {
    googleInputTools: "",
    microsoftIndic: "",
    keyman: "",
    ashesh: "",
    easyNepaliTyping: "",
    unicodeNepali: "",
    nepalibhashaConverter: "",
    notes: ""
  };
}

function preserveCompetitorOutputs<T extends RomanizedBenchmark | PreetiBenchmark>(path: string, nextRows: T[]): T[] {
  if (!existsSync(path)) return nextRows;
  const previousRows = JSON.parse(readFileSync(path, "utf8")) as Array<{
    id?: string;
    competitorOutputs?: CompetitorOutputs;
    lekhOutput?: string;
    winner?: string;
    failureCategory?: string;
    notes?: string;
  }>;
  const previousById = new Map(previousRows.map((row) => [row.id, row]));
  return nextRows.map((row) => ({
    ...row,
    competitorOutputs: previousById.get(row.id)?.competitorOutputs ?? row.competitorOutputs,
    lekhOutput: previousById.get(row.id)?.lekhOutput ?? row.lekhOutput,
    winner: previousById.get(row.id)?.winner ?? row.winner,
    failureCategory: previousById.get(row.id)?.failureCategory ?? row.failureCategory,
    notes: previousById.get(row.id)?.notes ?? row.notes
  }));
}

function writeJson(path: string, value: unknown) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}
