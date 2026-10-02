"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearDraft, loadDraft, postJson, submitDraft, type Draft } from "@/lib/eligibility/draft";

export function SignOutButton() {
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const router = useRouter();
  async function signOut() {
    setBusy(true); setError("");
    try { await postJson("/api/auth/signout", {}); try { clearDraft(); for(let i=sessionStorage.length-1;i>=0;i--){const key=sessionStorage.key(i);if(key?.startsWith("literallyglobal.intake."))sessionStorage.removeItem(key);} } catch { /* Session revocation already succeeded. */ } router.replace("/"); router.refresh(); }
    catch { setError("Couldn’t sign out. Please retry."); }
    finally { setBusy(false); }
  }
  return <div><button className="text-button" onClick={signOut} disabled={busy}>{busy ? "Signing out…" : "Sign out"}</button>{error && <p role="alert" className="form-error">{error}</p>}</div>;
}

export function PendingAssessment() {
  const [draft, setDraft] = useState<Draft | null>(null); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const router = useRouter();
  useEffect(() => { try { const pending = loadDraft(); if (pending?.completed && pending.consent) setDraft(pending); } catch { /* No pending draft in this tab. */ } }, []);
  if (!draft) return null;
  async function finish() {
    if (!draft) return;
    setBusy(true); setError("");
    try { const id = await submitDraft(draft); setDraft(null); router.push(`/dashboard?assessment=${id}`); router.refresh(); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Couldn’t save your assessment. Please retry."); }
    finally { setBusy(false); }
  }
  return <div className="pending-assessment"><div><strong>Your completed check is ready to save.</strong><p>Save it to reveal your result and queue your email report.</p>{error && <p role="alert" className="form-error">{error}</p>}</div><button className="button button-dark" disabled={busy} onClick={finish}>{busy ? "Saving…" : "Save & reveal my result"}</button></div>;
}

export function EmailStatus({ assessmentId, status, attempts }: { assessmentId: string; status: string; attempts: number }) {
  const [current, setCurrent] = useState(status); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  useEffect(() => { setCurrent(status); setError(""); }, [assessmentId, status]);
  async function retry() {
    setBusy(true); setError("");
    try { const result = await postJson<{ status: string }>(`/api/assessments/${assessmentId}/email`, {}); setCurrent(result.status); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "We couldn’t retry the email yet."); }
    finally { setBusy(false); }
  }
  return <div className="email-status"><p>{current === "sent" ? "Your report has been handed to our email provider for delivery to your verified address. Check your inbox and spam folder." : attempts >= 5 ? "We couldn’t deliver your email after several attempts. Your result is saved here; contact us for help." : current === "failed" ? "Your result is saved. Email delivery needs another attempt." : "Your email report is queued. Your full result is available here."}</p>{current !== "sent" && attempts < 5 && <button className="text-button" onClick={retry} disabled={busy}>{busy ? "Checking delivery…" : "Retry email delivery"}</button>}{error && <p role="alert" className="form-error">{error}</p>}</div>;
}
