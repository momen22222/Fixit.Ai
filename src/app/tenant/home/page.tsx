import Link from "next/link";
import { listIssueFeed } from "@/lib/services/issue-service";
import { getTenantAppContext } from "@/lib/services/property-service";

export const dynamic = "force-dynamic";

export default async function TenantHomePage() {
  const [issues, context] = await Promise.all([listIssueFeed(), getTenantAppContext()]);
  const activeIssue = issues[0];
  const activeCount = issues.filter((issue) => issue.status !== "completed" && issue.status !== "resolved").length;

  return (
    <section className="tenant-home-screen">
      <div className="tenant-hero-card">
        <p className="tenant-home-kicker">{context.propertyName}</p>
        <h1>Hi {context.tenantName.split(" ")[0]}, what needs fixing?</h1>
        <p>Take a photo, add one sentence, and we will guide the next step.</p>
        <Link className="tenant-primary-camera" href="/tenant/new-request">
          <span className="tenant-primary-camera-icon" />
          Report a problem
        </Link>
      </div>

      <div className="tenant-quick-grid">
        <article className="tenant-mini-stat">
          <span>{activeCount}</span>
          <p>Open requests</p>
        </article>
        <article className="tenant-mini-stat">
          <span>{context.unitLabel}</span>
          <p>Assigned unit</p>
        </article>
      </div>

      <section className="tenant-status-card">
        <div className="tenant-status-header">
          <div>
            <p className="mobile-label">Current request</p>
            <h2>{activeIssue?.category ?? "Nothing open right now"}</h2>
          </div>
          {activeIssue ? <span className={`status-pill is-${activeIssue.status}`}>{activeIssue.status}</span> : null}
        </div>
        <p>
          {activeIssue
            ? activeIssue.aiTriage.managerSummary
            : "If anything breaks, start a new request and the app will keep the whole history here."}
        </p>
        <div className="tenant-status-actions">
          {activeIssue ? (
            <Link className="landing-primary" href={`/tenant/issues/${activeIssue.id}`}>
              View status
            </Link>
          ) : null}
          <Link className="landing-secondary" href="/tenant/new-request">
            Start request
          </Link>
        </div>
      </section>

      <section className="tenant-activity-card">
        <div className="tenant-status-header">
          <div>
            <p className="mobile-label">What happens next</p>
            <h2>Simple updates, no chasing.</h2>
          </div>
        </div>
        <div className="tenant-timeline">
          <div className="tenant-timeline-item">
            <span>1</span>
            <p>AI checks if the issue is urgent or safe to troubleshoot.</p>
          </div>
          <div className="tenant-timeline-item">
            <span>2</span>
            <p>Your property manager reviews any vendor appointment before dispatch.</p>
          </div>
          <div className="tenant-timeline-item">
            <span>3</span>
            <p>You see appointment and completion updates in the request timeline.</p>
          </div>
        </div>
      </section>
    </section>
  );
}
