import { NextResponse } from "next/server";
import { createVendor, listVendors } from "@/lib/maintenance-data";
import { type Vendor } from "@/lib/maintenance-types";

export async function GET() {
  return NextResponse.json({ vendors: listVendors() });
}

export async function POST(request: Request) {
  const body = (await request.json()) as Vendor;

  if (!body.id || !body.companyName) {
    return NextResponse.json({ error: "Vendor id and company name are required." }, { status: 400 });
  }

  return NextResponse.json({ vendor: createVendor(body) }, { status: 201 });
}
