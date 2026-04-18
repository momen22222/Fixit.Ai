import { TenantIssueIntake } from "@/components/TenantIssueIntake";

export default function NewIssuePage() {
  return (
    <section className="tenant-page">
      <div className="tenant-page-copy">
        <p className="landing-kicker">Tenant request</p>
        <h1>Take a picture and tell us what is wrong.</h1>
        <p>
          Keep this screen simple enough for a tenant to use while standing in front of the problem on their phone.
          The AI should do the hard part after the photo is submitted.
        </p>
      </div>

      <TenantIssueIntake />
    </section>
  );
}
