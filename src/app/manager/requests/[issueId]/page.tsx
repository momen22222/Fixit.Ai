import Image from "next/image";
import { notFound } from "next/navigation";
import { ManagerApprovalForm } from "@/components/ManagerApprovalForm";
import { getIssueDetail } from "@/lib/services/issue-service";
import { getUnitSummary, getVendorSummary } from "@/lib/services/property-service";

export const dynamic = "force-dynamic";

export default async function ManagerRequestDetailPage({
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
    <section className="manager-screen">
      <div className="manager-hero">
        <div>
          <p className="eyebrow">Manager review</p>
          <h1>{issue.category}</h1>
          <p>{issue.escalation?.managerSummary ?? issue.aiTriage.managerSummary}</p>
        </div>
        <div className="assistant-pills">
          <span className={`status-pill is-${issue.urgencyLevel}`}>{issue.urgencyLevel}</span>
          <span className={`status-pill is-${issue.status}`}>{issue.status}</span>
        </div>
      </div>

      <div className="manager-detail-grid">
        <section className="manager-panel manager-panel-strong">
          <p className="section-tag">Tenant and unit</p>
          <h2>{unit?.property?.name ?? "Property"}</h2>
          <p>Unit {unit?.label ?? issue.unitId}</p>
          <p>Availability: {issue.tenantAvailability}</p>
          <p>Permission to enter: {issue.permissionToEnter ? "Yes" : "No"}</p>
        </section>

        <section className="manager-panel">
          <p className="section-tag">Photo evidence</p>
          <h2>{issue.photos.length} uploaded photo{issue.photos.length === 1 ? "" : "s"}</h2>
          <div className="image-grid">
            {issue.photos.length ? (
              issue.photos.map((photo) => (
                <Image
                  alt={photo.name}
                  className="photo-thumb"
                  height={240}
                  key={photo.id}
                  src={photo.url}
                  width={360}
                />
              ))
            ) : (
              <p>No photo was attached.</p>
            )}
          </div>
        </section>
      </div>

      <section className="manager-panel">
        <p className="section-tag">Vendor recommendation</p>
        <div className="manager-vendor-grid">
          {await Promise.all(
            issue.vendorRecommendations.map(async (recommendation) => {
              const vendor = await getVendorSummary(recommendation.vendorId);

              return (
                <article className="manager-vendor-card" key={recommendation.vendorId}>
                  <div>
                    <p className="mobile-label">{recommendation.trade}</p>
                    <h2>{vendor?.companyName ?? recommendation.vendorId}</h2>
                  </div>
                  <p>{recommendation.reason}</p>
                  <div className="manager-vendor-facts">
                    <span>{recommendation.reliabilityScore} reliability</span>
                    <span>${recommendation.estimatedCost}</span>
                    <span>{recommendation.proposedWindow}</span>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      <section className="manager-panel">
        <p className="section-tag">AI conversation and tenant context</p>
        <h2>Know exactly what happened before approving work.</h2>
        <div className="manager-conversation-grid">
          <article className="manager-vendor-card">
            <p className="mobile-label">Tenant note</p>
            <h2>{issue.description}</h2>
            <p>Requested availability: {issue.tenantAvailability}</p>
          </article>
          <article className="manager-vendor-card">
            <p className="mobile-label">AI diagnosis</p>
            <h2>{issue.aiTriage.recommendedTrade}</h2>
            <p>{issue.aiTriage.managerSummary}</p>
          </article>
        </div>
        <div className="assistant-chat">
          {issue.messages.map((message) => (
            <div className={`assistant-bubble ${message.role === "tenant" ? "tenant" : "ai"}`} key={message.id}>
              {message.text}
            </div>
          ))}
        </div>
      </section>

      <section className="manager-panel">
        <p className="section-tag">Decision</p>
        <h2>Approve, modify, or reject before vendor dispatch.</h2>
        <ManagerApprovalForm issue={issue} />
      </section>
    </section>
  );
}
