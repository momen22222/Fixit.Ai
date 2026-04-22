import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { appConfig, isSupabaseConfigured } from "@/lib/app-config";

let browserClient: SupabaseClient | null = null;
let serviceClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  browserClient ??= createClient(appConfig.supabaseUrl!, appConfig.supabaseAnonKey!);
  return browserClient;
}

export function getSupabaseServiceClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  serviceClient ??= createClient(appConfig.supabaseUrl!, appConfig.supabaseServiceRoleKey!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  return serviceClient;
}
