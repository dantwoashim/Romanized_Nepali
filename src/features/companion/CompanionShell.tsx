import { Activity, BookOpen, Database, EyeOff, Keyboard, Settings, ShieldCheck, Wrench } from "lucide-react";
import type { ReactNode } from "react";
import { companionPages, defaultCompanionSettings } from "./settings";

const statusRows = [
  ["Keyboard engine", "Web-lab prototype ready"],
  ["Native Windows", "TSF proof spike pending Prompt 3"],
  ["Native macOS", "IMK/XPC proof spike pending Prompt 3"],
  ["Traditional layout", "Physical keymap pending LTK audit"],
  ["Privacy", "No typed-text upload, no hidden telemetry"]
] as const;

const diagnostics = [
  "Daemon status placeholder",
  "IPC health placeholder",
  "Benchmark report link placeholder",
  "Redacted diagnostic export placeholder"
] as const;

export function CompanionShell() {
  return (
    <section className="companion-layout" aria-label="Companion app MVP shell">
      <div className="editor-panel companion-hero-panel">
        <div className="panel-heading">
          <div>
            <h2>Companion MVP Shell</h2>
            <p>Settings, privacy, dictionary, memory, diagnostics, and Preeti side utility. This shell is not the IME.</p>
          </div>
          <span className="local-badge">Scaffold</span>
        </div>

        <div className="companion-status-grid">
          {statusRows.map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="companion-grid">
        <CompanionCard
          icon={<Keyboard size={17} aria-hidden="true" />}
          title="Typing Settings"
          rows={[
            `Default mode: ${defaultCompanionSettings.defaultMode}`,
            `Romanized helpers: ${defaultCompanionSettings.enableRomanizedHelpers ? "on" : "off"}`,
            `Romanized labels: ${defaultCompanionSettings.showRomanizedLabels ? "on" : "off"}`,
            "Traditional physical layout waits for verified audit data"
          ]}
        />
        <CompanionCard
          icon={<BookOpen size={17} aria-hidden="true" />}
          title="Dictionary Manager"
          rows={[
            "Offline lookup for canonical spelling and aliases",
            "Meanings remain unavailable until a safe licensed source exists",
            "Personal word add/prefer/never-suggest controls are scaffolded"
          ]}
        />
        <CompanionCard
          icon={<Database size={17} aria-hidden="true" />}
          title="Personal Memory"
          rows={[
            "Local correction memory can boost accepted candidates",
            "Pinned entries can win when safe",
            "Never-suggest blocks known unwanted spellings",
            "Secure input disables memory writes"
          ]}
        />
        <CompanionCard
          icon={<ShieldCheck size={17} aria-hidden="true" />}
          title="Privacy"
          rows={[
            "No global key hook in the companion",
            "No foreground-text reading",
            "No network for normal typing",
            "Export/import/reset controls remain local"
          ]}
        />
        <CompanionCard
          icon={<Activity size={17} aria-hidden="true" />}
          title="Diagnostics"
          rows={diagnostics}
        />
        <CompanionCard
          icon={<Wrench size={17} aria-hidden="true" />}
          title="Document Tools"
          rows={[
            "Preeti converter remains a side utility",
            "Advanced mixed-document repair stays deferred",
            "Keyboard features remain the core product"
          ]}
        />
      </div>

      <aside className="side-panel companion-page-list" aria-label="Companion pages">
        <div className="side-panel__heading">
          <Settings size={17} aria-hidden="true" />
          <h3>Planned Pages</h3>
        </div>
        <div className="companion-page-grid">
          {companionPages.map((page) => (
            <span key={page}>{page}</span>
          ))}
        </div>
        <p className="quiet-note">
          <EyeOff size={14} aria-hidden="true" />
          Companion app controls settings and diagnostics; native TSF/IMK remains the production keystroke path.
        </p>
      </aside>
    </section>
  );
}

interface CompanionCardProps {
  icon: ReactNode;
  title: string;
  rows: readonly string[];
}

function CompanionCard({ icon, title, rows }: CompanionCardProps) {
  return (
    <article className="companion-card">
      <div>
        {icon}
        <h3>{title}</h3>
      </div>
      <ul>
        {rows.map((row) => (
          <li key={row}>{row}</li>
        ))}
      </ul>
    </article>
  );
}
