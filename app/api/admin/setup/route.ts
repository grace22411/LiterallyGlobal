import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { requireAdmin } from "@/lib/applications/access";
import { errorResponse } from "@/lib/server/http";
export async function GET(request: Request) {
  try {
    await requireAdmin();
    const resources = new URL(request.url).searchParams.get("feature") === "resources";
    const filename = resources ? "202610020002_resources.sql" : "202610020001_services.sql";
    const sql = await readFile(join(process.cwd(), "supabase/migrations", filename), "utf8");
    return new Response(sql, { headers: { "Content-Type": "text/plain; charset=utf-8", "Content-Disposition": `attachment; filename=literallyglobal-${resources ? "resources" : "services"}-setup.sql`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
  } catch (error) { return errorResponse(error); }
}
