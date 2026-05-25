const rows = [
  ["क", "ख", "ग", "घ", "ङ"],
  ["च", "छ", "ज", "झ", "ञ"],
  ["ट", "ठ", "ड", "ढ", "ण"],
  ["त", "थ", "द", "ध", "न"],
  ["प", "फ", "ब", "भ", "म"],
  ["य", "र", "ल", "व", "श"],
  ["ष", "स", "ह", "क्ष", "ज्ञ"]
];

export function TraditionalLayoutReference() {
  return (
    <section className="reference-panel" aria-label="Traditional layout reference">
      <div className="panel-heading">
        <div>
          <h2>Traditional layout reference</h2>
          <p>This week-one build is reference-only for Traditional layout users.</p>
        </div>
        <span className="local-badge">Reference</span>
      </div>

      <div className="key-grid" aria-label="Common Devanagari reference keys">
        {rows.flat().map((key) => (
          <span className="keycap" key={key}>
            {key}
          </span>
        ))}
      </div>

      <p className="quiet-note">
        No keydown remapping, native keyboard hook, or installer is included. Use feedback if a future Traditional
        typing workflow matters for your desktop work.
      </p>
    </section>
  );
}
