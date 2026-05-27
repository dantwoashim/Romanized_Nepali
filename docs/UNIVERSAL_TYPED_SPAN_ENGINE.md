# Universal Typed Span Engine

Lekh now treats mixed Nepali office text as a sequence of typed spans, not as one document-level script.

Pipeline:

1. Normalize the document boundary.
2. Segment every character into exactly one typed span.
3. Lock protected spans such as URLs, emails, form numbers, ward labels, phone numbers, files, and quoted examples.
4. Route each span independently.
5. Build a document lattice from span candidates.
6. Verify protected-span integrity and Unicode structure.
7. Gate the result as auto, candidates, preserve, warn, or refuse.

Modes are policies. They tune thresholds and defaults, but they do not replace span-level classification.

Implemented span kinds include Unicode Nepali, Preeti legacy islands, Romanized Nepali, English preserve spans, English stems with Nepali suffixes, loanword candidates, numbers, dates, identifiers, emails, URLs, phones, files, quoted examples, punctuation, whitespace, and unknown risky spans.

The product guarantee remains no silent corruption. Unknown or ambiguous spans are preserved with warnings or candidate-gated instead of being silently mutated.
