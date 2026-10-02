import { z } from "zod";
import { resourceIds } from "./catalog";
const text = (maximum: number) => z.string().trim().min(1).max(maximum).regex(/^[^\u0000-\u001f\u007f]+$/);
export const resourceRequestSchema = z.object({
  submissionId: z.uuid(),
  resource: z.enum(resourceIds),
  name: text(100),
  email: z.string().trim().toLowerCase().pipe(z.email().max(254)),
  phone: z.string().trim().max(40).transform((v) => v.replace(/[\s().-]/g, "")).pipe(z.string().regex(/^\+[1-9]\d{6,14}$/)),
  location: text(160),
}).strict();
