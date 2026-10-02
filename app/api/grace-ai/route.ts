import {RULES_VERSION} from "@/lib/eligibility/questions";
import {GRACE_AI_AVAILABLE,GRACE_AI_COMING_SOON} from "@/lib/grace-ai/availability";
import {knowledgeStatus} from "@/lib/knowledge/gtv";
import { requireUser } from "@/lib/applications/access";
import { chatInput,type Conversation } from "@/lib/grace-ai/schema";
import { graceConfigured,graceReply } from "@/lib/grace-ai/respond";
import { adminClient } from "@/lib/supabase/server";
import { errorResponse,HttpError,limitRequests,requestBody,sameOrigin } from "@/lib/server/http";
export const maxDuration=60;
export async function POST(request:Request){try{
 sameOrigin(request);const user=await requireUser();if(!GRACE_AI_AVAILABLE)throw new HttpError(503,GRACE_AI_COMING_SOON);const parsed=chatInput.safeParse(await requestBody(request));if(!parsed.success)throw new HttpError(400,"Choose your route, acknowledge the privacy notice and write a message of 1–3,000 characters.");const v=parsed.data;
 if(!graceConfigured())throw new HttpError(503,"Grace AI is being prepared. Please use the eligibility checker or book a consultation for now.");
 await limitRequests(`grace:${user.id}`,20,3600);const db=adminClient();let assessment=null;
 if(v.assessmentId){const a=await db.from("assessments").select("result,route").eq("id",v.assessmentId).eq("user_id",user.id).maybeSingle();if(a.error)throw new HttpError(503,"Unable to load your assessment.");if(!a.data||a.data.route!==v.route)throw new HttpError(400,"Choose an assessment for this route from your account.");assessment=a.data.result;}
 const existing=await db.from("grace_conversations").select("*").eq("id",v.id).eq("user_id",user.id).maybeSingle();if(existing.error)throw new HttpError(503,"Conversations are not available yet. Please try again later.");
 let conversation=existing.data as Conversation|null;
 if(!conversation){const inserted=await db.from("grace_conversations").insert({id:v.id,user_id:user.id,route:v.route,assessment_id:v.assessmentId}).select("*").single();if(inserted.error)throw new HttpError(409,"This conversation could not be started. Refresh and try again.");conversation=inserted.data as Conversation;}
 if(conversation.route!==v.route||conversation.assessment_id!==v.assessmentId)throw new HttpError(409,"Start a new conversation to change your route or linked assessment.");
 const prior=conversation.turns.find(t=>t.requestId===v.requestId);
 if(prior){if(prior.message!==v.message)throw new HttpError(409,"This message has already been sent. Reload your conversation.");return Response.json(conversation,{headers:{"Cache-Control":"no-store"}});}
 if(conversation.turns.length>=20)throw new HttpError(400,"This conversation has reached 20 messages. Download your report or start a new discussion.");
 const report={...await graceReply(v.route,conversation.turns,v.message,assessment),rulesVersion:RULES_VERSION,knowledgeSource:knowledgeStatus.name,knowledgeVersion:knowledgeStatus.version};
 const turns=[...conversation.turns,{requestId:v.requestId,message:v.message,reply:report.reply,at:new Date().toISOString()}];
 const saved=await db.from("grace_conversations").update({turns,report,version:conversation.version+1,updated_at:new Date().toISOString()}).eq("id",v.id).eq("user_id",user.id).eq("version",conversation.version).select("id,route,assessment_id,turns,report,version,created_at,updated_at").maybeSingle();
 if(saved.error)throw new HttpError(503,"Your reply could not be saved. Please retry your message.");if(!saved.data)throw new HttpError(409,"This conversation changed in another tab. Reload before continuing.");return Response.json(saved.data,{headers:{"Cache-Control":"no-store"}});
}catch(error){return errorResponse(error);}}
