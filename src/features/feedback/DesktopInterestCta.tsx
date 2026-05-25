import { MonitorDown } from "lucide-react";
import { Button } from "../../components/Button";

interface DesktopInterestCtaProps {
  onInterest: () => void;
}

export function DesktopInterestCta({ onInterest }: DesktopInterestCtaProps) {
  return (
    <div className="desktop-cta">
      <div>
        <h2>Want a desktop beta?</h2>
        <p>Week one is web/PWA only. Desktop interest helps decide whether a technical preview is worth building.</p>
      </div>
      <Button type="button" variant="primary" icon={<MonitorDown size={16} aria-hidden="true" />} onClick={onInterest}>
        Join interest list
      </Button>
    </div>
  );
}
