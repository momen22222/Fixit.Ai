import { NextResponse } from "next/server";
import { completeUserProfile } from "@/lib/services/auth-service";
import { type CompleteProfileInput } from "@/lib/maintenance-types";

export async function POST(request: Request) {
  const body = (await request.json()) as CompleteProfileInput;

  if (!body.email || !body.fullName || !body.phoneNumber || !body.role || !body.inviteCode) {
    return NextResponse.json({ error: "Missing required profile fields." }, { status: 400 });
  }

  try {
    const result = await completeUserProfile(body);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to complete profile.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
