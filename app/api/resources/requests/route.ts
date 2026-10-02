import { adminClient, accountsConfigured } from "@/lib/supabase/server";
import { resourceRequestSchema } from "@/lib/resources/schema";
import { resourceAccessToken } from "@/lib/resources/access";
import { errorResponse, HttpError, limitRequests, requestBody, sameOrigin } from "@/lib/server/http";

export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const parsed = resourceRequestSchema.safeParse(await requestBody(request));
    if (!parsed.success) throw new HttpError(400, "Enter your name, a valid email, phone number with country code, and location.");
    if (!accountsConfigured()) throw new HttpError(503, "Free resources are temporarily unavailable. Please try again shortly.");
    const { submissionId, ...details } = parsed.data;
    await limitRequests(`resource-email:${details.email}`, 15, 3600);
    const db = adminClient();
    const saved = await db.from("resource_requests").insert({ id: submissionId, ...details });
    if (saved.error?.code === "23505") {
      const existing = await db.from("resource_requests").select("resource,name,email,phone,location").eq("id", submissionId).maybeSingle();
      if (existing.error) throw new HttpError(503, "We couldn’t save your details. Please try again.");
      const previous = existing.data;
      if (!previous || Object.entries(details).some(([key, value]) => previous[key as keyof typeof previous] !== value)) {
        throw new HttpError(409, "This request has changed. Refresh the page and try again.");
      }
    } else if (saved.error) {
      throw new HttpError(503, "We couldn’t save your details. Please try again shortly.");
    }
    const token = resourceAccessToken(submissionId, details.resource);
    return Response.json({ href: `/api/resources/${details.resource}/access?token=${encodeURIComponent(token)}` }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return errorResponse(error); }
}
