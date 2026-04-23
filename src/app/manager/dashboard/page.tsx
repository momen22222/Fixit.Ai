import Link from "next/link";
import { listIssueFeed } from "@/lib/services/issue-service";
import { listVendorDirectory } from "@/lib/services/vendor-service";

export const dynamic = "force-dynamic";

export default async function ManagerDashboardPage() {
  const [issues, vendors] = await Promise.all([listIssueFeed(), listVendorDirectory()]);
  const approvalNeeded = issues.filter((issue) => issue.status === "approval-needed");
  const scheduled = issues.filter((issue) => issue.status === "scheduled");
  const emergency = issues.filter((issue) => issue.urgencyLevel === "emergency");
  const latest = approvalNeeded[0] ?? issues[0];

  return (
    <section className="manager-screen">
      <div className="manager-hero">
        <div>
          <p className="eyebrow">Property manager</p>
          <h1>Maintenance operations</h1>
          <p>Review AI triage, approve vendors, and keep tenants updated from one work queue.</p>
        </div>
        <Link className="button button-primary" href="/manager/requests">
          Open request queue
        </Link>
      </div>

      <div className="manager-metric-grid">
        <article className="manager-metric-card">
          <span>{approvalNeeded.length}</span>
          <p>Need approval</p>
        </article>
        <article className="manager-metric-card">
          <span>{scheduled.length}</span>
          <p>Scheduled</p>
        </article>
        <article className="manager-metric-card">
          <span>{emergency.length}</span>
          <p>Urgent</p>
        </article>
        <article className="manager-metric-card">
          <span>{vendors.length}</span>
          <p>Approved vendors</p>
        </article>
      </div>

      <div className="manager-dashboard-grid">
        <section className="manager-panel manager-panel-strong">
          <p className="section-tag">Priority request</p>
          {latest ? (
            <>
              <h2>{latest.category}</h2>
              <p>{latest.aiTriage.managerSummary}</p>
              <div className="assistant-pills">
                <span className={`status-pill is-${latest.urgencyLevel}`}>{latest.urgencyLevel}</span>
                <span className={`status-pill is-${latest.status}`}>{latest.status}</span>
              </div>
              <Link className="button button-primary" href={`/manager/requests/${latest.id}`}>
                Review now
              </Link>
            </>
          ) : (
            <p>No maintenance requests yet.</p>
          )}
        </section>

        <section className="manager-panel">
          <p className="section-tag">Operating rule</p>
          <h2>AI prepares the handoff. Managers approve dispatch.</h2>
          <p>
            Tenants get simple guidance, but vendor scheduling stays gated by the property manager before a work order
            is confirmed.
          </p>
        </section>
      </div>
    </section>
  );
}
