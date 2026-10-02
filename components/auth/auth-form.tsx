"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { loadDraft, postJson, submitDraft } from "@/lib/eligibility/draft";
import { normaliseVerificationCode, OTP_MAX_LENGTH, OTP_MIN_LENGTH, OTP_PATTERN } from "@/lib/auth/verification-code";
import { safeReturnTo } from "@/lib/auth/return-to";

export function AuthForm({ mode, fromChecker, next }: { mode: "signup" | "login"; fromChecker: boolean; next?: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [consent, setConsent] = useState(false);
  const [step, setStep] = useState<"details" | "code" | "verified">("details");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  useEffect(() => {
    if (!countdown) return;
    const timer = setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  async function send(event?: FormEvent) {
    event?.preventDefault(); setBusy(true); setError("");
    try {
      await postJson("/api/auth/otp", { email: email.trim(), ...(mode === "signup" ? { name: name.trim() } : {}), mode, consent });
      setStep("code"); setCountdown(60);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to send a code. Please try again."); }
    finally { setBusy(false); }
  }
  async function finish() {
    setBusy(true); setError("");
    try {
      let draft = null;
      try { draft = loadDraft(); } catch { /* Standalone sign-in does not require draft storage. */ }
      if (draft?.completed && draft.consent) {
        const id = await submitDraft(draft);
        router.replace(next ? safeReturnTo(next) : `/dashboard?assessment=${id}`);
      } else if (fromChecker && draft) router.replace("/eligibility");
      else router.replace(safeReturnTo(next));
      router.refresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Your account is ready, but we couldn’t save your result yet. Please retry."); }
    finally { setBusy(false); }
  }
  async function verify(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      await postJson("/api/auth/verify", { email: email.trim(), code });
      setStep("verified"); await finish();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Please check your code and try again."); }
    finally { setBusy(false); }
  }

  return <div className="auth-layout">
    <aside className="auth-story"><p className="eyebrow">LITERALLYGLOBAL</p><h1>Your talent.<br />A bigger<br /><em>world.</em></h1><p>{fromChecker ? "You’ve answered the questions. Now turn that clarity into your next step." : "Your results, your next steps, and the support to move forward."}</p><div className="auth-benefits"><p>01 <span>A personal evidence-readiness score</span></p><p>02 <span>Recommendations saved to your account</span></p><p>03 <span>Your report delivered by email</span></p></div></aside>
    <div className="auth-card">
      <p className="eyebrow">{step === "code" ? "CHECK YOUR INBOX" : mode === "signup" ? "YOUR NEXT CHAPTER STARTS HERE" : "WELCOME BACK"}</p>
      <h2>{step === "code" ? "Verify your email." : step === "verified" ? "You’re signed in." : mode === "signup" ? "Create your free account." : "Sign in to your account."}</h2>
      {step === "details" ? <form onSubmit={send}>
        <p>{mode === "signup" ? "Get your score and personalised next steps. We’ll email you a code to keep your result private." : "We’ll email you a one-time code. No password to remember."}</p>
        {mode === "signup" && <label className="field-label" htmlFor="full-name">Your name<input id="full-name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required maxLength={80} /></label>}
        <label className="field-label" htmlFor="email">Email address<input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={254} /></label>
        {mode === "signup" && <label className="consent-label"><input type="checkbox" required checked={consent} onChange={(event) => setConsent(event.target.checked)} /><span>I’ve read the <Link href="/privacy" target="_blank">privacy notice</Link> and understand my email will be used for account access and requested results.</span></label>}
        {error && <p role="alert" className="form-error">{error}</p>}
        <button className="button button-gold full-width" disabled={busy}>{busy ? "Sending your code…" : mode === "signup" ? "Create account & continue" : "Email my sign-in code"} <span aria-hidden="true">↗</span></button>
      </form> : step === "code" ? <form onSubmit={verify}>
        <p>If the address can be used for {mode === "signup" ? "signup" : "sign-in"}, a verification code is on its way to <strong>{email}</strong>. Enter every digit from the email.</p>
        <label className="field-label" htmlFor="code">Email verification code<input id="code" className="otp-input" type="text" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(event) => setCode(normaliseVerificationCode(event.target.value))} pattern={OTP_PATTERN} minLength={OTP_MIN_LENGTH} maxLength={OTP_MAX_LENGTH} required autoFocus /></label>
        {error && <p role="alert" className="form-error">{error}</p>}
        <button className="button button-dark full-width" disabled={busy}>{busy ? "Verifying and saving…" : "Verify & continue"}</button>
        <div className="form-actions"><button className="text-button" type="button" onClick={() => { setStep("details"); setError(""); setCode(""); }} disabled={busy}>Change email</button><button className="text-button" type="button" onClick={() => send()} disabled={busy || countdown > 0}>{countdown ? `Resend in ${countdown}s` : "Resend code"}</button></div>
      </form> : <div><p>Your email is verified. We’re ready to save your completed assessment.</p>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-dark full-width" disabled={busy} onClick={finish}>{busy ? "Saving…" : "Continue to my result"}</button></div>}
      <p className="auth-switch">{mode === "signup" ? "Already have an account?" : "New to LiterallyGlobal?"} <Link href={`/${mode === "signup" ? "login" : "signup"}?${new URLSearchParams({ ...(fromChecker ? { from: "checker" } : {}), ...(next ? { next: safeReturnTo(next) } : {}) })}`}>{mode === "signup" ? "Sign in" : "Create an account"}</Link></p>
    </div>
  </div>;
}
