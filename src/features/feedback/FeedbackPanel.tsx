import { Mail, Send, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../../components/Button";
import { Textarea } from "../../components/Textarea";
import { buildFeedbackBody, type FeedbackDraft } from "./feedbackReport";

interface FeedbackPanelProps {
  initialTool: FeedbackDraft["tool"];
  initialActual: string;
}

const feedbackEmail = import.meta.env.VITE_FEEDBACK_EMAIL as string | undefined;

export function FeedbackPanel({ initialTool, initialActual }: FeedbackPanelProps) {
  const [draft, setDraft] = useState<FeedbackDraft>({
    tool: initialTool,
    workflow: "",
    expected: "",
    actual: initialActual,
    notes: "",
    contact: ""
  });
  const [copied, setCopied] = useState(false);
  const body = useMemo(() => buildFeedbackBody(draft), [draft]);
  const mailtoHref = feedbackEmail
    ? `mailto:${encodeURIComponent(feedbackEmail)}?subject=${encodeURIComponent("Lekh Assistant feedback")}&body=${encodeURIComponent(body)}`
    : "";

  useEffect(() => {
    setDraft((current) => ({
      ...current,
      tool: initialTool,
      actual: initialActual
    }));
  }, [initialTool, initialActual]);

  function updateField<K extends keyof FeedbackDraft>(key: K, value: FeedbackDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function copyReport() {
    await navigator.clipboard.writeText(body);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <section className="feedback-panel" aria-label="Feedback">
      <div className="panel-heading">
        <div>
          <h2>Feedback</h2>
          <p>Submit only examples you want reviewed. Private documents should stay out of feedback.</p>
        </div>
        <ShieldCheck size={22} aria-hidden="true" />
      </div>

      <div className="form-grid">
        <label className="select-field">
          <span>Tool</span>
          <select value={draft.tool} onChange={(event) => updateField("tool", event.target.value as FeedbackDraft["tool"])}>
            <option value="preeti">Preeti converter</option>
            <option value="romanized">Romanized typing</option>
            <option value="traditional">Traditional reference</option>
            <option value="desktop-interest">Desktop beta interest</option>
          </select>
        </label>
        <label className="input-field">
          <span>Workflow</span>
          <input
            value={draft.workflow}
            onChange={(event) => updateField("workflow", event.target.value)}
            placeholder="office form, old document, school record"
          />
        </label>
      </div>

      <Textarea
        label="Expected output"
        value={draft.expected}
        onChange={(event) => updateField("expected", event.target.value)}
        rows={3}
      />
      <Textarea
        label="Actual output"
        value={draft.actual}
        onChange={(event) => updateField("actual", event.target.value)}
        rows={3}
      />
      <Textarea
        label="Notes"
        value={draft.notes}
        onChange={(event) => updateField("notes", event.target.value)}
        rows={3}
      />
      <label className="input-field">
        <span>Optional contact</span>
        <input value={draft.contact} onChange={(event) => updateField("contact", event.target.value)} />
      </label>

      <div className="action-row">
        <Button type="button" icon={<Mail size={16} aria-hidden="true" />} onClick={copyReport}>
          {copied ? "Copied report" : "Copy report"}
        </Button>
        {feedbackEmail ? (
          <a className="button button--primary" href={mailtoHref}>
            <span className="button__icon"><Send size={16} aria-hidden="true" /></span>
            <span>Open email</span>
          </a>
        ) : null}
      </div>
    </section>
  );
}
