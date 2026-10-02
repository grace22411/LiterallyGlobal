import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { EligibilityChecker } from "@/components/eligibility/checker";
import { verifiedUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Check your eligibility", description: "Explore your Global Talent endorsement readiness for digital technology, academia and research, or design. Get a personalised evidence checklist and next steps." };
export const dynamic = "force-dynamic";
export default async function EligibilityPage() {
  const user = await verifiedUser();
  if(user)redirect("/dashboard/eligibility");
  return <main className="container app-page" id="main"><EligibilityChecker signedIn={Boolean(user)} /></main>;
}
