import { type AiMode, type AppDataMode } from "@/lib/maintenance-types";

function readEnv(name: string) {
  const value = process.env[name];
  return value && value.length ? value : undefined;
}

export const appConfig = {
  appName: "Fix it AI",
  dataMode: (readEnv("APP_DATA_MODE") as AppDataMode | undefined) ?? "mock",
  aiMode: (readEnv("APP_AI_MODE") as AiMode | undefined) ?? "rules",
  supabaseUrl: readEnv("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  supabaseServiceRoleKey: readEnv("SUPABASE_SERVICE_ROLE_KEY"),
  storageBucket: readEnv("SUPABASE_STORAGE_BUCKET") ?? "issue-photos",
  aiProviderApiKey: readEnv("AI_PROVIDER_API_KEY"),
  aiProviderName: readEnv("AI_PROVIDER_NAME") ?? "mock"
};

export function isSupabaseConfigured() {
  return Boolean(appConfig.supabaseUrl && appConfig.supabaseAnonKey && appConfig.supabaseServiceRoleKey);
}

export function resolveDataMode(): AppDataMode {
  return appConfig.dataMode === "supabase" && isSupabaseConfigured() ? "supabase" : "mock";
}

export function resolveAiMode(): AiMode {
  return appConfig.aiMode === "provider" && appConfig.aiProviderApiKey ? "provider" : "rules";
}
