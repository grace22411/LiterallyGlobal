import { intakeSchema } from "@/lib/applications/schema";
import { requireUser } from "@/lib/applications/access";
import { adminClient } from "@/lib/supabase/server";
import { errorResponse,HttpError,limitRequests,requestBody,sameOrigin } from "@/lib/server/http";
export async function POST(request:Request){try{
 sameOrigin(request);const user=await requireUser();const parsed=intakeSchema.safeParse(await requestBody(request));
 if(!parsed.success)throw new HttpError(400,parsed.error.issues[0]?.message??"Check your form.");
 const v=parsed.data;if(v.email.toLowerCase()!==user.email!.toLowerCase())throw new HttpError(400,"Use your verified account email.");
 await limitRequests(`application:${user.id}`,20,3600);const db=adminClient();let readiness=null;
 if(v.assessmentId){const a=await db.from("assessments").select("result").eq("id",v.assessmentId).eq("user_id",user.id).maybeSingle();if(a.error)throw new HttpError(503,"Unable to load your report.");if(!a.data)throw new HttpError(400,"Select a report from your account.");readiness=a.data.result;}
 if(v.conversationId){const c=await db.from("grace_conversations").select("id,report").eq("id",v.conversationId).eq("user_id",user.id).maybeSingle();if(c.error)throw new HttpError(503,"Unable to load your conversation.");if(!c.data?.report)throw new HttpError(400,"Finish a Grace AI conversation before attaching it.");}
 const row={user_id:user.id,submission_id:v.submissionId,service:v.service,name:v.name,email:user.email!,whatsapp:v.whatsapp,notes:v.notes,drive_url:v.driveUrl,document_method:v.documentMethod,payment_plan:v.paymentPlan,assessment_id:v.assessmentId,conversation_id:v.conversationId,readiness};
 const saved=await db.from("service_applications").insert(row).select("id").single();
 if(saved.error?.code==="23505"){
  const old=await db.from("service_applications").select("*").eq("user_id",user.id).eq("submission_id",v.submissionId).single();
  if(old.error)throw new HttpError(503,"Unable to recover your saved form.");
  if(Object.entries(row).some(([k,value])=>k!=="readiness"&&old.data[k]!==value))throw new HttpError(409,"This form has already been saved with different information. Start a new request.");
  return Response.json({id:old.data.id},{headers:{"Cache-Control":"no-store"}});
 }
 if(saved.error)throw new HttpError(503,"We couldn’t save your form. Your information is still here; please retry.");
 return Response.json({id:saved.data.id},{headers:{"Cache-Control":"no-store"}});
}catch(error){return errorResponse(error);}}
