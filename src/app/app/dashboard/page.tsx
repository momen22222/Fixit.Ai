import Link from "next/link";
import { listIssueFeed } from "@/lib/services/issue-service";
import { getTenantAppContext } from "@/lib/services/property-service";

export default async function DashboardPage() {
  const [issues, context] = await Promise.all([listIssueFeed(), getTenantAppContext()]);
  const activeIssue = issues[0];
  const recentIssue = issues[1];

  return (
    <section className="tenant-home">
      <div className="tenant-home-hero">
        <p className="tenant-home-kicker">{context.propertyName}</p>
        <h1>Hi {context.tenantName.split(" ")[0]}, what needs attention?</h1>
        <p>
          Report a problem in under a minute, then track what AI, your property team, and the vendor are doing next.
        </p>
      </div>

      <Link className="tenant-request-card" href="/app/issues/new">
        <div className="tenant-request-visual">
          <div className="tenant-request-lens" />
        </div>
        <div className="tenant-request-copy">
          <p className="mobile-label">New request</p>
          <h2>Take a picture of the problem</h2>
          <p>{context.unitLabel} is already attached, so you only need a photo and a short note.</p>
        </div>
      </Link>

      <section className="tenant-status-card">
        <div className="tenant-status-header">
          <div>
            <p className="mobile-label">Current request</p>
            <h2>{activeIssue?.category ?? "No active request"}</h2>
          </div>
          {activeIssue ? <span className={`status-pill is-${activeIssue.status}`}>{activeIssue.status}</span> : null}
        </div>
        {activeIssue ? (
          <>
            <p>{activeIssue.aiTriage.managerSummary}</p>
            <div className="tenant-status-actions">
              <Link className="landing-primary" href={`/app/issues/${activeIssue.id}`}>
                View update
              </Link>
              <Link className="landing-secondary" href="/app/issues/new">
                Start another
              </Link>
            </div>
          </>
        ) : (
          <p>No maintenance requests are open right now. If something breaks, start with a photo.</p>
        )}
      </section>

      <section className="tenant-activity-card">
        <div className="tenant-status-header">
          <div>
            <p className="mobile-label">Recent activity</p>
            <h2>What the app is doing for you</h2>
          </div>
        </div>
        <div className="tenant-timeline">
          <div className="tenant-timeline-item">
            <span>AI</span>
            <p>Reviews the photo, checks urgency, and only suggests safe low-risk steps.</p>
          </div>
          <div className="tenant-timeline-item">
            <span>Mgr</span>
            <p>Gets a summary and confirms any contractor appointment before work is booked.</p>
          </div>
          <div className="tenant-timeline-item">
            <span>Last</span>
            <p>{recentIssue ? `${recentIssue.category} was updated recently.` : "You will see updates here after you submit a request."}</p>
          </div>
        </div>
      </section>
    </section>
  );
}
