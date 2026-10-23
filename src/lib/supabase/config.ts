import { SupabaseConfigStatus } from "../types";

export function getSupabaseConfigStatus(): SupabaseConfigStatus {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  const isPlaceholderUrl = !url || url.includes("your-project-id") || url === "" || url === "undefined";
  const isPlaceholderKey = !anonKey || anonKey.includes("your_supabase_anon_public_key") || anonKey === "" || anonKey === "undefined";

  const hasUrl = !isPlaceholderUrl;
  const hasAnonKey = !isPlaceholderKey;
  const isConfigured = hasUrl && hasAnonKey;

  const missingVars: string[] = [];
  if (!hasUrl) missingVars.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!hasAnonKey) missingVars.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return {
    isConfigured,
    mode: isConfigured ? "supabase" : "demo_isolated",
    hasUrl,
    hasAnonKey,
    missingVars,
    message: isConfigured
      ? "Supabase Auth and PostgreSQL backend connected."
      : `Running in isolated multi-account demo mode. To connect real Supabase, set ${missingVars.join(" and ")} in .env.local.`,
  };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfigStatus().isConfigured;
}
