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
  aiProviderApiKey: readEnv("GEMINI_API_KEY") ?? readEnv("AI_PROVIDER_API_KEY"),
  aiProviderName: readEnv("AI_PROVIDER_NAME") ?? readEnv("AI_PROVIDER") ?? "mock",
  aiModel: readEnv("AI_MODEL") ?? "gemini-2.5-flash",
  tavilyApiKey: readEnv("TAVILY_API_KEY"),
  googlePlacesApiKey: readEnv("GOOGLE_PLACES_API_KEY"),
  yelpApiKey: readEnv("YELP_API_KEY")
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
