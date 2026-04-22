import { type MaintenanceIssue, type MaintenanceIssueInput, type ManagerDecisionInput, type Vendor } from "@/lib/maintenance-types";

export interface MaintenanceRepository {
  listIssues(): Promise<MaintenanceIssue[]>;
  getIssueById(issueId: string): Promise<MaintenanceIssue | undefined>;
  createIssue(input: MaintenanceIssueInput): Promise<MaintenanceIssue>;
  approveIssue(input: ManagerDecisionInput): Promise<{ issue: MaintenanceIssue; workOrder: unknown }>;
  listVendors(): Promise<Vendor[]>;
}
