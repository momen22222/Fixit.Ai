import { getTenantAppContext } from "@/lib/services/property-service";

export const dynamic = "force-dynamic";

export default async function ManagerPropertiesPage() {
  const context = await getTenantAppContext();

  return (
    <section className="manager-screen">
      <div className="manager-hero">
        <div>
          <p className="eyebrow">Properties</p>
          <h1>Portfolio setup.</h1>
          <p>Version 1 starts with one seeded property. Next, managers can add buildings, units, and tenant invites.</p>
        </div>
      </div>

      <section className="manager-panel manager-panel-strong">
        <p className="section-tag">Active property</p>
        <h2>{context.propertyName}</h2>
        <p>{context.propertyAddress || "Address is stored in Supabase when seeded."}</p>
        <p>{context.unitLabel} is available for demo tenant testing.</p>
      </section>
    </section>
  );
}
