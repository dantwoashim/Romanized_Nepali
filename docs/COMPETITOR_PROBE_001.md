# Competitor Probe 001

Checked: 2026-05-25

This is a small, frozen manual black-box probe for comparing public behavior across Nepali typing and legacy-font tools. It is intentionally manual. Do not scrape private APIs, bypass rate limits, decompile tools, copy source code, copy mapping tables, or import competitor outputs into bundled data.

## Fixture Files

| Engine | File | Count | Output fields |
| --- | --- | ---: | --- |
| Preeti | `benchmarks/preeti/competitor/preeti_competitor_probe_v1.json` | 50 | `competitorOutputs`, `lekhOutput`, `winner`, `failureCategory`, and `notes` fields are manually fillable |
| Romanized | `benchmarks/romanized/competitor/romanized_competitor_probe_v1.json` | 100 | `competitorOutputs`, `lekhOutput`, `winner`, `failureCategory`, and `notes` fields are manually fillable |

Legacy mirror files remain at `benchmarks/preeti/competitor-probes.json` and `benchmarks/romanized/competitor-probes.json` for existing scripts and diffs.

The probe set id is `competitor-probe-001`.

## Tools To Check Manually

Use only public pages, official install surfaces, or already-installed local tools:

- Google Input Tools / Google transliteration behavior where accessible
- Microsoft Indic/Nepali/Marathi phonetic input behavior where accessible
- Keyman Nepali Romanized keyboard
- Ashesh Preeti/Unicode tools
- EasyNepaliTyping
- UnicodeNepali / Nepali Unicode style tools
- `@nepalibhasha/converter` baseline

Not every tool supports every workflow. Leave unsupported fields blank and add a short note.

## Manual Procedure

1. Open one fixture file.
2. Copy only the fixture `input`, not private user text.
3. Paste/type it into one public tool manually.
4. Copy the visible output exactly as displayed.
5. Fill the matching field under `competitorOutputs`.
6. Record obvious caveats in `competitorOutputs.notes`, such as unsupported font, tool unavailable, candidate chosen manually, or output required pressing space.
7. Do not add any new text collected from real users to competitor files.
8. Run `npm run benchmark` after edits to keep Lekh's own scores visible beside the manually entered comparison fields.

The fixture generator preserves existing `competitorOutputs` by fixture `id`, so rerunning `npm run benchmark` should not erase manually filled comparison outputs. If an id changes, re-check the row before carrying an old competitor output forward.

## Field Meaning

| Field | Meaning |
| --- | --- |
| `googleInputTools` | Manual visible output from Google Input Tools or equivalent Google transliteration surface |
| `microsoftIndic` | Manual visible output from Microsoft Indic/Nepali/Marathi phonetic input behavior |
| `keyman` | Manual visible output from Keyman Nepali Romanized keyboard |
| `ashesh` | Manual visible output from Ashesh converter/typing tools |
| `easyNepaliTyping` | Manual visible output from EasyNepaliTyping |
| `unicodeNepali` | Manual visible output from UnicodeNepali/Nepali Unicode style tool |
| `nepalibhashaConverter` | Output from the safe local package baseline when applicable |
| `notes` | Unsupported workflow, selected candidate, browser/OS notes, or other caveat |

## Safety Rules

- Use small fixture inputs only.
- Do not paste confidential documents into third-party tools.
- Do not automate third-party web forms.
- Do not infer, copy, or reconstruct competitor rules from repeated probing.
- Do not claim superiority from this probe alone. A public comparison requires frozen inputs, named tool versions, reviewer notes, and a reproducible method.
