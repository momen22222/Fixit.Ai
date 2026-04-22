import Link from "next/link";
import { notFound } from "next/navigation";
import { getIssueDetail } from "@/lib/services/issue-service";
import { getUnitSummary, getVendorSummary } from "@/lib/services/property-service";

export const dynamic = "force-dynamic";

const statusSteps = ["Submitted", "AI reviewed", "Manager review", "Vendor scheduled", "Completed"];

export default async function TenantIssueDetailPage({
  params
}: {
  params: Promise<{ issueId: string }>;
}) {
  const { issueId } = await params;
  const issue = await getIssueDetail(issueId);

  if (!issue) {
    notFound();
  }

  const [unit, vendor] = await Promise.all([
    getUnitSummary(issue.unitId),
    issue.appointmentProposal ? getVendorSummary(issue.appointmentProposal.vendorId) : Promise.resolve(undefined)
  ]);

  return (
    <section className="tenant-detail-screen">
      <div className="tenant-detail-hero">
        <p className="tenant-home-kicker">{unit?.property?.name ?? "Maintenance request"}</p>
        <h1>{issue.category}</h1>
        <div className="assistant-pills">
          <span className={`status-pill is-${issue.urgencyLevel}`}>{issue.urgencyLevel}</span>
          <span className={`status-pill is-${issue.status}`}>{issue.status}</span>
        </div>
      </div>

      <section className="tenant-status-card">
        <p className="mobile-label">Status timeline</p>
        <div className="tenant-progress-list">
          {statusSteps.map((step, index) => (
            <div className="tenant-progress-step" key={step}>
              <span>{index + 1}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="tenant-status-card">
        <p className="mobile-label">Latest update</p>
        <h2>{vendor ? `${vendor.companyName} proposed` : "Manager review pending"}</h2>
        <p>{issue.appointmentProposal?.proposedWindow ?? issue.aiTriage.managerSummary}</p>
      </section>

      <section className="tenant-activity-card">
        <p className="mobile-label">AI guidance</p>
        <div className="tenant-timeline">
          {issue.aiTriage.safetyInstructions.map((instruction) => (
            <div className="tenant-timeline-item" key={instruction}>
              <span>!</span>
              <p>{instruction}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="tenant-activity-card">
        <p className="mobile-label">Conversation</p>
        <div className="assistant-chat">
          {issue.messages.map((message) => (
            <div className={`assistant-bubble ${message.role === "tenant" ? "tenant" : "ai"}`} key={message.id}>
              {message.text}
            </div>
          ))}
        </div>
      </section>

      <Link className="landing-secondary" href="/tenant/issues">
        Back to all requests
      </Link>
    </section>
  );
}
