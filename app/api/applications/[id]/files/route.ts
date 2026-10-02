import { z } from "zod";
import { requireUser,ownApplication } from "@/lib/applications/access";
import { adminClient } from "@/lib/supabase/server";
import { errorResponse,HttpError,limitRequests,sameOrigin } from "@/lib/server/http";
import { MAX_FILE_BYTES } from "@/lib/applications/schema";
import { documentType } from "@/lib/applications/files";
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){try{
 sameOrigin(request);const user=await requireUser();const {id}=await params;if(!z.uuid().safeParse(id).success)throw new HttpError(404,"Application not found.");const application=await ownApplication(id,user.id);if(application.status!=="draft")throw new HttpError(409,"This application has already been submitted.");
 await limitRequests(`upload:${user.id}`,40,3600);const max=MAX_FILE_BYTES+65536;
 if(!request.headers.get("content-type")?.startsWith("multipart/form-data"))throw new HttpError(415,"Choose a document to upload.");
 if(Number(request.headers.get("content-length")??0)>max)throw new HttpError(413,"Each document must be 10 MB or less.");
 const reader=request.body?.getReader();if(!reader)throw new HttpError(400,"No file supplied.");const chunks:Uint8Array[]=[];let total=0;
 while(true){const {done,value}=await reader.read();if(done)break;total+=value.length;if(total>max){await reader.cancel();throw new HttpError(413,"Each document must be 10 MB or less.");}chunks.push(value);}
 const form=await new Response(Buffer.concat(chunks),{headers:{"Content-Type":request.headers.get("content-type")!}}).formData();const file=form.get("file");if(!(file instanceof File)||form.getAll("file").length!==1)throw new HttpError(400,"Upload one document at a time.");
 const bytes=new Uint8Array(await file.arrayBuffer());const valid=documentType(file.name,bytes);if(!valid)throw new HttpError(400,"Use a PDF, DOCX, PNG or JPG up to 10 MB.");
 const db=adminClient();const fileId=crypto.randomUUID();const path=`${user.id}/${id}/${fileId}.${valid.ext}`;
 const upload=await db.storage.from("application-documents").upload(path,bytes,{contentType:valid.mime,upsert:false});if(upload.error)throw new HttpError(503,"The document could not be uploaded. Please retry or use a Drive folder.");
 const saved=await db.rpc("register_application_file",{p_id:fileId,p_application:id,p_user:user.id,p_name:valid.name,p_mime:valid.mime,p_size:bytes.length,p_path:path});
 if(saved.error){await db.storage.from("application-documents").remove([path]);throw new HttpError(400,"We couldn’t attach this file. Use up to 10 files and 50 MB in total.");}
 return Response.json({id:fileId,name:valid.name},{headers:{"Cache-Control":"no-store"}});
}catch(error){return errorResponse(error);}}
