import { NextResponse } from "next/server";
import { createManagerProperty, listManagerProperties } from "@/lib/services/property-service";
import { type PropertyInput } from "@/lib/maintenance-types";

export async function GET() {
  const properties = await listManagerProperties();
  return NextResponse.json({ properties });
}

export async function POST(request: Request) {
  const body = (await request.json()) as PropertyInput;

  if (!body.name || !body.address || !body.city || !body.state || !body.postalCode) {
    return NextResponse.json({ error: "Name, address, city, state, and ZIP are required." }, { status: 400 });
  }

  try {
    const property = await createManagerProperty(body);
    return NextResponse.json({ property }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create property.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
