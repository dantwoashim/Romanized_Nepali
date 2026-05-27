import type { Candidate } from "../../engine/keyboard";

interface MemoryDebugPanelProps {
  lastCommit: string;
  memoryRecorded: boolean;
  followups: Candidate[];
}

export function MemoryDebugPanel({ lastCommit, memoryRecorded, followups }: MemoryDebugPanelProps) {
  if (!lastCommit && followups.length === 0) return null;

  return (
    <div className="keyboard-section" aria-label="Memory and followup status">
      <div className="keyboard-section__heading">
        <strong>Memory</strong>
        <span>{memoryRecorded ? "recorded" : "not recorded"}</span>
      </div>
      {lastCommit ? <p className="quiet-note">Committed: {lastCommit}</p> : null}
      {followups.length > 0 ? (
        <div className="followup-list" aria-label="Followup candidates">
          {followups.map((candidate) => (
            <span key={candidate.id}>{candidate.text}</span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
