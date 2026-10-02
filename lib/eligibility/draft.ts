"use client";

import { DRAFT_KEY, RULES_VERSION, routes, type Route, type Answers } from "./questions";

export type Draft = { version: string; createdAt: number; submissionId: string; route: Route; answers: Answers; consent: boolean; completed: boolean };
export function loadDraft(): Draft | null {
  const raw = sessionStorage.getItem(DRAFT_KEY);
  if (!raw || raw.length > 16_384) return null;
  try {
    const draft = JSON.parse(raw) as Draft;
    if (draft.version !== RULES_VERSION || !routes.some((route) => route.id === draft.route) || !draft.answers || typeof draft.answers !== "object" || typeof draft.createdAt !== "number" || Date.now() - draft.createdAt > 86_400_000 || typeof draft.submissionId !== "string") {
      sessionStorage.removeItem(DRAFT_KEY); return null;
    }
    return draft;
  } catch { return null; }
}
export function saveDraft(draft: Draft) { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); }
export function clearDraft() { sessionStorage.removeItem(DRAFT_KEY); }
export class ClientError extends Error { constructor(public status: number, message: string) { super(message); } }
export async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new ClientError(response.status, payload.error || "We couldn’t complete the request. Please try again.");
  return payload;
}
export async function submitDraft(draft: Draft): Promise<string> {
  const result = await postJson<{ id: string }>("/api/assessments", { submissionId: draft.submissionId, route: draft.route, answers: draft.answers, consent: draft.consent });
  try { clearDraft(); } catch { /* Saving succeeded even if browser storage is unavailable. */ }
  return result.id;
}
