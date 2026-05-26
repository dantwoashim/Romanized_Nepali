import { MonitorDown } from "lucide-react";
import { Button } from "../../components/Button";

interface DesktopInterestCtaProps {
  onInterest: () => void;
}

export function DesktopInterestCta({ onInterest }: DesktopInterestCtaProps) {
  return (
    <div className="desktop-cta">
      <div>
        <h2>Desktop preview</h2>
        <p>Register interest for a future desktop utility.</p>
      </div>
      <Button type="button" variant="primary" icon={<MonitorDown size={16} aria-hidden="true" />} onClick={onInterest}>
        Register interest
      </Button>
    </div>
  );
}
