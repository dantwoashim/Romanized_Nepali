import { Eraser, FileWarning, Trash2, Wand2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../../components/Button";
import { CopyButton } from "../../components/CopyButton";
import { Textarea } from "../../components/Textarea";
import { currentRomanizedToken, replaceCurrentRomanizedToken, suggestWords } from "../../core/dictionary/suggestWords";
import { getSpellHints, getSpellHintsWithHunspell } from "../../core/dictionary/spellHints";
import { clearLocalCorrections, loadLocalCorrections, recordLocalCorrection } from "../../core/transliteration/localCorrectionMemory";
import type { SpellHint, Suggestion } from "../../core/types";
import { convertRomanized } from "../../engine";
import type { Candidate } from "../../engine/types";
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
  const [correctionVersion, setCorrectionVersion] = useState(0);
  const localCorrections = useMemo(() => loadLocalCorrections(), [correctionVersion]);
  const result = useMemo(
    () => convertRomanized(input, { mode: "romanized-mixed", localCorrections }),
    [input, localCorrections]
  );
  const output = selectedCandidate?.normalizedText ?? result.normalizedOutput;
  const showTrace = import.meta.env.DEV || import.meta.env.VITE_SHOW_TRACE === "true";
  const romanizedPrefix = currentRomanizedToken(input);
  const suggestions = useMemo(() => suggestWords(romanizedPrefix, 7), [romanizedPrefix]);
  const seedHints = useMemo(() => getSpellHints(output), [output]);
  const [hints, setHints] = useState<SpellHint[]>(seedHints);
  const [spellStatus, setSpellStatus] = useState<"checking" | "ready">("checking");

  useEffect(() => {
    let cancelled = false;
    let timeoutId: number | undefined;
    setHints(seedHints);
    if (seedHints.length === 0) {
      setSpellStatus("ready");
      return () => {
        cancelled = true;
      };
    }

    setSpellStatus("checking");
    timeoutId = window.setTimeout(() => {
      getSpellHintsWithHunspell(output)
        .then((nextHints) => {
          if (!cancelled) {
            setHints(nextHints);
            setSpellStatus("ready");
          }
        })
        .catch(() => {
          if (!cancelled) setSpellStatus("ready");
        });
    }, 250);

    return () => {
      cancelled = true;
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [output, seedHints]);

  function handleSelectCandidate(candidate: Candidate) {
    setSelectedCandidate(candidate);
    if (candidate.normalizedText !== result.normalizedOutput) {
      recordLocalCorrection(input, candidate.normalizedText);
      setCorrectionVersion((version) => version + 1);
    }
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
            <h2>Romanized typing</h2>
            <p>Type Romanized Nepali. Pick the output that matches your intent.</p>
          </div>
          <span className="local-badge">Preview</span>
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

        <CandidateBar candidates={result.alternatives} onSelect={handleSelectCandidate} />

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
          <Button
            type="button"
            variant="ghost"
            icon={<Trash2 size={16} aria-hidden="true" />}
            onClick={() => {
              clearLocalCorrections();
              setCorrectionVersion((version) => version + 1);
              setSelectedCandidate(null);
            }}
          >
            Clear local learning
          </Button>
        </div>

        {result.warnings.length > 0 ? (
          <div className="warning-list" aria-label="Romanized conversion warnings">
            {result.warnings.slice(0, 4).map((warning, index) => (
              <div className="warning-item" key={`${warning.code}-${index}`}>
                <span>{warning.message}</span>
              </div>
            ))}
          </div>
        ) : null}

        {showTrace ? <TransliterationTrace trace={result.trace} /> : null}
      </div>

      <div className="editor-panel editor-panel--output">
        <div className="panel-heading panel-heading--compact">
          <div>
            <h2>Unicode output</h2>
            <p>{selectedCandidate ? "Selected candidate" : "Ranked output"}</p>
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
        <SpellHintPanel hints={hints} isChecking={spellStatus === "checking"} />
      </div>
    </section>
  );
}
