import { z } from "zod";
import { accountsConfigured, authClient } from "@/lib/supabase/server";
import { errorResponse, HttpError, limitRequests, requestBody, sameOrigin } from "@/lib/server/http";
import { logOtpFailure, otpFailure } from "@/lib/server/auth-errors";

const schema = z.object({ email: z.email().max(254), name: z.string().trim().min(1).max(80).optional(), mode: z.enum(["signup", "login"]), consent: z.boolean() }).strict();
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const parsed = schema.safeParse(await requestBody(request));
    if (!parsed.success) throw new HttpError(400, "Enter a valid name and email address.");
    const { name, mode, consent } = parsed.data;
    const email = parsed.data.email.trim().toLowerCase();
    if (mode === "signup" && (!name || !consent)) throw new HttpError(400, "Please add your name and acknowledge how we use your information.");
    if (!accountsConfigured()) throw new HttpError(503, "Signup is not available yet. Your answers remain in this tab; please try again later or contact us.");
    await limitRequests(`otp:${email}`, 5, 900);
    const client = await authClient();
    const { error } = await client.auth.signInWithOtp({ email, options: { shouldCreateUser: mode === "signup", ...(mode === "signup" ? { data: { full_name: name, privacy_notice: "2026-10-01" } } : {}) } });
    // Do not reveal whether an email already belongs to an account.
    if (error) {
      const failure = otpFailure(error);
      if (failure) { logOtpFailure(error, failure); throw failure; }
    }
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return errorResponse(error); }
}
