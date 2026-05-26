

````md
# PHONOLOGY_CONTRACT.md

## Status

Romanized Nepali typing contract.

This document defines the default Romanized-to-Devanagari behavior for Lekh's `common-nepali` profile.

This file exists because Nepali Romanization is not standardized.

Different users expect different mappings based on:

- Google Input Tools habits
- mobile keyboard habits
- MPP/LTK Romanized layout habits
- informal chat Romanization
- school/office conventions
- personal spelling habits
- Sanskrit-derived formal spelling habits

Contributors must not invent these decisions.

All Romanized engine work must read this file before implementation.

---

## 1. Product Goal

The Romanized engine must feel useful to real Nepali desktop users.

It should not claim perfect transliteration.

It should:

- produce a strong default output
- expose secondary candidates for ambiguity
- use dictionary/domain ranking when available
- preserve trace/debug information
- prefer common Nepali typing behavior over strict academic transliteration
- add fixtures before fixes

The current goal is:

> A serious preview Romanized engine with explicit rules, candidate handling, and feedback loops.

Not:

> Official Nepali Romanization.

Not:

> Google-quality transliteration.

Not:

> Perfect phonology.

---

## 2. Default Profile

Default profile:

```ts
type RomanizationProfile = "common-nepali";
````

Meaning:

`common-nepali` is a pragmatic Romanized Nepali input profile.

It favors:

* common Nepali digital typing habits
* readability
* office/government/school vocabulary
* names and proper nouns
* candidate visibility over silent overconfidence
* dictionary overrides for known words

It does not strictly follow IAST, ISO, Sanskrit transliteration, or one official Romanization standard.

---

## 3. Core Output Rules

### 3.1 Default Script

All output is Devanagari Unicode.

All final output must pass through:

```ts
normalizeNepaliText(input: string): string
```

### 3.2 No Silent Perfection Claims

If multiple outputs are plausible:

* choose the most common/default candidate
* expose alternatives
* keep trace information

Example:

```text
shakti -> शक्ति default
         षक्ति secondary only if dictionary/formal rule supports it
```

---

## 4. Vowels

### 4.1 Independent Vowels

Use independent vowels when a vowel begins a token or follows a separator.

| Romanized               | Default                                             |
| ----------------------- | --------------------------------------------------- |
| a                       | अ                                                   |
| aa / A                  | आ                                                   |
| i                       | इ                                                   |
| ii / ee / I             | ई                                                   |
| u                       | उ                                                   |
| uu / oo / U             | ऊ                                                   |
| e                       | ए                                                   |
| ai                      | ऐ                                                   |
| o                       | ओ                                                   |
| au                      | औ                                                   |
| ri / rri at token start | ऋ candidate, रि default unless dictionary overrides |

### 4.2 Dependent Matras

Use matras after consonants.

| Romanized   | Matra                    |
| ----------- | ------------------------ |
| a           | inherent vowel, no matra |
| aa / A      | ा                        |
| i           | ि                        |
| ii / ee / I | ी                        |
| u           | ु                        |
| uu / oo / U | ू                        |
| e           | े                        |
| ai          | ै                        |
| o           | ो                        |
| au          | ौ                        |

### 4.3 Schwa / Inherent Vowel Rule

Default consonants carry inherent `अ`.

The engine should not aggressively delete schwa in current build.

Examples:

```text
kamal -> कमल
sarkar -> सरकार
nagarik -> नागरिक
```

Do not implement broad schwa deletion without explicit future design.

Schwa behavior is too easy to get wrong and users tolerate extra expected vowels better than broken consonant clusters.

---

## 5. Consonants

### 5.1 Basic Consonant Defaults

| Romanized | Default                       |
| --------- | ----------------------------- |
| k         | क                             |
| kh        | ख                             |
| g         | ग                             |
| gh        | घ                             |
| ng        | ङ / ं depending context       |
| ch        | च                             |
| chh       | छ                             |
| c         | च                             |
| j         | ज                             |
| jh        | झ                             |
| ny        | ञ / न्य depending context     |
| t         | त                             |
| th        | थ                             |
| d         | द                             |
| dh        | ध                             |
| n         | न                             |
| T         | ट                             |
| Th        | ठ                             |
| D         | ड                             |
| Dh        | ढ                             |
| N         | ण                             |
| p         | प                             |
| ph / f    | फ                             |
| b         | ब                             |
| bh        | भ                             |
| m         | म                             |
| y         | य                             |
| r         | र                             |
| l         | ल                             |
| w / v     | व                             |
| sh        | श                             |
| Sh / S    | ष                             |
| s         | स                             |
| h         | ह                             |
| L         | ळ candidate only, not default |

### 5.2 Lowercase Default

User input is lowercased for most parsing, except when capital letters are intentionally used to request retroflex/Sanskritic sounds.

Presentation title case for names and sentence starts is not phonetic intent. For example, `Thapa`, `Tika`, `Sarkar`, and `Shrestha` should be interpreted through the lowercase common-Nepali path and dictionary ranking. Users who need explicit retroflex/Sanskritic output should use standalone or internal capital markers, not ordinary title case.

Supported capital distinctions:

```text
T  -> ट
Th -> ठ
D  -> ड
Dh -> ढ
N  -> ण
Sh/S -> ष
```

If the user types lowercase only, prefer common Nepali output.

---

## 6. Ambiguous Fricatives: `s`, `sh`, `Sh`

### 6.1 Default Decisions

| Input  | Default | Secondary               |
| ------ | ------- | ----------------------- |
| s      | स       | श if dictionary says so |
| sh     | श       | ष, स candidates         |
| Sh / S | ष       | श candidate             |

### 6.2 Examples

```text
sarkar -> सरकार
sewa -> सेवा
suchana -> सूचना
shiksha -> शिक्षा
shakti -> शक्ति
Shastra -> षास्त्र / शास्त्र candidate depending normalization
```

### 6.3 Product Decision

Most users typing `sh` expect `श`.

Therefore:

```text
sh -> श default
```

Formal/Sanskritic `ष` must be handled through:

* capital `Sh` / `S`
* dictionary override
* candidate list

Do not default plain `sh` to `ष`.

---

## 7. `ch`, `chh`, `c`

### 7.1 Default Decisions

| Input | Default | Secondary                              |
| ----- | ------- | -------------------------------------- |
| ch    | च       | छ candidate only for known words/users |
| chh   | छ       | none                                   |
| c     | च       | none by default                        |

### 7.2 Examples

```text
chala -> चल
chhaina -> छैन
chhata -> छाता
chitwan -> चितवन
```

### 7.3 Product Decision

`chh` is the explicit aspirated form.

Do not make `ch` default to `छ`.

`c` is a shorthand alias for `ch` in the default profile. It is intentionally not a separate official Romanization rule.

Users who expect `ch` for `छ` can be supported later with a profile or learned preference.

---

## 8. `x`, `ksh`, `kshya`

### 8.1 Default Decisions

| Input | Default                                            | Secondary            |
| ----- | -------------------------------------------------- | -------------------- |
| ksh   | क्ष                                                | क्श candidate rarely |
| x     | preserve unless dictionary/profile selects क्ष      | क्ष candidate         |
| kshya | क्ष्य / क्ष्या depending vowel parse               |                      |

### 8.2 Product Decision

For `common-nepali`, `ksh` is the explicit default for `क्ष`.

The single-letter `x` is candidate/profile-dependent because it collides with English tokens and chat habits. Preserve standalone `x`/`X` and obvious English uses. Dictionary-backed forms such as `xetra -> क्षेत्र` may still rank as default.

Do not map `x` to `छ` in the default profile.

### 8.3 Examples

```text
kshamata -> क्षमता
kshetra -> क्षेत्र
xetra -> क्षेत्र candidate
```

---

## 9. `gya`, `jnya`, `gyan`

### 9.1 Default Decisions

| Input  | Default                     | Secondary              |
| ------ | --------------------------- | ---------------------- |
| gya    | ज्ञ                         | ग्या candidate         |
| jnya   | ज्ञ                         | ज्न्य candidate rarely |
| gy     | ग्य when not known conjunct |                        |
| gyan   | ज्ञान                       |                        |
| bigyan | विज्ञान                     |                        |

### 9.2 Product Decision

For known Nepali/Sanskritic terms, `gya` defaults to `ज्ञ`.

Examples:

```text
gyan -> ज्ञान
bigyan -> विज्ञान
pragya -> प्रज्ञा
```

If the user appears to mean literal `ग्या`, expose candidate but do not default to it unless dictionary/profile says so.

---

## 10. `tra`

### 10.1 Default Decision

```text
tra -> त्र
```

Examples:

```text
patra -> पत्र
mantralaya -> मन्त्रालय
traas -> त्रास
```

If the parser detects literal `तरा`, it may expose candidate when vowel segmentation supports it.

Default remains `त्र`.

---

## 11. `shra`

### 11.1 Default Decision

```text
shra -> श्र
```

Examples:

```text
shram -> श्रम
shrestha -> श्रेष्ठ
shraddha -> श्रद्धा
```

`shrestha -> श्रेष्ठ` should be a high-priority fixture because names matter.

---

## 12. Halanta and Conjunct Handling

### 12.1 Required Common Conjuncts

The engine must explicitly support at least:

| Input      | Output          |
| ---------- | --------------- |
| ksh        | क्ष             |
| tra        | त्र             |
| gya / jnya | ज्ञ             |
| shra       | श्र             |
| tta        | त्त             |
| ddha       | द्ध             |
| dya        | द्य             |
| tya        | त्य             |
| kya        | क्य             |
| pra        | प्र             |
| kra        | क्र             |
| gra        | ग्र             |
| bhr        | भ्र             |
| str        | स्त्र candidate |

LTK’s keyboard page explicitly documents conjunct composition such as `क्ष = क + ् + ष`, `त्र = त + ् + र`, `ज्ञ = ज + ् + ञ`, and `श्र = श + ् + र`. These are non-optional fixture cases.

### 12.2 Halanta Rule

Use halanta (`्`) for conjunct construction.

Do not emit visible halanta at the end of normal words unless explicitly typed or required.

Current build generic halanta support is conservative. The parser may add virama for documented regression pairs such as:

```text
rk rm rn ry lt nd mb mp nm nt st sk sp rt rd lp
```

This is not a complete consonant-cluster grammar. New pairs must be added with rule-only fixtures and mixed-word failure tests so words such as `rimjhim` and `gharbar` do not regress into over-joined output.

### 12.3 Explicit Halanta Input

Support explicit halanta in future with a notation such as:

```text
k_ -> क्
```

Current build support is optional.

Do not block the MVP on explicit halanta UI.

---

## 13. `ri`, `rishi`, `ऋ`

### 13.1 Default Decision

Inside normal words:

```text
ri -> रि
```

At token start or known classical/formal words:

```text
ri/rishi -> ऋ candidate or dictionary override
```

### 13.2 Examples

```text
prabin -> प्रबिन / प्रवीण candidate if dictionary/name known
rishi -> ऋषि default if dictionary contains ऋषि
ritual-like unknown -> रि... default
```

### 13.3 Product Decision

Do not globally map `ri` to `ऋ`.

That would break ordinary words and names.

Use dictionary overrides for known `ऋ` words.

---

## 14. Anusvara, Chandrabindu, and Nasal Handling

This is approximate in current build.

### 14.1 Default Symbols

| Input                      | Default                               |
| -------------------------- | ------------------------------------- |
| m before consonant cluster | ं candidate/default depending context |
| n before consonant cluster | ं candidate/default depending context |
| ng                         | ङ or ंग depending word                |
| mm/nm literal              | full consonant candidates             |
| ~n / chandrabindu notation | ँ optional future                     |

### 14.2 Default Decision

For common Nepali office typing, prefer anusvara (`ं`) for nasal-before-consonant shortcuts when users type `m` or `n` before certain consonant classes.

Examples:

```text
sambidhan -> संविधान
samvidhan -> संविधान
sangh -> संघ
sankha -> संख्या / सङ्ख्या candidate depending dictionary
```

### 14.3 Homorganic Nasal Candidates

The engine may expose homorganic nasal candidates:

```text
ङ् before k/g class
ञ् before ch/j class
ण् before retroflex class
न् before dental class
म् before p/b class
```

But current build default should favor practical Nepali spelling and dictionary match.

### 14.4 Chandrabindu

Do not aggressively generate chandrabindu (`ँ`) by default.

Expose it only when:

* user explicitly types a future notation such as `~`
* dictionary contains the word
* candidate rule is clearly known

Chandrabindu mistakes are visible and annoying. Default conservatively.

---

## 15. `v` and `w`

### 15.1 Default Decision

Both `v` and `w` map to:

```text
व
```

Examples:

```text
vidyalaya -> विद्यालय
bikas/vikas -> विकास
sewa -> सेवा
```

The engine should accept both because Nepali users mix them constantly, because humans apparently enjoy making transliteration everyone’s problem.

---

## 16. `f` and `ph`

### 16.1 Default Decision

Both `f` and `ph` map to:

```text
फ
```

Examples:

```text
phal -> फल
file -> फाइल candidate / preserve English candidate
```

For English loanwords, preserve mixed English when user intent is clearly English.

---

## 17. Names

Names must be treated as high-priority fixtures.

Required examples:

```text
prabin
niraj
bhusal
shrestha
adhikari
koirala
giri
khadka
sumana
ashim
suman
sugam
anjan
sushma
```

Names are where users emotionally judge the engine.

If the engine mangles a name, the user does not think:

> Ah, early-stage candidate model.

They think:

> This is bad.

And honestly, fair.

---

## 18. English Preservation

The engine must not blindly convert all Latin text.

### 18.1 Preserve Likely English

Preserve or expose candidates for:

* URLs
* emails
* numbers
* file names
* obvious English words inside mixed text
* acronyms

Examples:

```text
NID
PDF
Excel
Word
email
passport
```

### 18.2 Mixed Text

Input:

```text
NID form ko naam field
```

Possible output:

```text
NID form को नाम field
```

Do not force everything into Devanagari if the token is clearly technical/English.

Current build behavior may be conservative:

* convert tokens only inside the active Romanized editor
* allow user to copy/edit manually
* preserve uppercase acronyms

---

## 19. Punctuation and Numerals

### 19.1 Punctuation

Preserve common punctuation:

```text
. , ? ! : ; - / ( )
```

Optionally map danda only when user explicitly types:

```text
||
```

to:

```text
।
```

Do not replace every period with danda automatically in current build.

### 19.2 Numerals

Default:

```text
preserve Arabic digits 0-9
```

Optional future setting:

```text
0-9 -> ०-९
```

Do not force Devanagari digits by default.

Office workflows often need Latin digits.

---

## 20. Candidate Ranking

Candidate ranking should prefer:

1. exact dictionary match
2. higher frequency
3. domain boost
4. default rule confidence
5. common user convention
6. shorter/cleaner parse
7. fewer uncertain transformations

Do not rank rare Sanskritic candidates above common Nepali words unless dictionary/frequency says so.

---

## 21. Required Fixture Categories

Romanized fixtures must include:

### 21.1 Everyday

```text
namaste
mero
naam
ghar
ramro
aaja
bholi
dhanyabad
sathi
khana
pani
```

### 21.2 Government/Admin

```text
sarkar
sewa
karyalaya
nagarik
nagarikta
rastriya
parichayapatra
rajaswa
suchana
bibhag
mantralaya
pramanpatra
nibedan
anusuchi
adhikari
karmachari
sambidhan
```

### 21.3 Education

```text
bidhyalaya
vidyalaya
shiksha
vidyarthi
pariksha
adhyayan
shikshak
mahavidyalaya
pramanpatra
```

### 21.4 Legal/Formal

```text
kanun
niyam
adhikar
darta
sifarish
karyabahi
nibedak
pratinidhi
patra
```

### 21.5 Names

```text
prabin
niraj
bhusal
shrestha
adhikari
koirala
giri
khadka
sumana
ashim
```

### 21.6 Conjuncts

```text
kshamata
kshetra
patra
mantralaya
gyan
bigyan
shrestha
shram
sambidhan
```

### 21.7 Mixed Text

```text
NID form
passport ko date
Excel report
Word file
PDF ma naam
```

---

## 22. Disallowed Shortcuts

Do not:

* implement the engine as one giant regex replace chain
* silently choose rare outputs with no candidate alternative
* ignore conjuncts
* ignore normalization
* ignore names
* ignore dictionary ranking
* treat all Latin tokens as Nepali
* invent phonology rules without adding them here
* fix output without adding fixtures

---

## 23. Change Policy

If a rule changes:

1. update this document
2. add or update fixtures
3. update engine behavior
4. update known limitations if needed
5. include the reason in the task report

The phonology contract is product behavior.

Changing it casually is changing the product.

---

## 24. Known Limitations

Current build does not fully solve:

* schwa deletion
* perfect chandrabindu choice
* all homorganic nasal spelling
* all Sanskrit-derived rare forms
* personalized user preference learning
* sentence-level grammar correction
* full English/Nepali token intent detection
* official orthographic validation

These are future work.

The engine must still feel useful despite these limitations.

---

## 25. Summary Defaults

Core defaults:

```text
s      -> स
sh     -> श
Sh/S   -> ष
ch     -> च
chh    -> छ
c      -> च
ksh    -> क्ष
x      -> preserved by default; क्ष candidate/profile/dictionary-backed
gya    -> ज्ञ
jnya   -> ज्ञ
tra    -> त्र
shra   -> श्र
ri     -> रि by default, ऋ by dictionary override
v/w    -> व
f/ph   -> फ
```

Nasal defaults:

```text
m/n before consonant cluster -> anusvara/dictionary default
homorganic nasal candidates may be exposed
chandrabindu is not default unless explicit/dictionary-backed
```

Digits:

```text
0-9 preserved by default
```

Punctuation:

```text
period preserved by default
danda only explicit/future setting
```

Traditional:

```text
reference only in current build
```

This contract must be read before any Romanized engine work.

````
