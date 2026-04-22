import { resolveDataMode } from "@/lib/app-config";
import { mockMaintenanceRepository } from "@/lib/repositories/mock-maintenance-repository";
import { supabaseMaintenanceRepository } from "@/lib/repositories/supabase-maintenance-repository";

export function getMaintenanceRepository() {
  return resolveDataMode() === "supabase" ? supabaseMaintenanceRepository : mockMaintenanceRepository;
}
