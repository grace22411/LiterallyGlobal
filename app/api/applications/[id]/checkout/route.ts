import { z } from "zod";
import { requireUser,ownApplication } from "@/lib/applications/access";
import { checkoutFor } from "@/lib/applications/payments";
import { errorResponse,HttpError,limitRequests,sameOrigin } from "@/lib/server/http";
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){try{sameOrigin(request);const user=await requireUser();const {id}=await params;if(!z.uuid().safeParse(id).success)throw new HttpError(404,"Application not found.");const application=await ownApplication(id,user.id);if(application.service!=="document-review"||application.status==="draft")throw new HttpError(400,"Submit your document review request before paying.");await limitRequests(`checkout:${user.id}`,15,3600);return Response.json(await checkoutFor(application),{headers:{"Cache-Control":"no-store"}});}catch(error){return errorResponse(error);}}
