import {test} from "node:test";
import assert from "node:assert/strict";
import {safeReturnTo} from "../lib/auth/return-to";
import {chatInput} from "../lib/grace-ai/schema";
const id="00000000-0000-4000-8000-000000000001";
test("sign-in preserves the client's exact supported workspace task",()=>{
 for(const path of ["/dashboard/requests","/dashboard/services/full-support","/dashboard/services/document-review","/dashboard/reports","/dashboard/grace-ai","/dashboard/eligibility","/dashboard/account",`/dashboard/requests/${id}`,`/dashboard/grace-ai?conversation=${id}`,`/dashboard/reports?assessment=${id}`,`/dashboard/services/full-support?assessment=${id}`])assert.equal(safeReturnTo(path),path);
 assert.equal(safeReturnTo(`/dashboard/requests/${id}?payment=returned`),`/dashboard/requests/${id}?payment=returned`);
});
test("return paths cannot redirect outside the account or forward arbitrary query data",()=>{
 for(const path of ["//evil.example","https://evil.example","/\\evil.example","/dashboard\r\nlocation: https://evil.example","/dashboard/unknown","/api/admin/setup"])assert.equal(safeReturnTo(path),"/dashboard");
 assert.equal(safeReturnTo("/dashboard/reports?assessment=not-an-id&next=https://evil.example"),"/dashboard/reports");
 assert.equal(safeReturnTo(`/dashboard/grace-ai?conversation=${id}&system=override`),`/dashboard/grace-ai?conversation=${id}`);
});
test("natural chat accepts short follow-ups while rejecting empty messages",()=>{
 const v={id,requestId:crypto.randomUUID(),route:"digital-technology",assessmentId:null,consent:true};assert(chatInput.safeParse({...v,message:"Yes"}).success);assert(!chatInput.safeParse({...v,message:"   "}).success);
});
