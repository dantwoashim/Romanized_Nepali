import { Route } from "lucide-react";
import type { TokenTrace } from "../../core/types";

interface TransliterationTraceProps {
  trace: TokenTrace[];
}

export function TransliterationTrace({ trace }: TransliterationTraceProps) {
  if (trace.length === 0) return null;

  return (
    <details className="trace-box">
      <summary>
        <Route size={16} aria-hidden="true" />
        Trace
      </summary>
      <div className="trace-grid">
        {trace.slice(0, 24).map((item, index) => (
          <div className="trace-row" key={`${item.input}-${index}`}>
            <code>{item.input}</code>
            <span>{item.output}</span>
            <small>{item.rule}</small>
          </div>
        ))}
      </div>
    </details>
  );
}
