import { z } from "zod";
export const chatInput = z.object({
 id:z.uuid(), requestId:z.uuid(), route:z.enum(["digital-technology","academia-research","design"]),
 assessmentId:z.uuid().nullable(), message:z.string().trim().min(1).max(3000), consent:z.literal(true),
}).strict();
export const chatReport = z.object({reply:z.string().min(1).max(6000),summary:z.string().max(3000),strengths:z.array(z.string().max(1000)).max(8),gaps:z.array(z.string().max(1000)).max(8),nextSteps:z.array(z.string().max(1000)).max(8)}).strict();
export type ChatReport=z.infer<typeof chatReport>&{rulesVersion?:string;knowledgeSource?:string;knowledgeVersion?:string};
export type Turn={requestId:string;message:string;reply:string;at:string};
export type Conversation={id:string;route:string;assessment_id:string|null;turns:Turn[];report:ChatReport|null;version:number;created_at:string;updated_at:string};
