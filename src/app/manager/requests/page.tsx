import Link from "next/link";
import { listIssueFeed } from "@/lib/services/issue-service";
import { getUnitSummary, getVendorSummary } from "@/lib/services/property-service";

export const dynamic = "force-dynamic";

export default async function ManagerRequestsPage() {
  const issues = await listIssueFeed();
  const approvalNeeded = issues.filter((issue) => issue.status === "approval-needed");
  const scheduled = issues.filter((issue) => issue.status === "scheduled");
  const urgent = issues.filter((issue) => issue.urgencyLevel === "emergency" || issue.urgencyLevel === "priority");
  const sortedIssues = [...issues].sort((left, right) => {
    const statusWeight = (status: string) => (status === "approval-needed" ? 0 : status === "scheduled" ? 1 : 2);
    return statusWeight(left.status) - statusWeight(right.status);
  });

  return (
    <section className="manager-screen">
      <div className="manager-hero">
        <div>
          <p className="eyebrow">Request queue</p>
          <h1>Approve, adjust, or follow up.</h1>
          <p>Each request includes the tenant photo, AI summary, urgency, and best vendor recommendation.</p>
        </div>
      </div>

      <div className="manager-metric-grid">
        <article className="manager-metric-card">
          <span>{approvalNeeded.length}</span>
          <p>Need approval</p>
        </article>
        <article className="manager-metric-card">
          <span>{urgent.length}</span>
          <p>Priority or urgent</p>
        </article>
        <article className="manager-metric-card">
          <span>{scheduled.length}</span>
          <p>Scheduled work</p>
        </article>
        <article className="manager-metric-card">
          <span>{issues.length}</span>
          <p>Total requests</p>
        </article>
      </div>

      <section className="manager-panel manager-panel-strong">
        <p className="section-tag">Approval inbox</p>
        <h2>Start with requests that need a decision.</h2>
        <p>
          These are the items where Fix it AI has prepared the tenant context, AI summary, and vendor recommendation for
          your review.
        </p>
      </section>

      <div className="manager-request-table">
        {await Promise.all(
          sortedIssues.map(async (issue) => {
            const [unit, vendor] = await Promise.all([
              getUnitSummary(issue.unitId),
              issue.vendorRecommendations[0]
                ? getVendorSummary(issue.vendorRecommendations[0].vendorId)
                : Promise.resolve(undefined)
            ]);

            return (
              <Link className="manager-request-row" href={`/manager/requests/${issue.id}`} key={issue.id}>
                <div>
                  <p className="mobile-label">{unit?.property?.name ?? "Property"}</p>
                  <h2>{issue.category}</h2>
                  <p>
                    Unit {unit?.label ?? issue.unitId} / {vendor?.companyName ?? "No vendor selected yet"}
                  </p>
                </div>
                <div className="manager-row-status">
                  <span className={`status-pill is-${issue.urgencyLevel}`}>{issue.urgencyLevel}</span>
                  <span className={`status-pill is-${issue.status}`}>{issue.status}</span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
}
