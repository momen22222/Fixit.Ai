import { resolveDataMode } from "@/lib/app-config";
import { managers, properties, tenants } from "@/lib/maintenance-data";
import { getSupabaseBrowserClient, getSupabaseServiceClient } from "@/lib/supabase/client";
import {
  type AuthInviteInput,
  type CompleteProfileInput,
  type MagicLinkInput,
  type SessionUser
} from "@/lib/maintenance-types";

export async function getCurrentSessionUser(): Promise<SessionUser> {
  if (resolveDataMode() === "supabase") {
    const supabase = getSupabaseServiceClient();

    if (!supabase) {
      throw new Error("Supabase auth is not configured.");
    }

    // Placeholder for real session binding from cookies/middleware.
  }

  const tenant = tenants[0];
  const property = properties[0];

  return {
    id: tenant.id,
    email: tenant.email,
    role: "tenant",
    unitId: tenant.unitId,
    propertyId: property.id
  };
}

export async function sendMagicLink(input: MagicLinkInput) {
  if (resolveDataMode() === "supabase") {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      throw new Error("Supabase auth is not configured.");
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: input.email,
      options: {
        emailRedirectTo: input.redirectTo
      }
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  return {
    mode: resolveDataMode(),
    email: input.email,
    message: "Magic link requested."
  };
}

function normalizeInviteCode(inviteCode: string) {
  const trimmed = inviteCode.trim();

  try {
    const url = new URL(trimmed);
    return url.searchParams.get("invite") ?? url.pathname.split("/").filter(Boolean).at(-1) ?? trimmed;
  } catch {
    return trimmed;
  }
}

export async function completeUserProfile(input: CompleteProfileInput) {
  const inviteCode = normalizeInviteCode(input.inviteCode);

  if (!inviteCode) {
    throw new Error("Invite link or code is required.");
  }

  if (resolveDataMode() === "supabase") {
    const supabase = getSupabaseServiceClient();

    if (!supabase) {
      throw new Error("Supabase auth is not configured.");
    }

    let authUserId: string | undefined;

    if (input.accessToken) {
      const { data, error } = await supabase.auth.getUser(input.accessToken);

      if (error) {
        throw new Error(error.message);
      }

      authUserId = data.user?.id;
    }

    const { data: invite, error: inviteError } = await supabase
      .from("tenant_invites")
      .select("id, property_id, unit_id, role, email, expires_at, claimed_at")
      .eq("invite_code", inviteCode)
      .maybeSingle();

    if (inviteError) {
      throw new Error(inviteError.message);
    }

    if (!invite) {
      throw new Error("That invite link was not found. Ask your property manager for a fresh invite.");
    }

    if (invite.claimed_at) {
      throw new Error("That invite link has already been used. Ask your property manager for a new one.");
    }

    if (invite.expires_at && new Date(invite.expires_at).getTime() < Date.now()) {
      throw new Error("That invite link has expired. Ask your property manager for a fresh invite.");
    }

    if (invite.email && invite.email.toLowerCase() !== input.email.toLowerCase()) {
      throw new Error("This invite was sent to a different email address.");
    }

    if (!authUserId) {
      throw new Error("Please sign in with Google or your email link before connecting your unit.");
    }

    const userId = authUserId;
    const { error: profileError } = await supabase.from("app_users").upsert({
      id: userId,
      role: input.role,
      email: input.email,
      full_name: input.fullName,
      phone_number: input.phoneNumber,
      preferred_contact: input.preferredContact,
      emergency_contact: input.emergencyContact ?? null,
      property_id: invite.property_id,
      unit_id: invite.unit_id
    });

    if (profileError) {
      throw new Error(profileError.message);
    }

    await supabase
      .from("tenant_invites")
      .update({ claimed_at: new Date().toISOString(), claimed_by: userId })
      .eq("id", invite.id);

    return {
      mode: "supabase",
      redirectTo: input.role === "manager" ? "/manager/dashboard" : "/tenant/home",
      message: "Your account is connected to your property."
    };
  }

  return {
    mode: "mock",
    redirectTo: input.role === "manager" ? "/manager/dashboard" : "/tenant/home",
    message: "Demo profile saved. Your invite code will connect to a real unit once Supabase is active."
  };
}

export async function inviteUser(input: AuthInviteInput) {
  const inviteCode = `fixit-${crypto.randomUUID().slice(0, 8)}`;

  if (resolveDataMode() === "supabase") {
    const supabase = getSupabaseServiceClient();

    if (!supabase) {
      throw new Error("Supabase auth is not configured.");
    }

    const { error } = await supabase.auth.admin.inviteUserByEmail(input.email, {
      data: {
        role: input.role,
        propertyId: input.propertyId,
        unitId: input.unitId,
        invitedBy: input.invitedBy
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    const { error: inviteError } = await supabase.from("tenant_invites").insert({
      invite_code: inviteCode,
      email: input.email,
      role: input.role,
      property_id: input.propertyId,
      unit_id: input.unitId ?? null,
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString()
    });

    if (inviteError) {
      throw new Error(inviteError.message);
    }
  }

  return {
    mode: resolveDataMode(),
    email: input.email,
    role: input.role,
    inviteCode,
    inviteLink: `/signup?invite=${inviteCode}`,
    invitedBy: input.invitedBy,
    defaultManager: managers[0].email
  };
}
