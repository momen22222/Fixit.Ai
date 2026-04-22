import { NextResponse } from "next/server";
import { listApprovalInbox } from "@/lib/services/approval-service";

export async function GET() {
  const issues = await listApprovalInbox();
  return NextResponse.json({ issues });
}
