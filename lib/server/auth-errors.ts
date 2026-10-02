import "server-only";
import { HttpError } from "./http";

type AuthFailure = { code?: string; status?: number; name?: string; message?: string };

export function otpFailure(error: AuthFailure): HttpError | null {
  // Keep responses identical for existing and unknown accounts.
  if (["otp_disabled", "user_not_found", "signup_disabled"].includes(error.code ?? "")) return null;
  if (error.status === 429 || ["over_email_send_rate_limit", "over_request_rate_limit"].includes(error.code ?? "")) {
    return new HttpError(429, "Too many verification emails have been requested. Please wait before requesting another code.", "email_rate_limited");
  }
  if (error.code === "email_address_not_authorized") {
    return new HttpError(503, "Email verification is temporarily unavailable. Please contact us so we can restore delivery. Your answers are saved in this tab.", "email_sender_restricted");
  }
  if ((error.name === "AuthRetryableFetchError" && !error.status) || error.code === "request_timeout") {
    return new HttpError(503, "We couldn’t reach the account service. Please try again shortly. Your answers are saved in this tab.", "auth_connection_failed");
  }
  return new HttpError(503, "We couldn’t deliver your verification email. Please try again later or contact us. Your answers are saved in this tab.", "email_delivery_failed");
}

export function logOtpFailure(error: AuthFailure, failure: HttpError) {
  // Do not log email addresses, tokens, API keys or provider response bodies.
  const code = /^[a-z_]{1,80}$/.test(error.code ?? "") ? error.code : "unknown";
  const category = /template/i.test(error.message ?? "") ? "email_template"
    : /smtp|sending.*email|email.*sending/i.test(error.message ?? "") ? "email_transport"
    : failure.code;
  console.error("Signup verification failed", JSON.stringify({ code, status: error.status, category }));
}
