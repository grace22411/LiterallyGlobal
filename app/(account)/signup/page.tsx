import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { verifiedUser } from "@/lib/supabase/server";
import { safeReturnTo } from "@/lib/auth/return-to";

export const metadata: Metadata = { title: "Create your account", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function SignupPage({ searchParams }: { searchParams: Promise<{ from?: string; next?: string }> }) {
  const params = await searchParams;
  if (await verifiedUser()) redirect(safeReturnTo(params.next));
  return <AuthForm mode="signup" fromChecker={params.from === "checker"} next={params.next} />;
}
