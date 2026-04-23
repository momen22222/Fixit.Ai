import { NextResponse } from "next/server";
import { createManagerUnit } from "@/lib/services/property-service";
import { type UnitInput } from "@/lib/maintenance-types";

export async function POST(request: Request) {
  const body = (await request.json()) as UnitInput;

  if (!body.propertyId || !body.label) {
    return NextResponse.json({ error: "Property and unit label are required." }, { status: 400 });
  }

  try {
    const unit = await createManagerUnit({
      ...body,
      bedrooms: Number(body.bedrooms) || 0
    });
    return NextResponse.json({ unit }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create unit.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
