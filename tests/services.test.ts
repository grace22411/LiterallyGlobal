import { test } from "node:test";
import assert from "node:assert/strict";
import { intakeSchema,validDriveFolder,adminUpdateSchema } from "../lib/applications/schema";
import { documentType } from "../lib/applications/files";
import { safeReturnTo } from "../lib/auth/return-to";
import { isAdminEmail } from "../lib/applications/access";
import { POST as application } from "../app/api/applications/route";
import { POST as grace } from "../app/api/grace-ai/route";
import { PATCH as review } from "../app/api/admin/applications/[id]/route";
import { POST as webhook } from "../app/api/payments/webhook/route";
import Stripe from "stripe";
const draft={submissionId:crypto.randomUUID(),service:"document-review",name:"Example Client",email:"client@example.com",whatsapp:"+44 7700 900000",notes:"",driveUrl:"https://drive.google.com/drive/folders/example",documentMethod:"drive",paymentPlan:"twice",assessmentId:null,conversationId:null,consent:true};
test("intake requires evidence or a readiness report and never accepts client prices",()=>{
 assert.equal(intakeSchema.parse(draft).whatsapp,"+447700900000");
 assert.equal(intakeSchema.safeParse({...draft,price:1}).success,false);
 assert.equal(intakeSchema.safeParse({...draft,driveUrl:""}).success,false);
 assert.equal(intakeSchema.safeParse({...draft,whatsapp:"07700900000"}).success,false);
 assert.equal(intakeSchema.safeParse({...draft,service:"full-support",paymentPlan:null,assessmentId:null}).success,false);
 assert.equal(intakeSchema.safeParse({...draft,service:"full-support",paymentPlan:null,assessmentId:crypto.randomUUID()}).success,true);
 assert.equal(intakeSchema.safeParse({...draft,consent:false}).success,false);
});
test("Drive and file inputs reject misleading hosts and mismatched file signatures",()=>{
 for(const url of ["https://drive.google.com.attacker.test/drive/folders/x","javascript:alert(1)","https://attacker@drive.google.com/drive/folders/x","https://drive.google.com/file/d/x/view","http://drive.google.com/drive/folders/x"])assert.equal(validDriveFolder(url),false);
 assert(validDriveFolder("https://drive.google.com/drive/u/0/folders/x_y-1?usp=sharing"));
 assert.equal(documentType("test.pdf",new TextEncoder().encode("<script>test</script>")),null);
 assert.equal(documentType("test.exe",new TextEncoder().encode("%PDF-test")),null);
 assert.equal(documentType("test.pdf",new TextEncoder().encode("%PDF-test"))?.mime,"application/pdf");
});
test("admin access is explicit, return URLs stay local and verdicts need explanations",()=>{
 delete process.env.ADMIN_EMAILS;assert.equal(isAdminEmail("owner@example.com"),false);
 process.env.ADMIN_EMAILS="owner@example.com";assert(isAdminEmail("Owner@example.com"));assert.equal(isAdminEmail("owner@example.com.attacker.test"),false);delete process.env.ADMIN_EMAILS;
 assert.equal(safeReturnTo("//attacker.test"),"/dashboard");assert.equal(safeReturnTo("https://attacker.test"),"/dashboard");assert.equal(safeReturnTo("/services/full-support"),"/services/full-support");
 assert.equal(adminUpdateSchema.safeParse({status:"accepted",decision:"suitable",verdict:"",internalNotes:"",version:0}).success,false);
});
test("application, AI and admin endpoints require a verified account and reject foreign origins",async()=>{
 process.env.APP_URL="https://example.com";delete process.env.NEXT_PUBLIC_SUPABASE_URL;delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;delete process.env.SUPABASE_SERVICE_ROLE_KEY;
 const req=(origin="https://example.com")=>new Request("https://example.com/api/applications",{method:"POST",headers:{origin,"Content-Type":"application/json"},body:JSON.stringify(draft)});
 assert.equal((await application(req())).status,401);assert.equal((await grace(req())).status,401);assert.equal((await review(req(),{params:Promise.resolve({id:crypto.randomUUID()})})).status,401);assert.equal((await application(req("https://attacker.test"))).status,403);
});
test("Stripe webhook verifies raw-body signatures before processing events",async()=>{
 process.env.STRIPE_SECRET_KEY="sk_test_placeholder";process.env.STRIPE_WEBHOOK_SECRET="whsec_test_placeholder";const stripe=new Stripe(process.env.STRIPE_SECRET_KEY);
 const payload=JSON.stringify({id:"evt_fixture",type:"unrelated.event",data:{object:{}}});const signature=stripe.webhooks.generateTestHeaderString({payload,secret:process.env.STRIPE_WEBHOOK_SECRET});
 const req=(body:string,sig:string)=>new Request("https://example.com/api/payments/webhook",{method:"POST",headers:{"stripe-signature":sig},body});
 assert.equal((await webhook(req(payload,signature))).status,200);assert.equal((await webhook(req(payload+" ",signature))).status,400);assert.equal((await webhook(req(payload,"t=1,v1=bad"))).status,400);delete process.env.STRIPE_SECRET_KEY;delete process.env.STRIPE_WEBHOOK_SECRET;
});
