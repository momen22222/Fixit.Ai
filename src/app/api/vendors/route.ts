import { NextResponse } from "next/server";
import { listVendorDirectory, saveVendor } from "@/lib/services/vendor-service";
import { type VendorInput, type VendorTrade } from "@/lib/maintenance-types";

export async function GET() {
  const vendors = await listVendorDirectory();
  return NextResponse.json({ vendors });
}

export async function POST(request: Request) {
  const body = (await request.json()) as VendorInput;

  if (!body.companyName || !body.city || !body.postalCodes?.length || !body.trades?.length) {
    return NextResponse.json({ error: "Company, trade, city, and service ZIP codes are required." }, { status: 400 });
  }

  const allowedTrades: VendorTrade[] = ["plumbing", "appliance", "electrical", "hvac", "general"];
  const vendor = await saveVendor({
    ...body,
    trades: body.trades.filter((trade) => allowedTrades.includes(trade)),
    reliabilityScore: Number(body.reliabilityScore) || 80,
    completionRate: Number(body.completionRate) || 90,
    tripFee: Number(body.tripFee) || 0,
    hourlyRate: Number(body.hourlyRate) || 0,
    responseHours: Number(body.responseHours) || 24
  });

  return NextResponse.json({ vendor });
}
