import { z } from "zod";
import { requireAdmin } from "@/lib/applications/access";
import { adminUpdateSchema } from "@/lib/applications/schema";
import { adminClient } from "@/lib/supabase/server";
import { errorResponse,HttpError,requestBody,sameOrigin } from "@/lib/server/http";
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){try{
 sameOrigin(request);const user=await requireAdmin();const {id}=await params;if(!z.uuid().safeParse(id).success)throw new HttpError(404,"Application not found.");const parsed=adminUpdateSchema.safeParse(await requestBody(request));if(!parsed.success)throw new HttpError(400,parsed.error.issues[0]?.message??"Check your review.");const v=parsed.data;
 const {data,error}=await adminClient().rpc("review_service_application",{p_id:id,p_actor:user.id,p_version:v.version,p_status:v.status,p_decision:v.decision,p_verdict:v.verdict,p_notes:v.internalNotes});if(error)throw new HttpError(503,"Unable to save your review.");if(!data)throw new HttpError(409,"This application changed. Refresh before saving again.");return Response.json({ok:true},{headers:{"Cache-Control":"no-store"}});
}catch(error){return errorResponse(error);}}
