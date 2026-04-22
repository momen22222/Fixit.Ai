import { resolveAiMode } from "@/lib/app-config";
import { triageMaintenanceIssue } from "@/lib/maintenance-data";
import { type MaintenanceIssueInput, type TriageEnvelope } from "@/lib/maintenance-types";
import { triageWithGemini } from "@/lib/services/gemini-triage-provider";

export async function triageIssue(input: MaintenanceIssueInput): Promise<TriageEnvelope> {
  const mode = resolveAiMode();

  if (mode === "provider") {
    try {
      return { triage: await triageWithGemini(input), mode };
    } catch (error) {
      console.error("Gemini triage failed; falling back to rules.", error);
      return { triage: triageMaintenanceIssue(input), mode: "rules" };
    }
  }

  return { triage: triageMaintenanceIssue(input), mode: "rules" };
}
