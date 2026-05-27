import type { ProofHint } from "../../engine/keyboard";

interface ProofHintPanelProps {
  hints: ProofHint[];
}

export function ProofHintPanel({ hints }: ProofHintPanelProps) {
  if (hints.length === 0) return null;

  return (
    <div className="keyboard-section" aria-label="Keyboard proof hints">
      <div className="keyboard-section__heading">
        <strong>Proof hints</strong>
        <span>{hints.length}</span>
      </div>
      <div className="hint-list">
        {hints.map((hint, index) => (
          <div className="hint-row" key={`${hint.original}-${hint.suggestion}-${index}`}>
            <span>{hint.original} → {hint.suggestion}</span>
            <small>{hint.type} · {hint.action} · {Math.round(hint.confidence * 100)}%</small>
            <small>{hint.explanation}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
