# Tool Comparison

Checked: 2026-05-25

This document compares public behavior and documentation for Nepali input/conversion tools. It is a product and benchmark guide only. Do not copy code, rules, maps, private APIs, or data from these tools unless a source is separately verified as bundle-safe in `docs/DATA_SOURCES.md`.

## Reviewed Public References

| Area | References reviewed | Source decision |
| --- | --- | --- |
| Google Input Tools | `https://www.google.com/inputtools/`, `https://www.google.com/inputtools/chrome/chrome-os.html`, Chrome Web Store public listing | UX and small manual black-box reference only |
| Microsoft Indic keyboards | `https://support.microsoft.com/en-us/windows/set-up-and-use-indic-phonetic-keyboards-7c4d2e8a-abf2-f200-9866-1a4cead7b127` | UX and platform behavior reference only |
| Keyman Nepali Romanized | `https://keyman.com/keyboards/nepali_romanized`, `https://help.keyman.com/keyboard/10/nepali_romanized` | Layout/reference benchmark; no rules copied into phrase engine |
| Public web converters | Ashesh, EasyNepaliTyping, UnicodeNepali/Nepali Unicode style sites, and similar public pages | Competitor context and manual black-box probes only |
| Safe package baseline | `@nepalibhasha/converter` npm/GitHub pages | Runtime baseline because license is documented as MIT |

## Comparison Table

| Tool | Public workflow | Strengths | Weaknesses / gaps | Privacy / offline status | Lekh benchmark implication |
| --- | --- | --- | --- | --- | --- |
| Google Input Tools | Chrome extension and Chrome OS input methods with transliteration/virtual keyboards. | Very strong candidate UX; broad language support; users recognize its behavior. | Chrome extension documentation does not expose model, dictionary, or scoring rules; public web black-box comparisons must stay small and manual. | Chrome OS page says Chrome OS extension works offline; Chrome browser extension page documents install/use and Terms acceptance but not local-only text guarantees. | Use as a behavior baseline for Romanized candidate quality, mixed English preservation, and common phrase defaults. Do not imitate hidden rules. |
| Microsoft Indic / Nepali / Marathi input | Windows language settings, Nepali keyboard, and Indic phonetic IMEs. Marathi Phonetic converts typed Latin input into Devanagari suggestions. Microsoft lists Nepali using a Hindi Phonetic input profile. | OS-level integration, candidate window, dictionary-backed phonetic behavior, no third-party install for supported keyboards. | Nepali-specific phonetic docs are thin; dictionary downloads happen through Windows Update; behavior depends on OS version. | Local OS input after dictionary installation, but initial dictionary is downloaded by Windows. | Benchmark against candidate ranking concepts: top suggestion, alternate choices, and natural-pronunciation handling. |
| Keyman Nepali Romanized | Installable Unicode keyboard across desktop, web, and mobile. | MIT-licensed Nepali Romanized keyboard page; broad platform support; published help and key behavior. | Layout-style input, not phrase-level transliteration with dictionary ranking. | Keyman supports installable/offline keyboards; web keyboard is available online. | Use as a safe reference for layout/key expectations, especially longpress/special characters, not as a phrase engine. |
| Ashesh Preeti/Unicode tools | Public Nepali web tools including Romanized Unicode, Preeti to Unicode, Unicode to Preeti, and other converters. | Long-running Nepali web tooling presence; supports multiple legacy fonts according to public pages. | Conversion internals/license not available for bundling; privacy/offline behavior not established from public docs. | Web tool; assume text enters site unless documented otherwise. | Competitor benchmark gap: Preeti paragraphs, legacy font variants, and mixed English. Manual black-box only. |
| EasyNepaliTyping | Browser typing/transliteration and conversion tools; public about page describes phonetic Roman typing and Preeti to Unicode converter. | Familiar public tool, phonetic typing aimed at broad Nepali users, multi-language typing surface. | Rules and dictionaries are not documented for reuse; public pages emphasize web workflow rather than local engine guarantees. | Web tool; no local-only guarantee found in reviewed pages. | Compare phrase defaults, learner-friendly behavior, and common Romanized spellings. |
| UnicodeNepali / Nepali Unicode sites | Browser Romanized-to-Unicode typing, often with quick examples and special character notes. | Simple public typing workflow; useful for baseline Romanized behavior. | Many sites have unclear ownership/licensing and no reusable rule/data source. | Web tools; offline and privacy guarantees vary or are absent. | Use only for small manual black-box checks of common words and punctuation. |
| LTK / MPP context | LTK materials explain why legacy fonts are ASCII-backed and why migration/converters matter. Keyman publishes an MPP Romanized keyboard package under MIT. | Strong historical/product context; supports the need for Unicode conversion and Romanized/traditional workflows. | LTK PDFs are documentation/context, not a license to copy converter mappings. | Documentation only. | Use to justify benchmark categories: Preeti glyph ambiguity, font dependency, Unicode migration, conjunct issues. |
| `@nepalibhasha/converter` | npm MIT package for Nepali font conversion; current safe runtime baseline. | Verified safe dependency; handles Preeti baseline conversion and supports multiple font maps exposed by package. | Still needs wrapper warnings, clean-room postrules, fixture gates, and real-document validation. | Bundled locally; no server processing. | Primary baseline for Preeti conversion. Lekh adds normalization, warning, preservation, and benchmark infrastructure around it. |

## Manual Black-Box Probe Set

Use this small set only for manual behavior comparison in public web tools. Never automate private APIs or scrape hidden endpoints.

| Category | Input | Expected observation |
| --- | --- | --- |
| Common admin phrase | `jilla prashasan karyalaya` | Does the tool produce जिल्ला प्रशासन कार्यालय as first result or candidate? |
| Official phrase | `janma miti` | Does it produce जन्म मिति rather than जनम मिति? |
| Name | `lakshmi` / `laxmi` | Does it prefer लक्ष्मी and expose variants? |
| Mixed English | `NID form ko naam field` | Are NID/form/field preserved? |
| X-ray | `X-ray report` | Is English X-ray preserved? |
| Preeti paragraph | `;/sf/sf] ;"rgf\nsfof{nodf btf{ eof].` | Does line break survive and punctuation normalize? |
| Reph/matra | `lg0f{o` | Does it convert to निर्णय? |
| Conjunct | `If]q` | Does it convert to क्षेत्र? |

## Design Lessons For Lekh

- Treat Google/Microsoft as UX and ranking benchmarks, not reusable data sources.
- Treat Keyman as a layout/reference benchmark because its Nepali Romanized keyboard is published and MIT, but do not turn layout behavior into silent phrase transliteration.
- Treat public Preeti converters as black-box competitors only. Their conversion success can inspire fixture categories, not copied mappings.
- Keep every comparison honest: named tools should be measured on the same frozen inputs before any public comparative claim.
