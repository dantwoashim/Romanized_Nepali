import { Eraser, FileWarning, Wand2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../../components/Button";
import { CopyButton } from "../../components/CopyButton";
import { Textarea } from "../../components/Textarea";
import { currentRomanizedToken, replaceCurrentRomanizedToken, suggestWords } from "../../core/dictionary/suggestWords";
import { getSpellHints } from "../../core/dictionary/spellHints";
import { transliterateRomanized } from "../../core/transliteration/transliterateRomanized";
import type { Candidate, Suggestion } from "../../core/types";
import { SuggestionPanel } from "../dictionary/SuggestionPanel";
import { SpellHintPanel } from "../spell-hints/SpellHintPanel";
import { CandidateBar } from "./CandidateBar";
import { TransliterationTrace } from "./TransliterationTrace";

interface RomanizedEditorProps {
  onReport: (tool: "romanized", actual: string) => void;
}

const example = "NID form ko naam field\nsarkar ko suchana\nshrestha ra kshetra";

export function RomanizedEditor({ onReport }: RomanizedEditorProps) {
  const [input, setInput] = useState(example);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const result = useMemo(() => transliterateRomanized(input), [input]);
  const output = selectedCandidate?.normalizedText ?? result.normalizedOutput;
  const showTrace = import.meta.env.DEV || import.meta.env.VITE_SHOW_TRACE === "true";
  const romanizedPrefix = currentRomanizedToken(input);
  const suggestions = useMemo(() => suggestWords(romanizedPrefix, 7), [romanizedPrefix]);
  const hints = useMemo(() => getSpellHints(output), [output]);

  function handleSelectCandidate(candidate: Candidate) {
    setSelectedCandidate(candidate);
  }

  function handleSelectSuggestion(suggestion: Suggestion) {
    setInput((currentInput) => replaceCurrentRomanizedToken(currentInput, suggestion.romanized ?? suggestion.word));
    setSelectedCandidate(null);
  }

  return (
    <section className="romanized-layout" aria-label="Romanized Nepali typing editor">
      <div className="editor-panel">
        <div className="panel-heading">
          <div>
            <h2>Romanized Nepali typing beta</h2>
            <p>Type common Romanized Nepali. Candidates show ambiguity instead of hiding it.</p>
          </div>
          <span className="local-badge">Beta</span>
        </div>

        <Textarea
          label="Romanized input"
          hint="common-nepali profile"
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setSelectedCandidate(null);
          }}
          rows={10}
          spellCheck={false}
        />

        <CandidateBar candidates={result.candidates} onSelect={handleSelectCandidate} />

        <div className="action-row">
          <Button
            type="button"
            icon={<Wand2 size={16} aria-hidden="true" />}
            onClick={() => {
              setInput(example);
              setSelectedCandidate(null);
            }}
          >
            Try example
          </Button>
          <Button
            type="button"
            icon={<Eraser size={16} aria-hidden="true" />}
            onClick={() => {
              setInput("");
              setSelectedCandidate(null);
            }}
          >
            Clear
          </Button>
          <Button
            type="button"
            variant="ghost"
            icon={<FileWarning size={16} aria-hidden="true" />}
            onClick={() => onReport("romanized", output)}
          >
            Report bad typing
          </Button>
        </div>

        {showTrace ? <TransliterationTrace trace={result.trace} /> : null}
      </div>

      <div className="editor-panel editor-panel--output">
        <div className="panel-heading panel-heading--compact">
          <div>
            <h2>Unicode output</h2>
            <p>{selectedCandidate ? "Selected candidate" : "Default ranked output"}</p>
          </div>
          <CopyButton value={output} />
        </div>
        <Textarea
          label="Clean Unicode"
          value={output}
          onChange={() => undefined}
          rows={10}
          readOnly
          className="textarea--output"
        />
      </div>

      <div className="side-stack">
        <SuggestionPanel suggestions={suggestions} onSelect={handleSelectSuggestion} />
        <SpellHintPanel hints={hints} />
      </div>
    </section>
  );
}
