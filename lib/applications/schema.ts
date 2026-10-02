import { z } from "zod";

export const servicesWithIntake = ["document-review", "full-support"] as const;
export type IntakeService = typeof servicesWithIntake[number];
export const fileTypes = { pdf: "application/pdf", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg" } as const;
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_FILES = 10;
export const MAX_TOTAL_BYTES = 50 * 1024 * 1024;
export function validDriveFolder(value: string) {
  try { const url = new URL(value); return url.protocol === "https:" && url.hostname === "drive.google.com" && !url.username && !url.password && /^\/drive\/(?:u\/\d+\/)?folders\/[a-zA-Z0-9_-]+\/?$/.test(url.pathname); } catch { return false; }
}
export const intakeSchema = z.object({
  submissionId: z.uuid(), service: z.enum(servicesWithIntake), name: z.string().trim().min(2).max(100),
  email: z.email().max(254), whatsapp: z.string().trim().transform((v) => v.replace(/[\s()-]/g, "")).pipe(z.string().regex(/^\+[1-9]\d{6,14}$/)),
  notes: z.string().trim().max(6000), driveUrl: z.string().trim().max(1000).refine((v) => !v || validDriveFolder(v), "Use a Google Drive folder link."),
  documentMethod: z.enum(["drive", "upload"]), paymentPlan: z.enum(["once", "twice"]).nullable(),
  assessmentId: z.uuid().nullable(), conversationId: z.uuid().nullable(), consent: z.literal(true),
}).strict().superRefine((v, ctx) => {
  if (v.service === "document-review" && !v.paymentPlan) ctx.addIssue({ code: "custom", message: "Choose a payment option.", path: ["paymentPlan"] });
  if (v.service === "full-support" && v.paymentPlan) ctx.addIssue({ code: "custom", message: "Full support starts with an application review.", path: ["paymentPlan"] });
  if (v.service === "document-review" && v.documentMethod === "drive" && !v.driveUrl) ctx.addIssue({ code: "custom", message: "Add your Drive folder link.", path: ["driveUrl"] });
  if (v.service === "full-support" && !v.assessmentId && !v.conversationId) ctx.addIssue({ code: "custom", message: "Complete an eligibility check first, or attach an existing saved discussion report.", path: ["assessmentId"] });
});
export type IntakeInput = z.infer<typeof intakeSchema>;
export const adminUpdateSchema = z.object({
  status: z.enum(["submitted", "in_review", "awaiting_information", "accepted", "completed"]),
  decision: z.enum(["pending", "suitable", "build_evidence", "consultation"]),
  verdict: z.string().trim().max(6000), internalNotes: z.string().trim().max(6000), version: z.number().int().nonnegative(),
}).strict().refine((v) => v.decision === "pending" || v.verdict.length >= 10, { message: "Add a clear explanation for the client.", path: ["verdict"] });
