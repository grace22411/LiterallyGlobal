import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

test("resource contact records are private and preserve one request across retries", async () => {
  const db = new PGlite();
  try {
    await db.exec("create role anon; create role authenticated; create role service_role bypassrls; grant usage on schema public to anon,authenticated,service_role;");
    await db.exec(await readFile(new URL("../supabase/migrations/202610020002_resources.sql", import.meta.url), "utf8"));
    await db.exec("set role service_role");
    const id = crypto.randomUUID();
    const insert = "insert into resource_requests(id,resource,name,email,phone,location) values($1,'checklist','Client','client@example.com','+447700900123','London, UK')";
    await db.query(insert, [id]);
    await assert.rejects(db.query(insert, [id]), /duplicate key/);
    await db.query("update resource_requests set accessed_at=now() where id=$1", [id]);
    assert.equal((await db.query("select * from resource_requests where accessed_at is not null")).rows.length, 1);
    await assert.rejects(db.query("update resource_requests set resource='community' where id=$1", [id]), /check constraint/);
    for (const role of ["anon", "authenticated"]) {
      await db.exec(`reset role; set role ${role}`);
      await assert.rejects(db.query("select * from resource_requests"), /permission denied/);
      await assert.rejects(db.query(insert, [crypto.randomUUID()]), /permission denied/);
      await assert.rejects(db.query("update resource_requests set location='Changed'"), /permission denied/);
    }
  } finally { await db.close(); }
});
