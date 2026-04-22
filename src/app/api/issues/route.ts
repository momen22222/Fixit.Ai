import { NextResponse } from "next/server";
import { createIssueRecord, listIssueFeed } from "@/lib/services/issue-service";
import { type MaintenanceIssueInput } from "@/lib/maintenance-types";

export async function GET() {
  const issues = await listIssueFeed();
  return NextResponse.json({ issues });
}

export async function POST(request: Request) {
  const body = (await request.json()) as MaintenanceIssueInput;

  if (!body.unitId || !body.category || !body.description || !body.tenantAvailability) {
    return NextResponse.json({ error: "Missing required issue fields." }, { status: 400 });
  }

  const issue = await createIssueRecord({
    unitId: body.unitId,
    category: body.category,
    description: body.description,
    photos: body.photos ?? [],
    tenantAvailability: body.tenantAvailability,
    permissionToEnter: Boolean(body.permissionToEnter)
  });

  return NextResponse.json({ issue }, { status: 201 });
}
