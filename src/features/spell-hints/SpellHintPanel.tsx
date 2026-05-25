import { BadgeAlert } from "lucide-react";
import type { SpellHint } from "../../core/types";

interface SpellHintPanelProps {
  hints: SpellHint[];
}

export function SpellHintPanel({ hints }: SpellHintPanelProps) {
  return (
    <aside className="side-panel" aria-label="Spell hints">
      <div className="side-panel__heading">
        <BadgeAlert size={16} aria-hidden="true" />
        <h3>Basic spell hints</h3>
      </div>
      {hints.length > 0 ? (
        <div className="hint-list">
          {hints.map((hint) => (
            <div className="hint-row" key={hint.normalizedToken}>
              <strong>{hint.label}</strong>
              <span>{hint.normalizedToken}</span>
              {hint.suggestions.length > 0 ? (
                <small>{hint.suggestions.map((suggestion) => suggestion.normalizedWord).join(" · ")}</small>
              ) : (
                <small>{hint.reason}</small>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="quiet-note">Known seed words are not flagged. This is not grammar correction.</p>
      )}
    </aside>
  );
}
