import type { KeyboardMode } from "../../engine/keyboard";

interface ModeSwitcherProps {
  mode: KeyboardMode;
  showLabels: boolean;
  onModeChange: (mode: KeyboardMode) => void;
  onToggleLabels: () => void;
}

export function ModeSwitcher({ mode, showLabels, onModeChange, onToggleLabels }: ModeSwitcherProps) {
  return (
    <div className="keyboard-mode-wrap">
      <div className="keyboard-mode-row" aria-label="Keyboard mode">
        {(["romanized", "traditional", "unicode-proofread", "diagnostic"] as KeyboardMode[]).map((item) => (
          <button
            key={item}
            type="button"
            className={item === mode ? "mode-chip mode-chip--active" : "mode-chip"}
            onClick={() => onModeChange(item)}
          >
            {labelFor(item)}
          </button>
        ))}
      </div>
      <label className="keyboard-toggle">
        <input type="checkbox" checked={showLabels} onChange={onToggleLabels} />
        <span>Romanized labels</span>
      </label>
    </div>
  );
}

function labelFor(mode: KeyboardMode): string {
  if (mode === "romanized") return "Romanized";
  if (mode === "traditional") return "Traditional";
  if (mode === "unicode-proofread") return "Proofread";
  return "Diagnostic";
}
