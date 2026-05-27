import { RotateCcw, Send, SquareX, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../../components/Button";
import { Textarea } from "../../components/Textarea";
import { createKeyboardEngine, defaultTypingContext, type Candidate, type CandidateUpdate, type KeyboardMode } from "../../engine/keyboard";
import { KeyboardSessionDebug } from "./KeyboardSessionDebug";

const EXAMPLE = "swasthya karyalaya";

export function KeyboardLab() {
  const engine = useMemo(() => createKeyboardEngine(), []);
  const [mode, setMode] = useState<KeyboardMode>("romanized");
  const [sessionId, setSessionId] = useState(() => engine.beginSession(defaultTypingContext("romanized")));
  const [input, setInput] = useState(EXAMPLE);
  const [lastCommit, setLastCommit] = useState("");
  const [update, setUpdate] = useState<CandidateUpdate>(() => engine.updateComposition(sessionId, EXAMPLE, EXAMPLE.length));

  function restart(nextMode = mode) {
    engine.endSession(sessionId);
    const nextSessionId = engine.beginSession(defaultTypingContext(nextMode));
    setSessionId(nextSessionId);
    setInput(nextMode === "traditional" ? "ka" : EXAMPLE);
    setLastCommit("");
    setUpdate(engine.updateComposition(nextSessionId, nextMode === "traditional" ? "ka" : EXAMPLE, nextMode === "traditional" ? 2 : EXAMPLE.length));
  }

  function changeMode(nextMode: KeyboardMode) {
    setMode(nextMode);
    restart(nextMode);
  }

  function updateInput(value: string) {
    setInput(value);
    setUpdate(engine.updateComposition(sessionId, value, value.length));
  }

  function commitCandidate(candidate: Candidate) {
    const result = engine.commitCandidate(sessionId, candidate.id);
    setLastCommit(result.committedText);
    setInput("");
    setUpdate(engine.updateComposition(sessionId, "", 0));
  }

  function commitRaw() {
    const result = engine.commitRaw(sessionId);
    setLastCommit(result.committedText);
    setInput("");
    setUpdate(engine.updateComposition(sessionId, "", 0));
  }

  function cancel() {
    engine.cancelComposition(sessionId);
    setInput("");
    setUpdate(engine.updateComposition(sessionId, "", 0));
  }

  return (
    <section className="keyboard-lab-layout" aria-label="Keyboard Lab">
      <div className="editor-panel keyboard-lab-panel">
        <div className="panel-heading">
          <div>
            <h2>Keyboard Lab</h2>
            <p>Simulate the session API before native Windows/macOS integration.</p>
          </div>
          <span className="local-badge">Session</span>
        </div>

        <div className="keyboard-mode-row" aria-label="Keyboard mode">
          {(["romanized", "traditional", "diagnostic"] as KeyboardMode[]).map((item) => (
            <button
              key={item}
              type="button"
              className={item === mode ? "mode-chip mode-chip--active" : "mode-chip"}
              onClick={() => changeMode(item)}
            >
              {item === "romanized" ? "Romanized" : item === "traditional" ? "Traditional" : "Diagnostic"}
            </button>
          ))}
        </div>

        <Textarea
          label="Active composition"
          hint={mode === "traditional" ? "Traditional mapping pending audit" : "Browser/web-lab updateComposition path"}
          value={input}
          onChange={(event) => updateInput(event.target.value)}
          rows={5}
          spellCheck={false}
        />

        <KeyboardSessionDebug update={update} />

        {update.candidates.length > 0 ? (
          <div className="candidate-bar" aria-label="Keyboard candidates">
            {update.candidates.slice(0, 8).map((candidate) => (
              <button
                key={candidate.id}
                type="button"
                className="candidate-chip"
                onClick={() => commitCandidate(candidate)}
                title={candidate.reason.join("; ")}
              >
                <span>{candidate.text}</span>
                <small>{candidate.type} · {Math.round(candidate.confidence * 100)}%</small>
              </button>
            ))}
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
          <span className={update.warnings.length > 0 ? "safety-pill safety-pill--warn" : "safety-pill"}>{update.warnings.length} warnings</span>
        </div>

        {lastCommit ? <p className="quiet-note">Last commit: {lastCommit}</p> : null}

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
    </section>
  );
}
