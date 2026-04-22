import { properties, tenants, units, getVendorById as getMockVendorById } from "@/lib/maintenance-data";
import { resolveDataMode } from "@/lib/app-config";
import { getCurrentSessionUser } from "@/lib/services/auth-service";
import { listVendorDirectory } from "@/lib/services/vendor-service";
import { getSupabaseServiceClient } from "@/lib/supabase/client";

export async function getUnitSummary(unitId: string) {
  if (resolveDataMode() === "supabase") {
    const supabase = getSupabaseServiceClient();

    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }

    const { data, error } = await supabase
      .from("units")
      .select("id, property_id, label, floor, bedrooms, properties(*)")
      .eq("id", unitId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return undefined;
    }

    const property = Array.isArray(data.properties) ? data.properties[0] : data.properties;

    return {
      id: data.id,
      propertyId: data.property_id,
      label: data.label,
      floor: data.floor ?? "",
      bedrooms: data.bedrooms ?? 0,
      property: property
        ? {
            id: property.id,
            name: property.name,
            address: property.address,
            city: property.city,
            state: property.state,
            postalCode: property.postal_code
          }
        : undefined
    };
  }

  const unit = units.find((item) => item.id === unitId);

  if (!unit) {
    return undefined;
  }

  const property = properties.find((item) => item.id === unit.propertyId);

  return {
    ...unit,
    property
  };
}

export async function getVendorSummary(vendorId: string) {
  if (resolveDataMode() === "mock") {
    return getMockVendorById(vendorId);
  }

  const vendors = await listVendorDirectory();
  return vendors.find((vendor) => vendor.id === vendorId);
}

export async function getTenantAppContext() {
  if (resolveDataMode() === "supabase") {
    const supabase = getSupabaseServiceClient();

    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }

    const { data, error } = await supabase
      .from("units")
      .select("id, label, properties(*)")
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    const property = data?.properties ? (Array.isArray(data.properties) ? data.properties[0] : data.properties) : undefined;

    return {
      tenantName: "Tenant",
      tenantEmail: "tenant@example.com",
      unitId: data?.id ?? "",
      propertyName: property?.name ?? "Your property",
      unitLabel: data?.label ? `Unit ${data.label}` : "Assigned unit",
      propertyAddress: property
        ? `${property.address}, ${property.city}, ${property.state} ${property.postal_code}`
        : ""
    };
  }

  const session = await getCurrentSessionUser();
  const fallbackTenant = tenants.find((item) => item.id === session.id) ?? tenants[0];
  const unit = session.unitId ? units.find((item) => item.id === session.unitId) : undefined;
  const property = session.propertyId ? properties.find((item) => item.id === session.propertyId) : undefined;

  return {
    tenantName: fallbackTenant?.name ?? "Tenant",
    tenantEmail: session.email,
    unitId: session.unitId ?? fallbackTenant?.unitId ?? "unit-3c",
    propertyName: property?.name ?? "Assigned property",
    unitLabel: unit?.label ?? "Assigned unit",
    propertyAddress: property ? `${property.address}, ${property.city}, ${property.state} ${property.postalCode}` : ""
  };
}
