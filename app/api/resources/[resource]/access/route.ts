import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { adminClient } from "@/lib/supabase/server";
import { isResourceId } from "@/lib/resources/catalog";
import { readResourceAccessToken, resourceFiles, workbookUrl } from "@/lib/resources/access";
import { HttpError, errorResponse } from "@/lib/server/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ resource: string }> }) {
  try {
    const { resource } = await params;
    if (!isResourceId(resource)) throw new HttpError(404, "Resource not found.");
    const token = new URL(request.url).searchParams.get("token") ?? "";
    const grant = readResourceAccessToken(token, resource);
    if (!grant) throw new HttpError(403, "This link has expired or is invalid. Return to Free resources and complete the form for a new link.");
    const db = adminClient();
    const saved = await db.from("resource_requests").select("id,accessed_at").eq("id", grant.id).eq("resource", resource).maybeSingle();
    if (saved.error) throw new HttpError(503, "We couldn’t open your resource. Please try again shortly.");
    if (!saved.data) throw new HttpError(403, "Please complete the resource form first.");
    const bytes = resource === "workbook" ? null : await readFile(join(process.cwd(), "content/resources", resourceFiles[resource]));
    if (!saved.data.accessed_at) {
      const accessed = await db.from("resource_requests").update({ accessed_at: new Date().toISOString() }).eq("id", grant.id).is("accessed_at", null);
      if (accessed.error) throw new HttpError(503, "We couldn’t open your resource. Please try again shortly.");
    }
    const headers = { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer", "X-Content-Type-Options": "nosniff" };
    if (resource === "workbook") return new Response(null, { status: 303, headers: { ...headers, Location: workbookUrl } });
    return new Response(new Uint8Array(bytes!), { headers: { ...headers, "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${resourceFiles[resource]}"` } });
  } catch (error) { return errorResponse(error); }
}
