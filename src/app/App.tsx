import { Keyboard, LayoutGrid, ShieldCheck, Type } from "lucide-react";
import { useState } from "react";
import { Tabs, type TabItem } from "../components/Tabs";
import { DesktopInterestCta } from "../features/feedback/DesktopInterestCta";
import { FeedbackPanel } from "../features/feedback/FeedbackPanel";
import type { FeedbackDraft } from "../features/feedback/feedbackReport";
import { TraditionalLayoutReference } from "../features/layout-reference/TraditionalLayoutReference";
import { PreetiConverter } from "../features/preeti/PreetiConverter";
import { RomanizedEditor } from "../features/romanized/RomanizedEditor";

type ToolTab = "preeti" | "romanized" | "traditional";

const tabs: TabItem<ToolTab>[] = [
  { id: "preeti", label: "Preeti", icon: <Type size={17} aria-hidden="true" /> },
  { id: "romanized", label: "Romanized", icon: <Keyboard size={17} aria-hidden="true" /> },
  { id: "traditional", label: "Traditional", icon: <LayoutGrid size={17} aria-hidden="true" /> }
];

export function App() {
  const [activeTab, setActiveTab] = useState<ToolTab>("preeti");
  const [feedback, setFeedback] = useState<{ tool: FeedbackDraft["tool"]; actual: string }>({
    tool: "preeti",
    actual: ""
  });
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  function openFeedback(tool: FeedbackDraft["tool"], actual: string) {
    setFeedback({ tool, actual });
    setFeedbackOpen(true);
    window.requestAnimationFrame(() => {
      const feedbackPanel = document.getElementById("feedback");
      if (typeof feedbackPanel?.scrollIntoView === "function") {
        feedbackPanel.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  return (
    <main className="app-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Lekh home">
          <img src="/icons/lekh-icon.svg" alt="" />
          <span>Lekh</span>
        </a>
        <div className="privacy-chip">
          <ShieldCheck size={16} aria-hidden="true" />
          <span>Local</span>
        </div>
      </header>

      <section className="hero-band">
        <div className="hero-copy">
          <h1>Nepali text, clean Unicode.</h1>
          <p>Preeti conversion, Romanized typing, local suggestions.</p>
        </div>
        <div className="hero-panel" aria-label="Workspace summary">
          <span>Preeti → Unicode</span>
          <span>Romanized → नेपाली</span>
          <span>Text stays local</span>
        </div>
      </section>

      <section className="tool-band" aria-label="Typing tools">
        <div className="tool-toolbar">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          <span className="toolbar-note">No automatic upload</span>
        </div>
        {activeTab === "preeti" ? <PreetiConverter onReport={openFeedback} /> : null}
        {activeTab === "romanized" ? <RomanizedEditor onReport={openFeedback} /> : null}
        {activeTab === "traditional" ? <TraditionalLayoutReference /> : null}
      </section>

      <DesktopInterestCta onInterest={() => openFeedback("desktop-interest", "Interested in a technical desktop preview.")} />

      <details
        id="feedback"
        className="feedback-band"
        open={feedbackOpen}
        onToggle={(event) => setFeedbackOpen(event.currentTarget.open)}
      >
        <summary>Feedback</summary>
        <FeedbackPanel initialTool={feedback.tool} initialActual={feedback.actual} />
      </details>

      <footer className="site-footer">
        <span>Lekh</span>
        <a href="/THIRD_PARTY_NOTICES.txt">Third-party notices</a>
      </footer>
    </main>
  );
}
