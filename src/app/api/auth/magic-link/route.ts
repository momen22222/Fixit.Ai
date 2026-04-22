import { NextResponse } from "next/server";
import { sendMagicLink } from "@/lib/services/auth-service";
import { type MagicLinkInput } from "@/lib/maintenance-types";

export async function POST(request: Request) {
  const body = (await request.json()) as MagicLinkInput;

  if (!body.email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  try {
    const result = await sendMagicLink(body);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send magic link.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
