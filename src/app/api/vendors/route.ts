import { NextResponse } from "next/server";
import { listVendorDirectory } from "@/lib/services/vendor-service";
import { type Vendor } from "@/lib/maintenance-types";

export async function GET() {
  const vendors = await listVendorDirectory();
  return NextResponse.json({ vendors });
}

export async function POST(request: Request) {
  const body = (await request.json()) as Vendor;

  if (!body.id || !body.companyName) {
    return NextResponse.json({ error: "Vendor id and company name are required." }, { status: 400 });
  }

  return NextResponse.json(
    {
      error: "Vendor write operations are not wired for the live repository yet."
    },
    { status: 501 }
  );
}
