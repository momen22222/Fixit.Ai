import { properties, tenants, units, getVendorById as getMockVendorById } from "@/lib/maintenance-data";
import { resolveDataMode } from "@/lib/app-config";
import { getCurrentSessionUser } from "@/lib/services/auth-service";
import { listVendorDirectory } from "@/lib/services/vendor-service";
import { getSupabaseServiceClient } from "@/lib/supabase/client";
import { type Property, type PropertyInput, type PropertyWithUnits, type Unit, type UnitInput } from "@/lib/maintenance-types";

let mockProperties = [...properties];
let mockUnits = [...units];

function mapPropertyRow(row: {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
}): Property {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    city: row.city,
    state: row.state,
    postalCode: row.postal_code
  };
}

function mapUnitRow(row: {
  id: string;
  property_id: string;
  label: string;
  floor: string | null;
  bedrooms: number | null;
}): Unit {
  return {
    id: row.id,
    propertyId: row.property_id,
    label: row.label,
    floor: row.floor ?? "",
    bedrooms: row.bedrooms ?? 0
  };
}

export async function listManagerProperties(): Promise<PropertyWithUnits[]> {
  if (resolveDataMode() === "supabase") {
    const supabase = getSupabaseServiceClient();

    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }

    const [{ data: propertyRows, error: propertyError }, { data: unitRows, error: unitError }] = await Promise.all([
      supabase.from("properties").select("*").order("name"),
      supabase.from("units").select("*").order("label")
    ]);

    if (propertyError || unitError) {
      throw new Error(propertyError?.message ?? unitError?.message ?? "Unable to load properties.");
    }

    const mappedUnits = (unitRows ?? []).map(mapUnitRow);

    return (propertyRows ?? []).map((row) => {
      const property = mapPropertyRow(row);
      return {
        ...property,
        units: mappedUnits.filter((unit) => unit.propertyId === property.id)
      };
    });
  }

  return mockProperties.map((property) => ({
    ...property,
    units: mockUnits.filter((unit) => unit.propertyId === property.id)
  }));
}

export async function createManagerProperty(input: PropertyInput) {
  if (resolveDataMode() === "supabase") {
    const supabase = getSupabaseServiceClient();

    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }

    const { data, error } = await supabase
      .from("properties")
      .insert({
        name: input.name,
        address: input.address,
        city: input.city,
        state: input.state,
        postal_code: input.postalCode
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapPropertyRow(data);
  }

  const property: Property = {
    id: `prop-${input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
    ...input
  };
  mockProperties = [property, ...mockProperties];
  return property;
}

export async function createManagerUnit(input: UnitInput) {
  if (resolveDataMode() === "supabase") {
    const supabase = getSupabaseServiceClient();

    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }

    const { data, error } = await supabase
      .from("units")
      .insert({
        property_id: input.propertyId,
        label: input.label,
        floor: input.floor,
        bedrooms: input.bedrooms
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapUnitRow(data);
  }

  const unit: Unit = {
    id: `unit-${input.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
    propertyId: input.propertyId,
    label: input.label,
    floor: input.floor,
    bedrooms: input.bedrooms
  };
  mockUnits = [unit, ...mockUnits];
  return unit;
}

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
      propertyCity: property?.city ?? "",
      propertyState: property?.state ?? "",
      propertyPostalCode: property?.postal_code ?? "",
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
    propertyCity: property?.city ?? "",
    propertyState: property?.state ?? "",
    propertyPostalCode: property?.postalCode ?? "",
    propertyAddress: property ? `${property.address}, ${property.city}, ${property.state} ${property.postalCode}` : ""
  };
}
