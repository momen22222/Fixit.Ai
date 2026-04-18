import Link from "next/link";
import { listIssues, units } from "@/lib/maintenance-data";

export default function ApprovalsPage() {
  const issues = listIssues().filter((issue) => issue.status === "approval-needed" || issue.status === "scheduled");

  return (
    <section className="page-stack">
      <div className="page-heading">
        <p className="eyebrow">Manager approvals</p>
        <h1>Review AI escalation summaries before a vendor is booked.</h1>
        <p>
          Reliability comes first, but a property manager still has the final word on who gets dispatched and when the
          visit happens.
        </p>
      </div>

      <div className="card-list">
        {issues.map((issue) => {
          const unit = units.find((item) => item.id === issue.unitId);

          return (
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
              <p>{issue.escalation?.managerSummary ?? issue.aiTriage.managerSummary}</p>
              <div className="detail-list-block">
                <p>Unit: {unit?.label}</p>
                <p>Recommended trade: {issue.aiTriage.recommendedTrade}</p>
                <p>Suggested vendor: {issue.vendorRecommendations[0]?.vendorId ?? "No vendor needed"}</p>
              </div>
              <div className="action-row">
                <Link className="button button-primary" href={`/app/manager/issues/${issue.id}`}>
                  Review issue
                </Link>
                <Link className="button button-secondary" href={`/app/issues/${issue.id}`}>
                  Tenant view
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
