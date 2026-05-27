import type { DictionaryResult } from "../../engine/keyboard";

interface DictionaryPanelProps {
  rows: DictionaryResult[];
}

export function DictionaryPanel({ rows }: DictionaryPanelProps) {
  if (rows.length === 0) {
    return <p className="quiet-note">No local dictionary match.</p>;
  }

  return (
    <div className="dictionary-list" aria-label="Dictionary results">
      {rows.map((row) => (
        <div className="dictionary-row" key={`${row.word}-${row.source ?? "local"}`}>
          <span>{row.word}</span>
          {row.romanized?.length ? <small>{row.romanized.join(", ")}</small> : null}
          {row.domains?.length ? <small>{row.domains.join(", ")}</small> : null}
          <small>{row.source ?? "local"} · {Math.round(row.confidence * 100)}%</small>
        </div>
      ))}
    </div>
  );
}
