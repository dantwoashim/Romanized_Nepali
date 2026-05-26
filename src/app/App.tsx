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
  { id: "preeti", label: "Preeti → Unicode", icon: <Type size={17} aria-hidden="true" /> },
  { id: "romanized", label: "Romanized", icon: <Keyboard size={17} aria-hidden="true" /> },
  { id: "traditional", label: "Traditional", icon: <LayoutGrid size={17} aria-hidden="true" /> }
];

export function App() {
  const [activeTab, setActiveTab] = useState<ToolTab>("preeti");
  const [feedback, setFeedback] = useState<{ tool: FeedbackDraft["tool"]; actual: string }>({
    tool: "preeti",
    actual: ""
  });

  function openFeedback(tool: FeedbackDraft["tool"], actual: string) {
    setFeedback({ tool, actual });
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
        <a className="brand" href="/" aria-label="Lekh Assistant home">
          <img src="/icons/lekh-icon.svg" alt="" />
          <span>Lekh Assistant</span>
        </a>
        <div className="privacy-chip">
          <ShieldCheck size={16} aria-hidden="true" />
          <span>Typing stays in your browser</span>
        </div>
      </header>

      <section className="hero-band">
        <div className="hero-copy">
          <h1>Preeti to clean Unicode, then Romanized Nepali typing.</h1>
          <p>
            A privacy-first web/PWA validation prototype for desktop workflows. No native keyboard claims, no server
            text processing, no cloud proofreading.
          </p>
        </div>
        <div className="privacy-note">
          Lekh Assistant does not send typed text, converted text, dictionary queries, raw keystrokes, clipboard
          content, spell tokens, or output to a server.
        </div>
      </section>

      <section className="tool-band" aria-label="Typing tools">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        {activeTab === "preeti" ? <PreetiConverter onReport={openFeedback} /> : null}
        {activeTab === "romanized" ? <RomanizedEditor onReport={openFeedback} /> : null}
        {activeTab === "traditional" ? <TraditionalLayoutReference /> : null}
      </section>

      <DesktopInterestCta onInterest={() => openFeedback("desktop-interest", "Interested in a technical desktop preview.")} />

      <section id="feedback" className="feedback-band">
        <FeedbackPanel initialTool={feedback.tool} initialActual={feedback.actual} />
      </section>

      <footer className="site-footer">
        <span>Local validation prototype.</span>
        <a href="/THIRD_PARTY_NOTICES.txt">Third-party notices</a>
      </footer>
    </main>
  );
}
