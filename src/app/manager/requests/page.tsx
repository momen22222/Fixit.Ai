import Link from "next/link";
import { listIssueFeed } from "@/lib/services/issue-service";
import { getUnitSummary, getVendorSummary } from "@/lib/services/property-service";

export const dynamic = "force-dynamic";

export default async function ManagerRequestsPage() {
  const issues = await listIssueFeed();

  return (
    <section className="manager-screen">
      <div className="manager-hero">
        <div>
          <p className="eyebrow">Request queue</p>
          <h1>Approve, adjust, or follow up.</h1>
          <p>Each request includes the tenant photo, AI summary, urgency, and best vendor recommendation.</p>
        </div>
      </div>

      <div className="manager-request-table">
        {await Promise.all(
          issues.map(async (issue) => {
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
                  <p>Unit {unit?.label ?? issue.unitId} · {vendor?.companyName ?? "No vendor selected yet"}</p>
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
