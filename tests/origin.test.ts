import { test } from "node:test";
import assert from "node:assert/strict";
import { sameOrigin } from "../lib/server/http";
import { POST as requestOtp } from "../app/api/auth/otp/route";

function request(target: string, origin?: string) {
  return new Request(`${target}/api/auth/otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(origin === undefined ? {} : { origin }) },
    body: JSON.stringify({ name: "Test Person", email: "test@example.com", mode: "signup", consent: true }),
  });
}

test("local development accepts loopback aliases without relaxing production origins", async (t) => {
  const previous = new Map<string, string | undefined>();
  function setEnv(key: string, value: string) {
    if (!previous.has(key)) previous.set(key, process.env[key]);
    process.env[key] = value;
  }
  t.after(() => {
    for (const [key, value] of previous) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
  setEnv("NODE_ENV", "development");
  setEnv("APP_URL", "http://localhost:3000");
  for (const origin of ["http://localhost:3000", "http://127.0.0.1:3000", "http://[::1]:3000"]) {
    assert.doesNotThrow(() => sameOrigin(request("http://localhost:3000", origin)));
  }
  assert.doesNotThrow(() => sameOrigin(request("http://127.0.0.1:3001", "http://127.0.0.1:3001")));
  for (const origin of [undefined, "null", "invalid", "https://attacker.example", "http://localhost.attacker.example:3000", "http://127.0.0.1:3002", "https://127.0.0.1:3000", "http://127.0.0.1:3000/path"]) {
    assert.throws(() => sameOrigin(request("http://127.0.0.1:3000", origin)), { status: 403 });
  }
  assert.throws(() => sameOrigin(request("https://attacker.example", "http://127.0.0.1:3000")), { status: 403 });

  // The screenshot's request must reach the signup handler, rather than fail
  // the origin check. Unconfigured providers still fail honestly with 503.
  setEnv("NEXT_PUBLIC_SUPABASE_URL", "");
  setEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
  setEnv("SUPABASE_SERVICE_ROLE_KEY", "");
  assert.equal((await requestOtp(request("http://127.0.0.1:3000", "http://127.0.0.1:3000"))).status, 503);

  setEnv("NODE_ENV", "production");
  assert.throws(() => sameOrigin(request("http://127.0.0.1:3000", "http://127.0.0.1:3000")), { status: 403 });
  setEnv("APP_URL", "https://literallyglobal.example");
  assert.doesNotThrow(() => sameOrigin(request("https://literallyglobal.example", "https://literallyglobal.example")));
  assert.throws(() => sameOrigin(request("https://literallyglobal.example", "https://attacker.example")), { status: 403 });
});
