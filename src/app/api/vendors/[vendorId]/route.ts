import { NextResponse } from "next/server";
import { deleteVendor, getVendorById, updateVendor } from "@/lib/maintenance-data";
import { type Vendor } from "@/lib/maintenance-types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  const { vendorId } = await params;
  const vendor = getVendorById(vendorId);

  if (!vendor) {
    return NextResponse.json({ error: "Vendor not found." }, { status: 404 });
  }

  return NextResponse.json({ vendor });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  const { vendorId } = await params;
  const body = (await request.json()) as Partial<Vendor>;
  const vendor = updateVendor(vendorId, body);

  if (!vendor) {
    return NextResponse.json({ error: "Vendor not found." }, { status: 404 });
  }

  return NextResponse.json({ vendor });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  const { vendorId } = await params;
  const deleted = deleteVendor(vendorId);

  if (!deleted) {
    return NextResponse.json({ error: "Vendor not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
