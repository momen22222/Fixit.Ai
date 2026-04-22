import { getMaintenanceRepository } from "@/lib/repositories";
import { type MaintenanceIssueInput } from "@/lib/maintenance-types";

export async function listIssueFeed() {
  const repository = getMaintenanceRepository();
  return repository.listIssues();
}

export async function getIssueDetail(issueId: string) {
  const repository = getMaintenanceRepository();
  return repository.getIssueById(issueId);
}

export async function createIssueRecord(input: MaintenanceIssueInput) {
  const repository = getMaintenanceRepository();
  return repository.createIssue(input);
}
