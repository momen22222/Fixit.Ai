import { NextResponse } from "next/server";
import { getIssueDetail } from "@/lib/services/issue-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ issueId: string }> }
) {
  const { issueId } = await params;
  const issue = await getIssueDetail(issueId);

  if (!issue) {
    return NextResponse.json({ error: "Issue not found." }, { status: 404 });
  }

  return NextResponse.json({ issue });
}
