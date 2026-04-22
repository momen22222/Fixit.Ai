import { NextResponse } from "next/server";
import { triageIssue } from "@/lib/services/triage-service";
import { type MaintenanceIssueInput } from "@/lib/maintenance-types";

export async function POST(request: Request) {
  const body = (await request.json()) as MaintenanceIssueInput;

  if (!body.category || !body.description) {
    return NextResponse.json({ error: "Category and description are required." }, { status: 400 });
  }

  const result = await triageIssue({
    unitId: body.unitId ?? "unit-3c",
    category: body.category,
    description: body.description,
    photos: body.photos ?? [],
    tenantAvailability: body.tenantAvailability ?? "Not provided",
    permissionToEnter: Boolean(body.permissionToEnter)
  });

  return NextResponse.json(result);
}
