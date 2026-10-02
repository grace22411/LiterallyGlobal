import { timingSafeEqual } from "node:crypto";
import { adminClient } from "@/lib/supabase/server";
import { deliverResultEmail } from "@/lib/server/email";

// Invoke every five minutes with Authorization: Bearer <CRON_SECRET>.
export async function POST(request: Request) {
  const expected = process.env.CRON_SECRET;
  const actual = request.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!expected || expected.length < 32 || !actual || Buffer.byteLength(actual) !== Buffer.byteLength(expected) || !timingSafeEqual(Buffer.from(actual), Buffer.from(expected))) return new Response("Unauthorized", { status: 401 });
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) return Response.json({ error: "Email delivery is not configured" }, { status: 503 });
  const now = new Date().toISOString();
  const jobs = await adminClient().from("result_email_jobs").select("assessment_id").neq("status", "sent").lt("attempts", 5).lte("next_attempt_at", now).or(`status.neq.sending,lease_until.lt.${now}`).order("next_attempt_at").limit(5);
  if (jobs.error) return Response.json({ error: "Queue unavailable" }, { status: 503 });
  const results = await Promise.allSettled(jobs.data.map((job) => deliverResultEmail(job.assessment_id)));
  return Response.json({ processed: results.length, accepted: results.filter((result) => result.status === "fulfilled" && result.value === "sent").length }, { headers: { "Cache-Control": "no-store" } });
}
