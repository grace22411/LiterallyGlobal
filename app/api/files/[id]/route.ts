import { z } from "zod";
import { requireUser,isAdminEmail } from "@/lib/applications/access";
import { adminClient } from "@/lib/supabase/server";
import { errorResponse,HttpError } from "@/lib/server/http";
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){try{
 const user=await requireUser();const {id}=await params;if(!z.uuid().safeParse(id).success)throw new HttpError(404,"Document not found.");const db=adminClient();const file=await db.from("application_files").select("*").eq("id",id).maybeSingle();if(file.error)throw new HttpError(503,"Documents are temporarily unavailable.");if(!file.data)throw new HttpError(404,"Document not found.");
 const application=await db.from("service_applications").select("user_id").eq("id",file.data.application_id).single();if(application.error||(!isAdminEmail(user.email)&&application.data.user_id!==user.id))throw new HttpError(404,"Document not found.");
 const signed=await db.storage.from("application-documents").createSignedUrl(file.data.storage_path,60,{download:file.data.name});if(signed.error)throw new HttpError(503,"Unable to prepare your download.");return new Response(null,{status:302,headers:{Location:signed.data.signedUrl,"Cache-Control":"private, no-store","Referrer-Policy":"no-referrer"}});
}catch(error){return errorResponse(error);}}
