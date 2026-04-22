import Link from "next/link";
import { MagicLinkSignIn } from "@/components/MagicLinkSignIn";

const issueTypes = ["Water leak", "No hot water", "Appliance issue", "No heat", "Electrical issue"];

export default function Home() {
  return (
    <main className="mobile-landing">
      <section className="mobile-phone-shell">
        <div className="mobile-phone-frame">
          <div className="mobile-status-bar">
            <span>9:41</span>
            <span>Tenant app</span>
          </div>

          <div className="tenant-entry-hero">
            <div className="tenant-entry-badge">Fix it AI</div>
            <div className="mobile-welcome-card">
              <p className="mobile-label">Property maintenance made simple</p>
              <h1>Take a picture. We handle the repair flow.</h1>
              <p>
                Tenants report the problem in seconds. AI checks for safe next steps, then your property manager
                confirms anything that needs a vendor.
              </p>
            </div>
          </div>

          <MagicLinkSignIn />

          <div className="mobile-preview-card">
            <div className="mobile-preview-top">
              <div>
                <p className="mobile-label">What tenants do</p>
                <h2>One simple request flow</h2>
              </div>
              <Link className="mobile-chip-action" href="/app/issues/new">
                Preview
              </Link>
            </div>

            <div className="mobile-camera-preview">
              <div className="mobile-camera-glow" />
              <span>Open camera and snap the issue</span>
            </div>
          </div>

          <div className="mobile-type-strip">
            {issueTypes.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>

          <div className="tenant-entry-steps">
            <div className="mobile-step">
              <span>1</span>
              <p>Tenant logs in with a secure link from the property manager.</p>
            </div>
            <div className="mobile-step">
              <span>2</span>
              <p>They send a photo and one short note from their phone.</p>
            </div>
            <div className="mobile-step">
              <span>3</span>
              <p>AI checks urgency, helps safely if possible, or prepares the approval handoff.</p>
            </div>
          </div>

          <div className="tenant-entry-manager-card">
            <p className="mobile-label">For property teams</p>
            <h2>Managers approve the work before anyone is dispatched.</h2>
            <p>
              Contractors are ranked by approved status, reliability, and cost. The tenant gets updates without calling
              the office for every step.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
