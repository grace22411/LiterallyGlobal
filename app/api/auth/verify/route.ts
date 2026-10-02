import { z } from "zod";
import { accountsConfigured, authClient } from "@/lib/supabase/server";
import { errorResponse, HttpError, limitRequests, requestBody, sameOrigin } from "@/lib/server/http";
import { OTP_REGEX } from "@/lib/auth/verification-code";

const schema = z.object({ email: z.email().max(254), code: z.string().regex(OTP_REGEX) }).strict();
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const parsed = schema.safeParse(await requestBody(request));
    if (!parsed.success) throw new HttpError(400, "Enter the complete verification code from your email (6–10 digits).");
    if (!accountsConfigured()) throw new HttpError(503, "Sign-in is temporarily unavailable.");
    const email = parsed.data.email.trim().toLowerCase();
    await limitRequests(`verify:${email}`, 8, 600);
    const client = await authClient();
    const { data, error } = await client.auth.verifyOtp({ email, token: parsed.data.code, type: "email" });
    if (error || !data.user?.email_confirmed_at || !data.session) throw new HttpError(400, "That code is invalid or has expired. Check it or request a new one.");
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return errorResponse(error); }
}
