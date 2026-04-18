import { TenantIssueIntake } from "@/components/TenantIssueIntake";

export default function NewIssuePage() {
  return (
    <section className="page-stack">
      <div className="page-heading">
        <p className="eyebrow">Tenant issue flow</p>
        <h1>Capture the issue once, then let AI decide whether it is safe to self-fix or ready for dispatch.</h1>
        <p>
          This intake route is designed for a phone-sized screen first, with camera upload, short answers, and a clear
          path into the manager review queue.
        </p>
      </div>

      <TenantIssueIntake />
    </section>
  );
}
