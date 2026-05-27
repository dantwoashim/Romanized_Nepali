import type { Candidate } from "../../engine/keyboard";

interface CandidatePanelProps {
  candidates: Candidate[];
  onCommit: (candidate: Candidate) => void;
}

export function CandidatePanel({ candidates, onCommit }: CandidatePanelProps) {
  if (candidates.length === 0) return null;

  return (
    <div className="candidate-panel" aria-label="Keyboard candidates">
      {candidates.slice(0, 8).map((candidate) => (
        <button
          key={candidate.id}
          type="button"
          className={candidate.type === "romanized-helper" ? "candidate-chip candidate-chip--helper" : "candidate-chip"}
          onClick={() => onCommit(candidate)}
          title={candidate.reason.join("; ")}
        >
          <span>{candidate.text}</span>
          {candidate.label ? <em>{candidate.label}</em> : null}
          <small>
            {candidate.shortcut ? `${candidate.shortcut} · ` : ""}
            {candidate.type} · {Math.round(candidate.confidence * 100)}%
          </small>
          {candidate.reason.length > 0 ? <small>{candidate.reason.join(" · ")}</small> : null}
        </button>
      ))}
    </div>
  );
}
