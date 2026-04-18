import Link from "next/link";
import { notFound } from "next/navigation";
import { getIssueById, getVendorById, units } from "@/lib/maintenance-data";

export default async function IssueDetailPage({
  params
}: {
  params: Promise<{ issueId: string }>;
}) {
  const { issueId } = await params;
  const issue = getIssueById(issueId);

  if (!issue) {
    notFound();
  }

  const unit = units.find((item) => item.id === issue.unitId);
  const vendor = issue.appointmentProposal ? getVendorById(issue.appointmentProposal.vendorId) : undefined;

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
            <p>Unit: {unit?.label}</p>
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
            <Link className="button button-secondary" href={`/app/manager/issues/${issue.id}`}>
              View manager review
            </Link>
          </div>
        </article>
      </div>

      <section className="surface">
        <div className="section-copy">
          <p className="section-tag">Conversation and AI guidance</p>
          <h2>Everything stays attached to the issue.</h2>
        </div>
        <div className="message-stack">
          {issue.messages.map((message) => (
            <div className={`message-bubble ${message.role === "tenant" ? "tenant" : "assistant"}`} key={message.id}>
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
