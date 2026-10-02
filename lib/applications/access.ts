import "server-only";
import { adminClient, verifiedUser } from "@/lib/supabase/server";
import { HttpError } from "@/lib/server/http";
import type { Application } from "./types";
export function isAdminEmail(email?: string | null) {
  return Boolean(email && (process.env.ADMIN_EMAILS ?? "").split(",").map((v) => v.trim().toLowerCase()).filter(Boolean).includes(email.toLowerCase()));
}
export async function requireUser() {
  const user = await verifiedUser();
  if (!user) throw new HttpError(401, "Sign in to continue.");
  return user;
}
export async function requireAdmin() {
  const user = await requireUser();
  if (!isAdminEmail(user.email)) throw new HttpError(403, "This area is only available to the LiterallyGlobal team.");
  return user;
}
export async function ownApplication(id: string, userId: string): Promise<Application> {
  const result = await adminClient().from("service_applications").select("*").eq("id", id).eq("user_id", userId).maybeSingle();
  if (result.error) throw new HttpError(503, "Applications are temporarily unavailable. Please try again shortly.");
  if (!result.data) throw new HttpError(404, "Application not found.");
  return result.data;
}
export function supportFit(result?: { status: string } | null) {
  if (!result) return { code: "review", title: "Grace will review your fit", text: "Your Grace AI discussion helps us understand your experience. Grace will review your evidence before accepting you for full support." };
  if (["ready-for-review", "evidence-to-build"].includes(result.status)) return { code: "suitable", title: "Your answers support a full-support application", text: "You report meeting the core requirements. Apply so Grace can review your experience and confirm the right level of support." };
  return { code: "review", title: "A closer look is needed first", text: "Your report flags gaps or questions. You can request Grace’s review, take action on your report, or book a consultation before committing to full support." };
}
