import {
  type MaintenanceIssue,
  type MaintenanceIssueInput,
  type ManagerDecisionInput,
  type Vendor,
  type VendorInput
} from "@/lib/maintenance-types";

export interface MaintenanceRepository {
  listIssues(): Promise<MaintenanceIssue[]>;
  getIssueById(issueId: string): Promise<MaintenanceIssue | undefined>;
  createIssue(input: MaintenanceIssueInput): Promise<MaintenanceIssue>;
  approveIssue(input: ManagerDecisionInput): Promise<{ issue: MaintenanceIssue; workOrder: unknown }>;
  listVendors(): Promise<Vendor[]>;
  upsertVendor(input: VendorInput): Promise<Vendor>;
}
