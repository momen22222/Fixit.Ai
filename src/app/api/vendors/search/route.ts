import { NextResponse } from "next/server";
import { recommendVendorPlan, searchExternalVendors } from "@/lib/services/vendor-search-service";
import { type VendorTrade } from "@/lib/maintenance-types";

type VendorSearchBody = {
  trade?: VendorTrade;
  issueSummary?: string;
  propertyAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  mode?: "approved-first" | "external-only";
};

export async function POST(request: Request) {
  const body = (await request.json()) as VendorSearchBody;

  if (!body.trade || !body.issueSummary || !body.city || !body.state || !body.postalCode) {
    return NextResponse.json({ error: "Trade, issue summary, city, state, and postal code are required." }, { status: 400 });
  }

  const input = {
    trade: body.trade,
    issueSummary: body.issueSummary,
    propertyAddress: body.propertyAddress ?? "",
    city: body.city,
    state: body.state,
    postalCode: body.postalCode
  };

  if (body.mode === "external-only") {
    const vendors = await searchExternalVendors(input);

    return NextResponse.json({
      strategy: "external-only",
      vendors,
      note: "External vendors are candidates only. A property manager must approve before dispatch."
    });
  }

  const plan = await recommendVendorPlan(input);

  return NextResponse.json(plan);
}
