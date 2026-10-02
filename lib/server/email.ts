import "server-only";
import { adminClient } from "@/lib/supabase/server";
import type { EligibilityResult } from "@/lib/eligibility/evaluate";
import { reportEmail } from "@/lib/eligibility/report-email";
import { appOrigin } from "./http";

export async function deliverResultEmail(assessmentId: string): Promise<"sent" | "pending" | "failed"> {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) return "pending";
  const db = adminClient();
  const job = await db.from("result_email_jobs").select("id,status").eq("assessment_id", assessmentId).single();
  if (job.error) throw new Error("Email job lookup failed");
  if (job.data.status === "sent") return "sent";
  const claimed = await db.rpc("claim_result_email", { p_id: job.data.id });
  if (claimed.error) throw new Error("Email job claim failed");
  const lease = claimed.data?.[0];
  if (!lease) return "pending";
  let providerId: string | null = null;
  try {
    const assessment = await db.from("assessments").select("user_id,result").eq("id", assessmentId).single();
    if (assessment.error) throw new Error("Assessment unavailable");
    const { data, error } = await db.auth.admin.getUserById(assessment.data.user_id);
    if (error || !data.user?.email || !data.user.email_confirmed_at) throw new Error("Recipient not verified");
    const content = reportEmail(assessment.data.result as EligibilityResult, `${appOrigin()}/dashboard?assessment=${encodeURIComponent(assessmentId)}`);
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": `eligibility-${assessmentId}-v1` },
      body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [data.user.email], ...content }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
    const payload = await response.json();
    if (typeof payload.id !== "string") throw new Error("Email provider acknowledgement missing");
    providerId = payload.id;
    const finished = await db.rpc("finish_result_email", { p_id: lease.id, p_lease: lease.lease_token, p_success: true, p_provider_id: providerId, p_error: null });
    if (finished.error) throw new Error("Email acknowledgement could not be stored");
    return "sent";
  } catch {
    // A provider id means delivery was accepted: retain the lease and retry with
    // the same idempotency key instead of claiming the email was never sent.
    if (!providerId) await db.rpc("finish_result_email", { p_id: lease.id, p_lease: lease.lease_token, p_success: false, p_provider_id: null, p_error: "Delivery was not acknowledged; retry scheduled." });
    console.error("Result email needs retry", { assessmentId });
    return "failed";
  }
}
