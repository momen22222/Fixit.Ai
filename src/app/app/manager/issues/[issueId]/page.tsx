import { notFound } from "next/navigation";
import Image from "next/image";
import { ManagerApprovalForm } from "@/components/ManagerApprovalForm";
import { getIssueDetail } from "@/lib/services/issue-service";
import { getUnitSummary, getVendorSummary } from "@/lib/services/property-service";

export default async function ManagerIssuePage({
  params
}: {
  params: Promise<{ issueId: string }>;
}) {
  const { issueId } = await params;
  const issue = await getIssueDetail(issueId);

  if (!issue) {
    notFound();
  }

  const unit = await getUnitSummary(issue.unitId);

  return (
    <section className="page-stack">
      <div className="page-heading">
        <p className="eyebrow">Manager review</p>
        <h1>{issue.category}</h1>
        <p>
          Confirm the summary, check the tenant notes, and approve or edit the recommended vendor appointment before
          dispatch.
        </p>
      </div>

      <div className="two-column-band">
        <article className="surface surface-strong">
          <div className="pill-row">
            <span className={`status-pill is-${issue.urgencyLevel}`}>{issue.urgencyLevel}</span>
            <span className={`status-pill is-${issue.status}`}>{issue.status}</span>
          </div>
          <div className="detail-list-block">
            <p>Unit: {unit?.label ?? issue.unitId}</p>
            <p>Tenant availability: {issue.tenantAvailability}</p>
            <p>Permission to enter: {issue.permissionToEnter ? "Yes" : "No"}</p>
          </div>
          <p>{issue.escalation?.managerSummary ?? issue.aiTriage.managerSummary}</p>
        </article>

        <article className="surface">
          <div className="section-copy">
            <p className="section-tag">Photo evidence</p>
            <h2>{issue.photos.length} uploaded photo{issue.photos.length === 1 ? "" : "s"}</h2>
          </div>
          <div className="image-grid">
            {issue.photos.map((photo) => (
              <Image
                alt={photo.name}
                className="photo-thumb"
                height={240}
                key={photo.id}
                src={photo.url}
                width={360}
              />
            ))}
          </div>
        </article>
      </div>

      <section className="surface">
        <div className="section-copy">
          <p className="section-tag">Recommended vendors</p>
          <h2>Reliability first, lowest qualified price second.</h2>
        </div>
        <div className="card-list">
          {await Promise.all(issue.vendorRecommendations.map(async (vendor) => {
            const vendorProfile = await getVendorSummary(vendor.vendorId);

            return (
              <article className="list-card" key={vendor.vendorId}>
                <div className="list-card-head">
                  <div>
                    <p className="mini-label">{vendor.trade}</p>
                    <h3>{vendorProfile?.companyName ?? vendor.vendorId}</h3>
                  </div>
                  <span className="status-pill is-approved">{vendor.reliabilityScore} reliability</span>
                </div>
                <div className="detail-list-block">
                  <p>Estimated cost: ${vendor.estimatedCost}</p>
                  <p>Proposed window: {vendor.proposedWindow}</p>
                  <p>{vendor.reason}</p>
                </div>
              </article>
            );
          }))}
        </div>
      </section>

      <section className="surface">
        <div className="section-copy">
          <p className="section-tag">Approve or adjust</p>
          <h2>Human approval is the final gate before dispatch.</h2>
        </div>
        <ManagerApprovalForm issue={issue} />
      </section>
    </section>
  );
}
