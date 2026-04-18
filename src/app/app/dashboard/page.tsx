import Link from "next/link";
import { listIssues } from "@/lib/maintenance-data";

export default function DashboardPage() {
  const issues = listIssues();
  const activeIssue = issues[0];
  const recentIssue = issues[1];

  return (
    <section className="tenant-home">
      <div className="tenant-home-hero">
        <p className="tenant-home-kicker">Hello Maya</p>
        <h1>What do you need help with today?</h1>
        <p>
          This app is for one job: report the issue quickly, then track what AI and your manager are doing next.
        </p>
      </div>

      <Link className="tenant-request-card" href="/app/issues/new">
        <div className="tenant-request-visual">
          <div className="tenant-request-lens" />
        </div>
        <div className="tenant-request-copy">
          <p className="mobile-label">New request</p>
          <h2>Take a picture of the problem</h2>
          <p>Leaks, appliances, hot water, heat, electrical issues, and more.</p>
        </div>
      </Link>

      <section className="tenant-status-card">
        <div className="tenant-status-header">
          <div>
            <p className="mobile-label">Current request</p>
            <h2>{activeIssue.category}</h2>
          </div>
          <span className={`status-pill is-${activeIssue.status}`}>{activeIssue.status}</span>
        </div>
        <p>{activeIssue.aiTriage.managerSummary}</p>
        <div className="tenant-status-actions">
          <Link className="landing-primary" href={`/app/issues/${activeIssue.id}`}>
            View update
          </Link>
          <Link className="landing-secondary" href="/app/issues/new">
            Start another
          </Link>
        </div>
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
            <p>Reviewed your photo and checked for safe self-fix steps.</p>
          </div>
          <div className="tenant-timeline-item">
            <span>Mgr</span>
            <p>Prepared manager summary if the issue needs a contractor.</p>
          </div>
          <div className="tenant-timeline-item">
            <span>Last</span>
            <p>{recentIssue.category} was updated and scheduled previously.</p>
          </div>
        </div>
      </section>
    </section>
  );
}
