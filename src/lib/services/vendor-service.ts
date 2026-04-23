import { getMaintenanceRepository } from "@/lib/repositories";
import { type VendorInput } from "@/lib/maintenance-types";

export async function listVendorDirectory() {
  const repository = getMaintenanceRepository();
  return repository.listVendors();
}

export async function getVendorDetail(vendorId: string) {
  const repository = getMaintenanceRepository();
  const vendors = await repository.listVendors();
  return vendors.find((vendor) => vendor.id === vendorId);
}

export async function saveVendor(input: VendorInput) {
  const repository = getMaintenanceRepository();
  return repository.upsertVendor(input);
}
