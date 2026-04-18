import { TenantIssueIntake } from "@/components/TenantIssueIntake";

export default function NewIssuePage() {
  return (
    <section className="tenant-flow-screen">
      <div className="tenant-flow-copy">
        <p className="tenant-home-kicker">New maintenance request</p>
        <h1>Show the problem and let AI take it from there.</h1>
        <p>You should be able to complete this with one hand while standing next to the issue.</p>
      </div>

      <TenantIssueIntake />
    </section>
  );
}
