import { TenantMaintenanceChat } from "@/components/TenantMaintenanceChat";
import { getTenantAppContext } from "@/lib/services/property-service";

export const dynamic = "force-dynamic";

export default async function TenantHomePage() {
  const context = await getTenantAppContext();

  return (
    <TenantMaintenanceChat
      defaultUnitId={context.unitId}
      propertyName={context.propertyName}
      unitLabel={context.unitLabel}
    />
  );
}
