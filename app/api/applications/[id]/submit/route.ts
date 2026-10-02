import { z } from "zod";
import { requireUser,ownApplication } from "@/lib/applications/access";
import { adminClient } from "@/lib/supabase/server";
import { errorResponse,HttpError,sameOrigin } from "@/lib/server/http";
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){try{sameOrigin(request);const user=await requireUser();const {id}=await params;if(!z.uuid().safeParse(id).success)throw new HttpError(404,"Application not found.");await ownApplication(id,user.id);const {error}=await adminClient().rpc("submit_service_application",{p_id:id,p_user:user.id});if(error)throw new HttpError(400,error.message.includes("Documents required")?"Add your documents before submitting.":"We couldn’t submit your application. Check your documents and try again.");return Response.json({ok:true},{headers:{"Cache-Control":"no-store"}});}catch(error){return errorResponse(error);}}
