import {
  approveIssue,
  createIssue,
  getIssueById,
  listIssues,
  listVendors,
  upsertVendor
} from "@/lib/maintenance-data";
import { type MaintenanceIssueInput, type ManagerDecisionInput, type VendorInput } from "@/lib/maintenance-types";
import { type MaintenanceRepository } from "@/lib/repositories/maintenance-repository";

export const mockMaintenanceRepository: MaintenanceRepository = {
  async listIssues() {
    return listIssues();
  },

  async getIssueById(issueId: string) {
    return getIssueById(issueId);
  },

  async createIssue(input: MaintenanceIssueInput) {
    return createIssue(input);
  },

  async approveIssue(input: ManagerDecisionInput) {
    return approveIssue(input);
  },

  async listVendors() {
    return listVendors();
  },

  async upsertVendor(input: VendorInput) {
    return upsertVendor(input);
  }
};
