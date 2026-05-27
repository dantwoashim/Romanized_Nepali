# English Suffix Parser

Mixed office text often contains English stems with Nepali suffixes. Lekh now parses these as a distinct span kind instead of sending the whole word through Romanized Nepali conversion.

Examples:

| Input | Output |
| --- | --- |
| `tokenharu` | `tokenहरू` |
| `fileharu` | `fileहरू` |
| `systemmaa` | `systemमा` |
| `recordko` | `recordको` |
| `formlai` | `formलाई` |
| `submitbhayo` | `submit भयो` |

Rules:

- The English stem is preserved byte-exactly.
- The Nepali suffix is converted to Unicode.
- Protected tokens are never split.
- Known Nepali Romanized words such as `shabdaharu` are not treated as English stems.
- If the split is not safe, the span is preserved or candidate-gated.
