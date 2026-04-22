import { NextResponse } from "next/server";
import { approveIssueDecision } from "@/lib/services/approval-service";
import { type ManagerDecisionInput } from "@/lib/maintenance-types";

export async function POST(request: Request) {
  const body = (await request.json()) as ManagerDecisionInput;

  if (!body.issueId || !body.approvedVendorId || !body.approvedWindow || !body.decision) {
    return NextResponse.json({ error: "Missing manager approval fields." }, { status: 400 });
  }

  try {
    const result = await approveIssueDecision(body);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to approve issue.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
