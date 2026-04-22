import { TenantIssueIntake } from "@/components/TenantIssueIntake";
import { getTenantAppContext } from "@/lib/services/property-service";

export const dynamic = "force-dynamic";

export default async function TenantNewRequestPage() {
  const context = await getTenantAppContext();

  return (
    <section className="tenant-flow-screen">
      <div className="tenant-flow-copy">
        <p className="tenant-home-kicker">New maintenance request</p>
        <h1>Show the problem. AI handles the next step.</h1>
        <p>Use this while standing next to the issue. One photo and one sentence is enough to start.</p>
      </div>

      <TenantIssueIntake
        defaultUnitId={context.unitId}
        propertyName={context.propertyName}
        unitLabel={context.unitLabel}
        propertyAddress={context.propertyAddress}
        propertyCity={context.propertyCity}
        propertyState={context.propertyState}
        propertyPostalCode={context.propertyPostalCode}
      />
    </section>
  );
}
