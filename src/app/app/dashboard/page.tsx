import Link from "next/link";
import { listIssues, listVendors, notificationStore, properties, workOrderStore } from "@/lib/maintenance-data";

export default function DashboardPage() {
  const issues = listIssues();
  const pendingApprovals = issues.filter((issue) => issue.status === "approval-needed");
  const resolvedIssues = issues.filter((issue) => issue.status === "resolved");
  const scheduledIssues = issues.filter((issue) => issue.status === "scheduled");
  const property = properties[0];

  return (
    <section className="page-stack">
      <div className="page-heading">
        <p className="eyebrow">Operations dashboard</p>
        <h1>Property maintenance, triage, and scheduling in one queue.</h1>
        <p>
          This dashboard blends tenant intake, AI triage, manager approval, and vendor dispatch so the team can move
          from report to scheduled work without losing context.
        </p>
      </div>

      <div className="triple-grid">
        <article className="surface">
          <p className="section-tag">Pending approvals</p>
          <h2>{pendingApprovals.length}</h2>
          <p>Issues waiting on a property manager to confirm the vendor and appointment window.</p>
        </article>
        <article className="surface">
          <p className="section-tag">Scheduled work</p>
          <h2>{scheduledIssues.length}</h2>
          <p>Jobs already approved and booked with the selected subcontractor.</p>
        </article>
        <article className="surface">
          <p className="section-tag">Vendor network</p>
          <h2>{listVendors().length}</h2>
          <p>Approved local vendors ranked by reliability first, then price.</p>
        </article>
      </div>

      <div className="two-column-band">
        <article className="surface surface-strong">
          <div className="section-copy">
            <p className="section-tag">Property snapshot</p>
            <h2>{property.name}</h2>
            <p>
              {property.address}, {property.city}, {property.state} {property.postalCode}
            </p>
          </div>
          <div className="detail-list-block">
            <p>Open notifications: {notificationStore.length}</p>
            <p>Active work orders: {workOrderStore.length}</p>
            <p>Resolved by tenant self-service: {resolvedIssues.length}</p>
          </div>
        </article>

        <article className="surface">
          <div className="section-copy">
            <p className="section-tag">Next actions</p>
            <h2>Move the queue forward.</h2>
          </div>
          <div className="action-column">
            <Link className="button button-primary" href="/app/issues/new">
              Start tenant issue intake
            </Link>
            <Link className="button button-secondary" href="/app/manager/approvals">
              Review approval queue
            </Link>
            <Link className="button button-secondary" href="/app/manager/vendors">
              Open vendor directory
            </Link>
          </div>
        </article>
      </div>

      <section className="surface">
        <div className="section-copy">
          <p className="section-tag">Recent issues</p>
          <h2>Every issue keeps the tenant conversation, AI output, and dispatch recommendation together.</h2>
        </div>

        <div className="card-list">
          {issues.slice(0, 4).map((issue) => (
            <article className="list-card" key={issue.id}>
              <div className="list-card-head">
                <div>
                  <p className="mini-label">{issue.id}</p>
                  <h3>{issue.category}</h3>
                </div>
                <div className="pill-row">
                  <span className={`status-pill is-${issue.urgencyLevel}`}>{issue.urgencyLevel}</span>
                  <span className={`status-pill is-${issue.status}`}>{issue.status}</span>
                </div>
              </div>
              <p>{issue.aiTriage.managerSummary}</p>
              <div className="action-row">
                <Link className="text-link" href={`/app/issues/${issue.id}`}>
                  Tenant status
                </Link>
                <Link className="text-link" href={`/app/manager/issues/${issue.id}`}>
                  Manager review
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
