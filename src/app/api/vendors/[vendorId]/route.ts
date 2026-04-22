import { NextResponse } from "next/server";
import { getVendorDetail } from "@/lib/services/vendor-service";
import { type Vendor } from "@/lib/maintenance-types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  const { vendorId } = await params;
  const vendor = await getVendorDetail(vendorId);

  if (!vendor) {
    return NextResponse.json({ error: "Vendor not found." }, { status: 404 });
  }

  return NextResponse.json({ vendor });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  void request;
  void params;
  void ({} as Partial<Vendor>);
  return NextResponse.json(
    { error: "Vendor update operations are not wired for the live repository yet." },
    { status: 501 }
  );
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  void request;
  void params;
  return NextResponse.json(
    { error: "Vendor delete operations are not wired for the live repository yet." },
    { status: 501 }
  );
}
