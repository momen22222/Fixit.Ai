import { resolveDataMode } from "@/lib/app-config";
import { managers, properties, tenants } from "@/lib/maintenance-data";
import { getSupabaseBrowserClient, getSupabaseServiceClient } from "@/lib/supabase/client";
import { type AuthInviteInput, type MagicLinkInput, type SessionUser } from "@/lib/maintenance-types";

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
        emailRedirectTo: "http://localhost:3000/tenant/home"
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

export async function inviteUser(input: AuthInviteInput) {
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
  }

  return {
    mode: resolveDataMode(),
    email: input.email,
    role: input.role,
    invitedBy: input.invitedBy,
    defaultManager: managers[0].email
  };
}
