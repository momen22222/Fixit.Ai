import { ManagerTenantInviteForm } from "@/components/ManagerTenantInviteForm";
import { listManagerProperties } from "@/lib/services/property-service";

export const dynamic = "force-dynamic";

export default async function ManagerTenantsPage() {
  const properties = await listManagerProperties();
  const unitCount = properties.reduce((count, property) => count + property.units.length, 0);

  return (
    <section className="manager-screen">
      <div className="manager-hero">
        <div>
          <p className="eyebrow">Tenants</p>
          <h1>Tenant onboarding</h1>
          <p>Create unit-specific invite links so tenants land in the correct property and unit after signup.</p>
        </div>
      </div>

      <div className="manager-metric-grid">
        <article className="manager-metric-card">
          <span>{properties.length}</span>
          <p>Properties</p>
        </article>
        <article className="manager-metric-card">
          <span>{unitCount}</span>
          <p>Units available</p>
        </article>
        <article className="manager-metric-card">
          <span>14</span>
          <p>Invite days valid</p>
        </article>
        <article className="manager-metric-card">
          <span>1</span>
          <p>Unit per invite</p>
        </article>
      </div>

      <section className="manager-panel">
        {unitCount ? (
          <ManagerTenantInviteForm properties={properties} />
        ) : (
          <>
            <p className="section-tag">Setup needed</p>
            <h2>Add units before inviting tenants</h2>
            <p>Go to Properties, create a property, and add units. Then return here to generate tenant invite links.</p>
          </>
        )}
      </section>
    </section>
  );
}
