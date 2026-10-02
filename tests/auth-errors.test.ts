import { test } from "node:test";
import assert from "node:assert/strict";
import { logOtpFailure, otpFailure } from "../lib/server/auth-errors";
import { errorResponse } from "../lib/server/http";

test("OTP errors distinguish rate limits, sender restrictions and connection failures", () => {
  assert.equal(otpFailure({ code: "over_email_send_rate_limit", status: 422 })?.status, 429);
  assert.equal(otpFailure({ code: "email_address_not_authorized", status: 403 })?.code, "email_sender_restricted");
  assert.equal(otpFailure({ name: "AuthRetryableFetchError" })?.code, "auth_connection_failed");
  assert.equal(otpFailure({ name: "AuthRetryableFetchError", status: 500, message: "Error sending magic link email" })?.code, "email_delivery_failed");
  assert.equal(otpFailure({ code: "unexpected_failure", status: 500 })?.code, "email_delivery_failed");
  for (const code of ["otp_disabled", "user_not_found", "signup_disabled"]) assert.equal(otpFailure({ code }), null);
});

test("OTP diagnostics never expose provider messages or recipient details", async (t) => {
  const logger = t.mock.method(console, "error", () => {});
  const error = { code: "unexpected_failure", status: 500, message: "Error sending email to private@example.com with secret-token" };
  const failure = otpFailure(error)!;
  logOtpFailure(error, failure);
  const log = JSON.stringify(logger.mock.calls[0].arguments);
  assert(log.includes("email_transport"));
  assert(!log.includes("private@example.com"));
  assert(!log.includes("secret-token"));
  const response = await errorResponse(failure).json();
  assert.equal(response.code, "email_delivery_failed");
  assert(!JSON.stringify(response).includes("secret-token"));
});
