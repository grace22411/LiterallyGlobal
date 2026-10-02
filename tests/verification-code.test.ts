import { test } from "node:test";
import assert from "node:assert/strict";
import { normaliseVerificationCode, OTP_REGEX } from "../lib/auth/verification-code";
import { POST as verify } from "../app/api/auth/verify/route";

test("the input preserves all eight digits, leading zeros and pasted numeric codes", () => {
  assert.equal(normaliseVerificationCode("01234567"), "01234567");
  assert.equal(normaliseVerificationCode("0123 4567"), "01234567");
  for (const code of ["012345", "01234567", "0123456789"]) assert(OTP_REGEX.test(normaliseVerificationCode(code)));
});

test("verification API accepts supported OTP lengths and rejects malformed codes before contacting Supabase", async (t) => {
  const keys = ["APP_URL", "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "SUPABASE_SERVICE_ROLE_KEY"];
  const previous = keys.map((key) => [key, process.env[key]] as const);
  t.after(() => {
    for (const [key, value] of previous) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  });
  process.env.APP_URL = "https://example.com";
  for (const key of keys.slice(1)) delete process.env[key];
  const request = (code: unknown) => new Request("https://example.com/api/auth/verify", {
    method: "POST", headers: { origin: "https://example.com", "Content-Type": "application/json" },
    body: JSON.stringify({ email: "test@example.com", code }),
  });
  for (const code of ["012345", "01234567", "0123456789"]) {
    // With providers absent, 503 proves the valid code passed input validation.
    assert.equal((await verify(request(code))).status, 503);
  }
  for (const code of ["", "12345", "12345678901", "1234abcd", "12345678\n", 12345678]) {
    assert.equal((await verify(request(code))).status, 400);
  }
});
