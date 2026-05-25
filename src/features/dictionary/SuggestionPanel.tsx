import { Search } from "lucide-react";
import type { Suggestion } from "../../core/types";

interface SuggestionPanelProps {
  suggestions: Suggestion[];
  onSelect: (suggestion: Suggestion) => void;
}

export function SuggestionPanel({ suggestions, onSelect }: SuggestionPanelProps) {
  return (
    <aside className="side-panel" aria-label="Local suggestions">
      <div className="side-panel__heading">
        <Search size={16} aria-hidden="true" />
        <h3>Local suggestions</h3>
      </div>
      {suggestions.length > 0 ? (
        <div className="suggestion-list">
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.normalizedWord}-${suggestion.romanized}-${suggestion.domain}-${index}`}
              type="button"
              className="suggestion-row"
              onClick={() => onSelect(suggestion)}
            >
              <span>{suggestion.normalizedWord}</span>
              <small>{suggestion.romanized} · {suggestion.domain}</small>
            </button>
          ))}
        </div>
      ) : (
        <p className="quiet-note">Start typing a word to see bundled seed suggestions.</p>
      )}
    </aside>
  );
}
