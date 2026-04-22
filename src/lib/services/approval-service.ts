import { getMaintenanceRepository } from "@/lib/repositories";
import { type ManagerDecisionInput } from "@/lib/maintenance-types";

export async function listApprovalInbox() {
  const repository = getMaintenanceRepository();
  const issues = await repository.listIssues();
  return issues.filter((issue) => issue.status === "approval-needed" || issue.status === "scheduled");
}

export async function approveIssueDecision(input: ManagerDecisionInput) {
  const repository = getMaintenanceRepository();
  return repository.approveIssue(input);
}
