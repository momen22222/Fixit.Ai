import Link from "next/link";
import { listIssues, listVendors, notificationStore, properties } from "@/lib/maintenance-data";

const workflowSteps = [
  {
    tag: "1. Tenant intake",
    title: "Photo-first issue capture on a phone",
    text: "Tenants submit a maintenance problem with photos, a plain-language description, availability, and permission-to-enter details."
  },
  {
    tag: "2. AI triage",
    title: "Safe self-service before a truck roll",
    text: "The app classifies urgency, blocks dangerous repair advice, and offers only low-risk checks using simple tools."
  },
  {
    tag: "3. Manager review",
    title: "Reliable vendor recommendation before booking",
    text: "If the issue is not resolved, the system prepares a manager summary, ranks approved vendors by reliability first, then price, and proposes the best slot."
  }
];

export default function Home() {
  const issues = listIssues();
  const pendingApprovals = issues.filter((issue) => issue.status === "approval-needed").length;
  const scheduled = issues.filter((issue) => issue.status === "scheduled").length;
  const urgent = issues.filter((issue) => issue.urgencyLevel === "emergency" || issue.urgencyLevel === "priority").length;
  const property = properties[0];

  return (
    <main className="marketing-shell">
      <section className="hero-panel-large">
        <div className="hero-copy">
          <p className="eyebrow">FieldFix PM</p>
          <h1>Maintenance triage, vendor dispatch, and manager approval in one mobile-first workflow.</h1>
          <p className="lede">
            Built for property managers who want faster issue resolution, safer tenant guidance, and cleaner handoff to
            approved subcontractors.
          </p>
          <div className="action-row">
            <Link className="button button-primary" href="/app/issues/new">
              Report a maintenance issue
            </Link>
            <Link className="button button-secondary" href="/app/manager/approvals">
              Open manager approvals
            </Link>
          </div>
          <div className="metric-grid">
            <div className="metric-card">
              <strong>{pendingApprovals}</strong>
              <span>approval-ready issues</span>
            </div>
            <div className="metric-card">
              <strong>{scheduled}</strong>
              <span>scheduled work orders</span>
            </div>
            <div className="metric-card">
              <strong>{urgent}</strong>
              <span>priority or urgent cases</span>
            </div>
          </div>
        </div>

        <div className="hero-stack">
          <article className="surface surface-strong">
            <p className="section-tag">Live property snapshot</p>
            <h2>{property.name}</h2>
            <p>
              {property.address}, {property.city}, {property.state} {property.postalCode}
            </p>
            <div className="detail-list-block">
              <p>Approved vendors: {listVendors().length}</p>
              <p>Unread notifications: {notificationStore.length}</p>
              <p>Human approval required before any vendor booking</p>
            </div>
          </article>

          <article className="surface alert-surface">
            <p className="section-tag">Why teams use it</p>
            <h2>Lower-cost dispatch with safer tenant guidance.</h2>
            <p>
              The AI only suggests simple, low-risk checks. Unsafe cases bypass self-help and go directly to the
              manager queue with a summary and ranked vendor options.
            </p>
          </article>
        </div>
      </section>

      <section className="triple-grid">
        {workflowSteps.map((step) => (
          <article className="surface" key={step.title}>
            <p className="section-tag">{step.tag}</p>
            <h2>{step.title}</h2>
            <p>{step.text}</p>
          </article>
        ))}
      </section>

      <section className="two-column-band">
        <article className="surface">
          <div className="section-copy">
            <p className="section-tag">Tenant path</p>
            <h2>From photo upload to issue status.</h2>
            <p>
              Invite-only tenant access keeps every issue tied to the correct property and unit while still feeling
              lightweight on a phone.
            </p>
          </div>
          <div className="message-stack">
            <div className="message-bubble tenant">The dishwasher is still full of water after the cycle.</div>
            <div className="message-bubble assistant">
              I will walk you through a safe reset, then prepare a manager-ready summary if it still needs a vendor.
            </div>
          </div>
        </article>

        <article className="surface">
          <div className="section-copy">
            <p className="section-tag">Manager path</p>
            <h2>AI summary, cheapest qualified vendor, final human sign-off.</h2>
            <p>
              Approval screens show the issue, photo evidence, tenant availability, ranked vendors, and the proposed
              appointment window before anything gets booked.
            </p>
          </div>
          <div className="detail-list-block">
            <p>Reliability-first ranking across approved vendors</p>
            <p>Manager can approve, reject, or modify the appointment</p>
            <p>Tenant, vendor, and manager all receive in-app plus SMS or email updates</p>
          </div>
        </article>
      </section>
    </main>
  );
}
