import { BookOpen, RotateCcw, Send, SquareX, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Textarea } from "../../components/Textarea";
import {
  createKeyboardEngine,
  defaultTypingContext,
  type Candidate,
  type CandidateUpdate,
  type DictionaryResult,
  type KeyboardMode
} from "../../engine/keyboard";
import { CandidatePanel } from "./CandidatePanel";
import { DictionaryPanel } from "./DictionaryPanel";
import { KeyboardSessionDebug } from "./KeyboardSessionDebug";
import { MemoryDebugPanel } from "./MemoryDebugPanel";
import { ModeSwitcher } from "./ModeSwitcher";
import { ProofHintPanel } from "./ProofHintPanel";

const EXAMPLE = "swasthya karyalaya";

export function KeyboardLab() {
  const engine = useMemo(() => createKeyboardEngine(), []);
  const [mode, setMode] = useState<KeyboardMode>("romanized");
  const [showLabels, setShowLabels] = useState(false);
  const [secureInput, setSecureInput] = useState(false);
  const [sessionId, setSessionId] = useState(() => engine.beginSession(defaultTypingContext("romanized")));
  const [input, setInput] = useState(EXAMPLE);
  const [lastCommit, setLastCommit] = useState("");
  const [lastMemoryRecorded, setLastMemoryRecorded] = useState(false);
  const [followups, setFollowups] = useState<Candidate[]>([]);
  const [dictionaryQuery, setDictionaryQuery] = useState("swasthya");
  const [dictionaryRows, setDictionaryRows] = useState<DictionaryResult[]>(() =>
    engine.lookupDictionary("swasthya", defaultTypingContext("dictionary-lookup"))
  );
  const [update, setUpdate] = useState<CandidateUpdate>(() => engine.updateComposition(sessionId, EXAMPLE, EXAMPLE.length));

  function contextFor(nextMode: KeyboardMode) {
    return {
      ...defaultTypingContext(nextMode),
      activeDomains: nextMode === "romanized" ? ["government"] : [],
      showRomanizedLabels: showLabels,
      preserveEnglish: true,
      secureInput
    };
  }

  function restart(nextMode = mode, nextShowLabels = showLabels, nextSecureInput = secureInput) {
    engine.endSession(sessionId);
    const nextContext = {
      ...defaultTypingContext(nextMode),
      activeDomains: nextMode === "romanized" ? ["government"] : [],
      showRomanizedLabels: nextShowLabels,
      preserveEnglish: true,
      secureInput: nextSecureInput
    };
    const nextSessionId = engine.beginSession(nextContext);
    setSessionId(nextSessionId);
    setInput(nextMode === "traditional" ? "स्वा" : EXAMPLE);
    setLastCommit("");
    setLastMemoryRecorded(false);
    setFollowups([]);
    setUpdate(engine.updateComposition(nextSessionId, nextMode === "traditional" ? "स्वा" : EXAMPLE, nextMode === "traditional" ? 3 : EXAMPLE.length));
  }

  function changeMode(nextMode: KeyboardMode) {
    setMode(nextMode);
    restart(nextMode);
  }

  function toggleLabels() {
    const next = !showLabels;
    setShowLabels(next);
    restart(mode, next, secureInput);
  }

  function toggleSecureInput() {
    const next = !secureInput;
    setSecureInput(next);
    restart(mode, showLabels, next);
  }

  function updateInput(value: string) {
    setInput(value);
    setUpdate(engine.updateComposition(sessionId, value, value.length));
  }

  function commitCandidate(candidate: Candidate) {
    const result = engine.commitCandidate(sessionId, candidate.id);
    if (candidate.type === "romanized-helper") {
      setLastCommit("");
      setLastMemoryRecorded(false);
      setFollowups([]);
      setInput(candidate.text);
      setUpdate(engine.updateComposition(sessionId, candidate.text, candidate.text.length));
      return;
    }
    setLastCommit(result.committedText);
    setLastMemoryRecorded(result.memoryRecorded);
    setFollowups(result.followupCandidates ?? []);
    setInput("");
    setUpdate(engine.updateComposition(sessionId, "", 0));
  }

  function commitRaw() {
    const result = engine.commitRaw(sessionId);
    setLastCommit(result.committedText);
    setLastMemoryRecorded(result.memoryRecorded);
    setFollowups(result.followupCandidates ?? []);
    setInput("");
    setUpdate(engine.updateComposition(sessionId, "", 0));
  }

  function cancel() {
    engine.cancelComposition(sessionId);
    setInput("");
    setUpdate(engine.updateComposition(sessionId, "", 0));
  }

  function lookupDictionary() {
    setDictionaryRows(engine.lookupDictionary(dictionaryQuery, contextFor("dictionary-lookup")));
  }

  const helperCandidates = update.candidates.filter((candidate) => candidate.type === "romanized-helper");
  const primaryCandidates = update.candidates.filter((candidate) => candidate.type !== "romanized-helper");

  return (
    <section className="keyboard-lab-layout" aria-label="Keyboard Lab">
      <div className="editor-panel keyboard-lab-panel">
        <div className="panel-heading">
          <div>
            <h2>Keyboard Lab</h2>
            <p>Keyboard Lab validates the engine. The final product is native Windows/macOS IME.</p>
          </div>
          <span className="local-badge">Session</span>
        </div>

        <ModeSwitcher
          mode={mode}
          showLabels={showLabels}
          secureInput={secureInput}
          onModeChange={changeMode}
          onToggleLabels={toggleLabels}
          onToggleSecureInput={toggleSecureInput}
        />

        <Textarea
          label="Active composition"
          hint={mode === "traditional" ? "Traditional mapping pending audit" : "Browser/web-lab updateComposition path"}
          value={input}
          onChange={(event) => updateInput(event.target.value)}
          rows={5}
          spellCheck={false}
        />

        <KeyboardSessionDebug update={update} />

        <CandidatePanel candidates={primaryCandidates} onCommit={commitCandidate} />

        {helperCandidates.length > 0 ? (
          <div className="keyboard-section">
            <div className="keyboard-section__heading">
              <strong>Romanized helper lane</strong>
              <span>Refines composition</span>
            </div>
            <CandidatePanel candidates={helperCandidates} onCommit={commitCandidate} />
          </div>
        ) : null}

        <div className="action-row">
          <Button type="button" icon={<Send size={16} aria-hidden="true" />} onClick={commitRaw}>
            Commit raw
          </Button>
          <Button type="button" icon={<SquareX size={16} aria-hidden="true" />} onClick={cancel}>
            Cancel
          </Button>
          <Button type="button" variant="ghost" icon={<RotateCcw size={16} aria-hidden="true" />} onClick={() => restart()}>
            New session
          </Button>
          <Button type="button" variant="ghost" icon={<Zap size={16} aria-hidden="true" />} onClick={() => engine.warm({ timeoutMs: 50 })}>
            Warm
          </Button>
        </div>

        <div className="safety-strip" aria-label="Keyboard lab status">
          <span className="safety-pill">{update.surface}</span>
          <span className="safety-pill">{update.candidates.length} candidates</span>
          <span className="safety-pill">{update.proofHints.length} proof hints</span>
          <span className={secureInput ? "safety-pill safety-pill--warn" : "safety-pill"}>{secureInput ? "secure simulation" : "normal field"}</span>
          <span className={update.warnings.length > 0 ? "safety-pill safety-pill--warn" : "safety-pill"}>{update.warnings.length} warnings</span>
        </div>

        {lastCommit ? <p className="quiet-note">Last commit: {lastCommit}</p> : null}
        <MemoryDebugPanel lastCommit={lastCommit} memoryRecorded={lastMemoryRecorded} followups={followups} />
        <ProofHintPanel hints={update.proofHints} />

        {mode === "traditional" ? (
          <div className="warning-list" aria-label="Traditional audit warning">
            <div className="warning-item">
              <span>Traditional layout mapping pending source-of-truth audit; Unicode suggestions are available.</span>
            </div>
          </div>
        ) : null}

        {update.warnings.length > 0 ? (
          <div className="warning-list" aria-label="Keyboard warnings">
            {update.warnings.map((warning, index) => (
              <div className="warning-item" key={`${warning}-${index}`}>
                <span>{warning}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <aside className="side-panel keyboard-side-panel" aria-label="Keyboard dictionary">
        <div className="side-panel__heading">
          <BookOpen size={17} aria-hidden="true" />
          <h3>Dictionary</h3>
        </div>
        <div className="keyboard-lookup-row">
          <Input
            label="Lookup"
            value={dictionaryQuery}
            onChange={(event) => setDictionaryQuery(event.target.value)}
            spellCheck={false}
          />
          <Button type="button" variant="secondary" icon={<BookOpen size={16} aria-hidden="true" />} onClick={lookupDictionary}>
            Lookup
          </Button>
        </div>
        <DictionaryPanel rows={dictionaryRows} />
      </aside>
    </section>
  );
}
