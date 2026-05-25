import type { Candidate } from "../../core/types";

interface CandidateBarProps {
  candidates: Candidate[];
  onSelect: (candidate: Candidate) => void;
}

export function CandidateBar({ candidates, onSelect }: CandidateBarProps) {
  if (candidates.length === 0) return null;

  return (
    <div className="candidate-bar" aria-label="Romanized candidates">
      {candidates.slice(0, 8).map((candidate, index) => (
        <button
          key={`${candidate.normalizedText}-${candidate.reason}-${candidate.source}-${index}`}
          type="button"
          className="candidate-chip"
          onClick={() => onSelect(candidate)}
          title={candidate.reason}
        >
          <span>{candidate.normalizedText}</span>
          <small>{candidate.source}</small>
        </button>
      ))}
    </div>
  );
}
