import { getMaintenanceRepository } from "@/lib/repositories";

export async function listVendorDirectory() {
  const repository = getMaintenanceRepository();
  return repository.listVendors();
}

export async function getVendorDetail(vendorId: string) {
  const repository = getMaintenanceRepository();
  const vendors = await repository.listVendors();
  return vendors.find((vendor) => vendor.id === vendorId);
}
