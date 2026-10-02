import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
test("service database protects documents and admin notes, orders installments and rejects incorrect payment confirmations",async()=>{
 const db=new PGlite();try{
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema public,auth to anon,authenticated,service_role;grant execute on function auth.uid() to authenticated;grant select on auth.users to service_role;create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);`);
 for(const file of ["202610010001_eligibility.sql","202610020001_services.sql"])await db.exec(await readFile(new URL(`../supabase/migrations/${file}`,import.meta.url),"utf8"));
 const owner=crypto.randomUUID(),stranger=crypto.randomUUID();await db.query("insert into auth.users values($1),($2)",[owner,stranger]);
 assert.equal((await db.query<{public:boolean}>("select public from storage.buckets")).rows[0].public,false);
 await db.exec("set role service_role");
 const application=(await db.query<{id:string}>("insert into service_applications(user_id,submission_id,service,name,email,whatsapp,document_method,payment_plan,internal_notes) values($1,$2,'document-review','Client','client@example.com','+447700900000','upload','twice','team only') returning id",[owner,crypto.randomUUID()])).rows[0].id;
 await assert.rejects(db.query("select submit_service_application($1,$2)",[application,owner]),/Documents required/);
 await assert.rejects(db.query("select register_application_file($1,$2,$3,'cv.pdf','application\/pdf',100,'private/path')",[crypto.randomUUID(),application,stranger]),/unavailable/);
 for(let i=0;i<10;i++)await db.query("select register_application_file($1,$2,$3,'cv.pdf','application/pdf',100,$4)",[crypto.randomUUID(),application,owner,`private/path${i}`]);
 await assert.rejects(db.query("select register_application_file($1,$2,$3,'cv.pdf','application/pdf',100,'extra')",[crypto.randomUUID(),application,owner]),/limit/);
 await db.query("select submit_service_application($1,$2)",[application,owner]);await db.query("select submit_service_application($1,$2)",[application,owner]);
 assert.equal((await db.query("select * from application_activity")).rows.length,1);
 await db.exec("reset role;set role authenticated");await db.query("select set_config('request.jwt.claim.sub',$1,false)",[owner]);assert.equal((await db.query("select id from service_applications")).rows.length,1);assert.equal((await db.query("select id,name from application_files")).rows.length,10);
 await assert.rejects(db.query("select internal_notes from service_applications"),/permission denied/);await assert.rejects(db.query("select storage_path from application_files"),/permission denied/);await assert.rejects(db.query("select reserve_review_payment($1,$2)",[application,owner]),/permission denied/);await assert.rejects(db.query("update service_applications set status='accepted'"),/permission denied/);
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[stranger]);assert.equal((await db.query("select id from service_applications")).rows.length,0);assert.equal((await db.query("select id from application_files")).rows.length,0);
 await db.exec("reset role;set role service_role");
 await assert.rejects(db.query("select reserve_review_payment($1,$2)",[application,stranger]),/not available/);
 type Order={id:string;attempt_id:string;amount:number;installment:number};const first=(await db.query<Order>("select * from reserve_review_payment($1,$2)",[application,owner])).rows[0];assert.equal(first.amount,50000);assert.equal(first.installment,1);
 await assert.rejects(db.query("select reserve_review_payment($1,$2)",[application,owner]),/being prepared/);
 await assert.rejects(db.query("select confirm_review_payment($1,$2,'cs_first',1,'gbp','pi_first')",[first.id,first.attempt_id]),/mismatch/);
 await assert.rejects(db.query("select confirm_review_payment($1,$2,'cs_first',50000,'usd','pi_first')",[first.id,first.attempt_id]),/mismatch/);
 await db.query("select confirm_review_payment($1,$2,'cs_first',50000,'gbp','pi_first')",[first.id,first.attempt_id]);await db.query("select confirm_review_payment($1,$2,'cs_first',50000,'gbp','pi_first')",[first.id,first.attempt_id]);
 const second=(await db.query<Order>("select * from reserve_review_payment($1,$2)",[application,owner])).rows[0];assert.equal(second.installment,2);assert.equal(second.amount,50000);assert.notEqual(second.id,first.id);
 await db.query("select confirm_review_payment($1,$2,'cs_second',50000,'gbp','pi_second')",[second.id,second.attempt_id]);assert.equal((await db.query("select * from reserve_review_payment($1,$2)",[application,owner])).rows.length,0);
 assert.equal((await db.query<{total:string}>("select sum(amount) as total from application_payments where status='paid'")).rows[0].total,100000);
 const review=[application,owner,1,'in_review','suitable','A suitable example with specific next steps.','private'];assert.equal((await db.query<{ok:boolean}>("select review_service_application($1,$2,$3,$4,$5,$6,$7) as ok",review)).rows[0].ok,true);assert.equal((await db.query<{ok:boolean}>("select review_service_application($1,$2,$3,$4,$5,$6,$7) as ok",review)).rows[0].ok,false);
 await db.query("update application_payments set status='refunded' where id=$1",[first.id]);await assert.rejects(db.query("select reserve_review_payment($1,$2)",[application,owner]),/Contact the team/);
 }finally{await db.close();}
});
