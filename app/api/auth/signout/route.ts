import { authClient } from "@/lib/supabase/server";
import { errorResponse, sameOrigin } from "@/lib/server/http";

export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const { error } = await (await authClient()).auth.signOut({ scope: "local" });
    if (error) throw error;
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return errorResponse(error); }
}
