import "server-only";
import { createHmac } from "node:crypto";
import { adminClient } from "@/lib/supabase/server";

export class HttpError extends Error {
  constructor(public status: number, message: string, public code?: string) { super(message); }
}
export function appOrigin(): string {
  const configured = process.env.APP_URL;
  if (!configured) {
    if (process.env.NODE_ENV === "production") throw new HttpError(503, "The account service is temporarily unavailable.");
    return "http://localhost:3000";
  }
  return new URL(configured).origin;
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const configured = appOrigin();
  if (origin === configured) return;
  // Next dev can be opened through localhost, IPv4 or IPv6 loopback. Accept
  // those aliases only for a local development request on the same port.
  // Production continues to trust only the explicitly configured APP_URL.
  if (process.env.NODE_ENV === "development" && origin) {
    try {
      const submitted = new URL(origin);
      const target = new URL(request.url);
      const loopback = (url: URL) => ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
      if (origin === submitted.origin && loopback(new URL(configured)) && loopback(submitted) && loopback(target)
        && ["http:", "https:"].includes(submitted.protocol)
        && submitted.protocol === target.protocol && submitted.port === target.port) return;
    } catch { /* Malformed origins are rejected below. */ }
  }
  throw new HttpError(403, "Please submit this request from the LiterallyGlobal website.");
}
export async function requestBody(request: Request): Promise<unknown> {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new HttpError(415, "Please send a JSON request.");
  if (Number(request.headers.get("content-length") ?? 0) > 16_384) throw new HttpError(413, "This request is too large.");
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "A request body is required.");
  const chunks: Uint8Array[] = []; let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > 16_384) { await reader.cancel(); throw new HttpError(413, "This request is too large."); }
    chunks.push(value);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { throw new HttpError(400, "Please check the form and try again."); }
}
export async function limitRequests(key: string, limit: number, windowSeconds: number) {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new HttpError(503, "The account service is temporarily unavailable.");
  const opaqueKey = createHmac("sha256", secret).update(key).digest("hex");
  const { data, error } = await adminClient().rpc("consume_request_limit", { p_key: opaqueKey, p_limit: limit, p_window_seconds: windowSeconds });
  if (error) {
    console.error("Account request limit unavailable", { code: /^[A-Za-z0-9_]{1,40}$/.test(error.code ?? "") ? error.code : "connection_failed" });
    throw new HttpError(503, "Please try again shortly. Your answers have been kept in this tab.", "account_database_unavailable");
  }
  if (!data) throw new HttpError(429, "Too many attempts. Please wait a few minutes before trying again.");
}
export function errorResponse(error: unknown) {
  if (error instanceof HttpError) return Response.json({ error: error.message, ...(error.code ? { code: error.code } : {}) }, { status: error.status, headers: { "Cache-Control": "no-store" } });
  console.error("LiterallyGlobal request failed", error instanceof Error ? error.name : "UnknownError");
  return Response.json({ error: "We couldn’t complete that request. Please try again; your answers are still in this tab." }, { status: 500, headers: { "Cache-Control": "no-store" } });
}
