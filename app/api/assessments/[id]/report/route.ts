import { z } from "zod";
import { requireUser, isAdminEmail } from "@/lib/applications/access";
import { adminClient } from "@/lib/supabase/server";
import { errorResponse, HttpError } from "@/lib/server/http";
import { assessmentReport, pdfResponse } from "@/lib/reports/pdf";
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 try{const user=await requireUser();const {id}=await params;if(!z.uuid().safeParse(id).success)throw new HttpError(404,"Report not found.");
 let query=adminClient().from("assessments").select("result,created_at").eq("id",id);if(!isAdminEmail(user.email))query=query.eq("user_id",user.id);
 const {data,error}=await query.maybeSingle();if(error)throw new HttpError(503,"Reports are temporarily unavailable.");if(!data)throw new HttpError(404,"Report not found.");
 return pdfResponse(assessmentReport(data.result,data.created_at),"LiterallyGlobal-eligibility-report.pdf");
 }catch(error){return errorResponse(error);}
}
