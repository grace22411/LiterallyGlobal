import { test } from "node:test";
import assert from "node:assert/strict";
import { resourceRequestSchema } from "../lib/resources/schema";
import { resourceAccessToken, readResourceAccessToken } from "../lib/resources/access";
import { POST } from "../app/api/resources/requests/route";
import { GET } from "../app/api/resources/[resource]/access/route";
import { GET as downloadSetup } from "../app/api/admin/setup/route";

process.env.APP_URL = "https://example.com";
const submission = { submissionId: crypto.randomUUID(), resource: "checklist", name: " Test Client ", email: " PERSON@EXAMPLE.COM ", phone: "+44 (7700) 900-123", location: " London, UK " };
const request = (body: unknown, origin = "https://example.com") => new Request("https://example.com/api/resources/requests", { method: "POST", headers: { origin, "Content-Type": "application/json" }, body: JSON.stringify(body) });

test("resource forms require all contact fields and a supported resource", () => {
  const parsed = resourceRequestSchema.parse(submission);
  assert.equal(parsed.email, "person@example.com");
  assert.equal(parsed.phone, "+447700900123");
  assert.equal(parsed.location, "London, UK");
  for (const key of ["name", "email", "phone", "location"]) assert.equal(resourceRequestSchema.safeParse({ ...submission, [key]: "" }).success, false);
  assert.equal(resourceRequestSchema.safeParse({ ...submission, resource: "community" }).success, false);
  assert.equal(resourceRequestSchema.safeParse({ ...submission, phone: "abc123" }).success, false);
});

test("access grants reject tampering, wrong resources, expired links and malformed signatures", () => {
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-resource-secret";
  const token = resourceAccessToken(submission.submissionId, "checklist", 1000);
  assert.equal(readResourceAccessToken(token, "checklist", 2000)?.id, submission.submissionId);
  assert.equal(readResourceAccessToken(token, "statement", 2000), null);
  assert.equal(readResourceAccessToken(token, "checklist", 1000 + 86400000), null);
  assert.equal(readResourceAccessToken(`${token}x`, "checklist", 2000), null);
  assert.equal(readResourceAccessToken(token.split(".")[0] + "." + "é".repeat(43), "checklist", 2000), null);
  assert.equal(readResourceAccessToken("missing-signature", "checklist"), null);
});

test("resource API blocks other origins, incomplete forms and unauthorised admin setup", async () => {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  assert.equal((await POST(request(submission, "https://other.example"))).status, 403);
  assert.equal((await POST(request({ ...submission, location: "" }))).status, 400);
  assert.equal((await POST(request(submission))).status, 503);
  assert.equal((await downloadSetup(new Request("https://example.com/api/admin/setup?feature=resources"))).status, 401);
});

test("a resource unlocks only after a durable save; its access is recorded before serving the supplied PDF", async () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://supabase.example.com";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "test-publishable-key";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-resource-secret";
  const originalFetch = globalThis.fetch;
  let failSave = true;
  let failAccess = false;
  let duplicate = false;
  let writes = 0;
  let accesses = 0;
  let row: Record<string, unknown> | null = null;
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    if (url.includes("/rpc/consume_request_limit")) return Response.json(true);
    assert(url.includes("/resource_requests"));
    if (init?.method === "POST") {
      if (failSave) return Response.json({ code: "PGRST205", message: "Unavailable" }, { status: 404 });
      if (duplicate) return Response.json({ code: "23505", message: "Duplicate" }, { status: 409 });
      row = JSON.parse(String(init.body));
      writes++;
      return new Response(null, { status: 201 });
    }
    if (init?.method === "PATCH") {
      accesses++;
      if (failAccess) return Response.json({ message: "Unavailable" }, { status: 503 });
      return new Response(null, { status: 204 });
    }
    return Response.json(row ? [row] : []);
  };
  try {
    const failed = await POST(request(submission));
    assert.equal(failed.status, 503);
    assert.equal((await failed.json()).href, undefined);
    failSave = false;
    const saved = await POST(request(submission));
    assert.equal(saved.status, 200);
    const { href } = await saved.json();
    assert.equal(writes, 1);
    duplicate = true;
    assert.equal((await POST(request(submission))).status, 200);
    assert.equal(writes, 1, "retry must not create duplicate leads");
    assert.equal((await POST(request({ ...submission, name: "Someone else" }))).status, 409);
    const denied = await GET(new Request("https://example.com/api/resources/checklist/access"), { params: Promise.resolve({ resource: "checklist" }) });
    assert.equal(denied.status, 403);
    const pdf = await GET(new Request(`https://example.com${href}`), { params: Promise.resolve({ resource: "checklist" }) });
    assert.equal(pdf.status, 200);
    assert.equal(pdf.headers.get("content-type"), "application/pdf");
    assert.equal(pdf.headers.get("cache-control"), "private, no-store");
    assert.equal(new TextDecoder().decode((await pdf.arrayBuffer()).slice(0, 5)), "%PDF-");
    assert.equal(accesses, 1);
    failAccess = true;
    const unavailable = await GET(new Request(`https://example.com${href}`), { params: Promise.resolve({ resource: "checklist" }) });
    assert.equal(unavailable.status, 503);
    failAccess = false;
    row = { id: submission.submissionId, resource: "workbook", accessed_at: null };
    const workbookToken = resourceAccessToken(submission.submissionId, "workbook");
    const workbook = await GET(new Request(`https://example.com/api/resources/workbook/access?token=${workbookToken}`), { params: Promise.resolve({ resource: "workbook" }) });
    assert.equal(workbook.status, 303);
    assert.equal(workbook.headers.get("location"), "https://docs.google.com/document/d/1ivwJ9Z5_8Wp1hdBx53QxIikHIflXSaLVQIaF9suMn7k/edit?usp=sharing");
  } finally { globalThis.fetch = originalFetch; }
});
