import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { resourceIds, type ResourceId } from "./catalog";
import { HttpError } from "@/lib/server/http";
const grantSchema = z.object({ id: z.uuid(), resource: z.enum(resourceIds), expires: z.number().int().positive() }).strict();
function signature(payload: string) {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new HttpError(503, "Resources are temporarily unavailable. Please try again shortly.");
  return createHmac("sha256", secret).update(`resource-access:${payload}`).digest("base64url");
}
export function resourceAccessToken(id: string, resource: ResourceId, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ id, resource, expires: now + 24 * 60 * 60 * 1000 })).toString("base64url");
  return `${payload}.${signature(payload)}`;
}
export function readResourceAccessToken(token: string, resource: ResourceId, now = Date.now()) {
  if (token.length > 1000) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, signed] = parts;
  const expected = signature(payload);
  if (!/^[A-Za-z0-9_-]{43}$/.test(signed) || !timingSafeEqual(Buffer.from(signed), Buffer.from(expected))) return null;
  try {
    const grant = grantSchema.safeParse(JSON.parse(Buffer.from(payload, "base64url").toString("utf8")));
    return grant.success && grant.data.resource === resource && grant.data.expires > now ? grant.data : null;
  } catch { return null; }
}
export const resourceFiles = {
  checklist: "document-checklist.pdf",
  statement: "personal-statement-guide.pdf",
} as const;
export const workbookUrl = "https://docs.google.com/document/d/1ivwJ9Z5_8Wp1hdBx53QxIikHIflXSaLVQIaF9suMn7k/edit?usp=sharing";
