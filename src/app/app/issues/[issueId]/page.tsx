import Link from "next/link";
import { notFound } from "next/navigation";
import { getIssueDetail } from "@/lib/services/issue-service";
import { getUnitSummary, getVendorSummary } from "@/lib/services/property-service";

export default async function IssueDetailPage({
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
    <section className="page-stack">
      <div className="page-heading">
        <p className="eyebrow">Tenant status</p>
        <h1>{issue.category}</h1>
        <p>
          Track the issue from AI triage through manager review and vendor booking without needing to retell the same
          story.
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
            <p>Availability: {issue.tenantAvailability}</p>
            <p>Permission to enter: {issue.permissionToEnter ? "Yes" : "No"}</p>
          </div>
          <p>{issue.aiTriage.managerSummary}</p>
        </article>

        <article className="surface">
          <div className="section-copy">
            <p className="section-tag">Appointment status</p>
            <h2>{vendor ? vendor.companyName : "Awaiting manager approval"}</h2>
            <p>{issue.appointmentProposal?.proposedWindow ?? "The manager has not approved a vendor visit yet."}</p>
          </div>
          <div className="action-row">
            <Link className="button button-primary" href="/app/issues/new">
              Report another issue
            </Link>
            <Link className="button button-secondary" href="/app/dashboard">
              Back home
            </Link>
          </div>
        </article>
      </div>

      <section className="surface">
        <div className="section-copy">
          <p className="section-tag">Conversation and AI guidance</p>
          <h2>Everything stays attached to the issue.</h2>
        </div>
        <div className="assistant-chat">
          {issue.messages.map((message) => (
            <div className={`assistant-bubble ${message.role === "tenant" ? "tenant" : "ai"}`} key={message.id}>
              {message.text}
            </div>
          ))}
        </div>
      </section>

      <section className="surface">
        <div className="section-copy">
          <p className="section-tag">Safe steps</p>
          <h2>DIY guidance is limited to low-risk checks.</h2>
        </div>
        <ul className="detail-list">
          {issue.aiTriage.diySteps.map((step) => (
            <li key={step.id}>
              <strong>{step.title}:</strong> {step.detail}
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
