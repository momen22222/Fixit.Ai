import { getTenantAppContext } from "@/lib/services/property-service";

export const dynamic = "force-dynamic";

export default async function TenantProfilePage() {
  const context = await getTenantAppContext();

  return (
    <section className="tenant-detail-screen">
      <div className="tenant-detail-hero">
        <p className="tenant-home-kicker">Tenant profile</p>
        <h1>{context.tenantName}</h1>
        <p>{context.tenantEmail}</p>
      </div>

      <section className="tenant-status-card">
        <p className="mobile-label">Home details</p>
        <h2>{context.propertyName}</h2>
        <p>{context.propertyAddress || "Address will appear here when the tenant is fully invited."}</p>
        <p>{context.unitLabel}</p>
      </section>

      <section className="tenant-activity-card">
        <p className="mobile-label">Support promise</p>
        <h2>Only safe guidance. Manager approval before vendors.</h2>
        <p>
          Fix it AI can suggest simple, low-risk checks. If an issue is urgent or needs tools, your property manager
          reviews the handoff before dispatch.
        </p>
      </section>
    </section>
  );
}
