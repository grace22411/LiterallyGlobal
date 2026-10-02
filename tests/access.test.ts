import { test } from "node:test";
import assert from "node:assert/strict";
import { POST as saveAssessment } from "../app/api/assessments/route";
import { POST as requestOtp } from "../app/api/auth/otp/route";
import { POST as runEmailJobs } from "../app/api/internal/email-jobs/route";

process.env.APP_URL = "https://example.com";
delete process.env.NEXT_PUBLIC_SUPABASE_URL;
delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
delete process.env.SUPABASE_SERVICE_ROLE_KEY;
delete process.env.CRON_SECRET;

function request(body: unknown, origin = "https://example.com") {
  return new Request("https://example.com/api/assessments", { method: "POST", headers: { origin, "Content-Type": "application/json" }, body: JSON.stringify(body) });
}
test("anonymous users cannot obtain or persist an eligibility result", async () => {
  const response = await saveAssessment(request({ score: 100 }));
  assert.equal(response.status, 401);
  assert(!("score" in await response.json()));
});
test("cross-origin requests are rejected before auth or writes", async () => {
  assert.equal((await saveAssessment(request({}, "https://attacker.example"))).status, 403);
});
test("missing account configuration is an honest unavailable response, never fake signup", async () => {
  const response = await requestOtp(request({ name: "Test Person", email: "test@example.com", mode: "signup", consent: true }));
  assert.equal(response.status, 503);
});
test("signup requires privacy acknowledgement", async () => {
  const response = await requestOtp(request({ name: "Test Person", email: "test@example.com", mode: "signup", consent: false }));
  assert.equal(response.status, 400);
});
test("email worker is never public when its secret is missing", async () => {
  assert.equal((await runEmailJobs(request({}))).status, 401);
});
