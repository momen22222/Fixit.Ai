import { NextResponse } from "next/server";
import { inviteUser } from "@/lib/services/auth-service";
import { type AuthInviteInput } from "@/lib/maintenance-types";

export async function POST(request: Request) {
  const body = (await request.json()) as AuthInviteInput;

  if (!body.email || !body.role || !body.propertyId || !body.invitedBy) {
    return NextResponse.json({ error: "Missing required invite fields." }, { status: 400 });
  }

  try {
    const invitation = await inviteUser(body);
    return NextResponse.json({ invitation }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to invite user.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
