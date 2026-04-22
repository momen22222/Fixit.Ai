import { resolveAiMode } from "@/lib/app-config";
import { triageMaintenanceIssue } from "@/lib/maintenance-data";
import { type MaintenanceIssueInput, type TriageEnvelope } from "@/lib/maintenance-types";

export async function triageIssue(input: MaintenanceIssueInput): Promise<TriageEnvelope> {
  const mode = resolveAiMode();

  if (mode === "provider") {
    // Provider-backed mode is intentionally swappable later; keep rules as the fallback implementation.
    return { triage: triageMaintenanceIssue(input), mode };
  }

  return { triage: triageMaintenanceIssue(input), mode: "rules" };
}
