import { z } from "zod";
import { authClient, verifiedUser } from "@/lib/supabase/server";
import { deliverResultEmail } from "@/lib/server/email";
import { errorResponse, HttpError, limitRequests, sameOrigin } from "@/lib/server/http";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    sameOrigin(request);
    const user = await verifiedUser();
    if (!user) throw new HttpError(401, "Please sign in first.");
    const { id } = await context.params;
    if (!z.uuid().safeParse(id).success) throw new HttpError(404, "Result not found.");
    const result = await (await authClient()).from("assessments").select("id").eq("id", id).eq("user_id", user.id).maybeSingle();
    if (result.error || !result.data) throw new HttpError(404, "Result not found.");
    await limitRequests(`email:${user.id}`, 5, 3600);
    return Response.json({ status: await deliverResultEmail(id) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return errorResponse(error); }
}
