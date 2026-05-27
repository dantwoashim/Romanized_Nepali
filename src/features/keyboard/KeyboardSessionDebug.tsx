import type { CandidateUpdate } from "../../engine/keyboard";

interface KeyboardSessionDebugProps {
  update: CandidateUpdate;
}

export function KeyboardSessionDebug({ update }: KeyboardSessionDebugProps) {
  return (
    <div className="keyboard-debug" aria-label="Keyboard session debug">
      <div>
        <span>Composition</span>
        <strong>{update.compositionText || "empty"}</strong>
      </div>
      <div>
        <span>Display</span>
        <strong>{update.displayText || "empty"}</strong>
      </div>
      <div>
        <span>Confidence</span>
        <strong>{Math.round(update.confidence * 100)}%</strong>
      </div>
      <div>
        <span>Latency</span>
        <strong>{Math.round(update.latencyMs ?? 0)}ms</strong>
      </div>
    </div>
  );
}
