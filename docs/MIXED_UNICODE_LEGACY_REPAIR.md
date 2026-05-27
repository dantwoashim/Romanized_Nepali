# Mixed Unicode Legacy Repair

`mixed-unicode-legacy-repair` is for mostly Unicode Nepali office text that contains embedded Preeti legacy islands.

Examples now covered:

| Input | Output |
| --- | --- |
| `मृत्य' btf{` | `मृत्यु दर्ता` |
| `hUuf wgL k\|df0fk'र्जा` | `जग्गा धनी प्रमाणपुर्जा` |
| `स'dg clwsf/L` | `सुमन अधिकारी` |
| `p"jL{o bz{gfg';f/` | `पूर्वीय दर्शनानुसार` |
| `j;'w}j s'6'Dasd\` | `वसुधैव कुटुम्बकम्` |
| `b'em]/ sfo{qmdsf nIox? k\|fKt` | `बुझेर कार्यक्रमका लक्ष्यहरू प्राप्त` |

The segmenter does not protect every ASCII run in Preeti mode, because Preeti itself is ASCII. It scores profile coverage, known sequence coverage, high-signal Preeti patterns, surrounding Nepali context, English-word likelihood, and protected-token likelihood.

Unsupported or low-confidence legacy islands are preserved with a warning.
