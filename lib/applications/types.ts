import type { EligibilityResult } from "@/lib/eligibility/evaluate";
export type Application = {
 id: string; user_id: string; submission_id: string; service: "document-review" | "full-support"; name: string; email: string; whatsapp: string;
 notes: string; drive_url: string; document_method: "drive" | "upload"; payment_plan: "once" | "twice" | null;
 assessment_id: string | null; conversation_id: string | null; readiness: EligibilityResult | null;
 status: string; decision: string; verdict: string; internal_notes?: string; version: number; created_at: string; submitted_at: string | null;
};
export type ApplicationFile = { id: string; application_id: string; name: string; mime_type: string; byte_size: number; storage_path: string; created_at: string };
export type Payment = { id: string; installment: number; amount: number; status: string; paid_at: string | null; checkout_id?: string; checkout_url?: string };
export const statusLabels: Record<string, string> = { draft: "Draft", submitted: "Submitted", in_review: "In review", awaiting_information: "More information needed", accepted: "Accepted", completed: "Completed" };
