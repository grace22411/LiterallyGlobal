import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export function accountsConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function authClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Account service is not configured");
  const jar = await cookies();
  return createServerClient(url, key, {
    cookieOptions: { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" },
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (items) => {
        try { for (const { name, value, options } of items) jar.set(name, value, options); }
        catch { /* Read-only Server Component: proxy owns cookie refresh. */ }
      },
    },
  });
}

export function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Database service is not configured");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function verifiedUser() {
  if (!accountsConfigured()) return null;
  const client = await authClient();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user?.email || !data.user.email_confirmed_at) return null;
  return data.user;
}
