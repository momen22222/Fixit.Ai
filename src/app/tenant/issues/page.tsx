import Link from "next/link";
import { listIssueFeed } from "@/lib/services/issue-service";

export const dynamic = "force-dynamic";

export default async function TenantIssuesPage() {
  const issues = await listIssueFeed();

  return (
    <section className="tenant-list-screen">
      <div className="tenant-flow-copy">
        <p className="tenant-home-kicker">Request status</p>
        <h1>Your maintenance history.</h1>
        <p>Every photo, AI note, manager decision, and appointment stays attached to the request.</p>
      </div>

      <div className="tenant-request-list">
        {issues.map((issue) => (
          <Link className="tenant-issue-row" href={`/tenant/issues/${issue.id}`} key={issue.id}>
            <div>
              <p className="mobile-label">{issue.createdAt.slice(0, 10)}</p>
              <h2>{issue.category}</h2>
              <p>{issue.description}</p>
            </div>
            <span className={`status-pill is-${issue.status}`}>{issue.status}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
