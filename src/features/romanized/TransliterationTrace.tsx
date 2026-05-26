import { Route } from "lucide-react";
import type { ConversionTrace } from "../../engine/types";

interface TransliterationTraceProps {
  trace?: ConversionTrace;
}

export function TransliterationTrace({ trace }: TransliterationTraceProps) {
  if (!trace || trace.steps.length === 0) return null;

  return (
    <details className="trace-box">
      <summary>
        <Route size={16} aria-hidden="true" />
        Trace
      </summary>
      <div className="trace-grid">
        {trace.steps.slice(0, 24).map((item, index) => (
          <div className="trace-row" key={`${item.name}-${index}`}>
            <code>{item.name}</code>
            <span>{item.message}</span>
            <small>{item.data ? JSON.stringify(item.data) : "engine"}</small>
          </div>
        ))}
      </div>
    </details>
  );
}
