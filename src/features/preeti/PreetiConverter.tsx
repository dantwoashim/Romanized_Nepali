import { AlertTriangle, Eraser, FileWarning, Wand2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../../components/Button";
import { CopyButton } from "../../components/CopyButton";
import { Textarea } from "../../components/Textarea";
import { convertPreeti } from "../../engine";
import type { EngineMode } from "../../engine/types";
import { preetiExamples } from "./preetiExamples";

interface PreetiConverterProps {
  onReport: (tool: "preeti", actual: string) => void;
}

export function PreetiConverter({ onReport }: PreetiConverterProps) {
  const [input, setInput] = useState(preetiExamples[0].input);
  const [mode, setMode] = useState<Extract<EngineMode, "preeti-mixed" | "preeti-strict">>("preeti-mixed");
  const result = useMemo(() => convertPreeti(input, { mode }), [input, mode]);
  const warnings = result.warnings.slice(0, 5);
  const mappedCount = result.tokens.filter((token) => !token.protected && token.input !== token.output).length;

  return (
    <section className="tool-grid" aria-label="Preeti to Unicode converter">
      <div className="editor-panel">
        <div className="panel-heading">
          <div>
            <h2>Still stuck converting old Preeti documents?</h2>
            <p>Paste old Nepali text into this validation converter. Get clean Unicode for review and copying.</p>
          </div>
          <span className="local-badge">Local</span>
        </div>

        <div className="mode-toggle" aria-label="Preeti conversion mode">
          <button
            type="button"
            className={mode === "preeti-mixed" ? "mode-toggle__item mode-toggle__item--active" : "mode-toggle__item"}
            onClick={() => setMode("preeti-mixed")}
          >
            Mixed document
          </button>
          <button
            type="button"
            className={mode === "preeti-strict" ? "mode-toggle__item mode-toggle__item--active" : "mode-toggle__item"}
            onClick={() => setMode("preeti-strict")}
          >
            Strict Preeti
          </button>
        </div>

        <Textarea
          label="Preeti text"
          hint="Font-encoded source text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          rows={9}
          spellCheck={false}
        />

        <div className="action-row">
          <Button
            type="button"
            icon={<Wand2 size={16} aria-hidden="true" />}
            onClick={() => setInput(preetiExamples[0].input)}
          >
            Try example
          </Button>
          <Button type="button" icon={<Eraser size={16} aria-hidden="true" />} onClick={() => setInput("")}>
            Clear
          </Button>
          <Button
            type="button"
            variant="ghost"
            icon={<FileWarning size={16} aria-hidden="true" />}
            onClick={() => onReport("preeti", result.normalizedOutput)}
          >
            Report bad conversion
          </Button>
        </div>
      </div>

      <div className="editor-panel editor-panel--output">
        <div className="panel-heading panel-heading--compact">
          <div>
            <h2>Unicode output</h2>
            <p>{mappedCount} converted text segment{mappedCount === 1 ? "" : "s"}. Output is normalized before copy; conversion is not perfect.</p>
          </div>
          <CopyButton value={result.normalizedOutput} />
        </div>

        <Textarea
          label="Clean Unicode"
          value={result.normalizedOutput}
          onChange={() => undefined}
          rows={9}
          readOnly
          className="textarea--output"
        />

        {warnings.length > 0 ? (
          <div className="warning-list" aria-label="Conversion warnings">
            {warnings.map((warning, index) => (
              <div className="warning-item" key={`${warning.code}-${warning.range?.join("-") ?? "global"}-${index}`}>
                <AlertTriangle size={16} aria-hidden="true" />
                <span>{warning.message}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="quiet-note">No uncertain mapping warnings for this sample.</p>
        )}
      </div>
    </section>
  );
}
