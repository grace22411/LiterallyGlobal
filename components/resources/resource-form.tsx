"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import type { ResourceId } from "@/lib/resources/catalog";
import styles from "./resources.module.css";

type Props = { resource: ResourceId; name: string; action: string };
export function ResourceForm({ resource, name, action }: Props) {
  const prefix = useId();
  const submissionId = useRef<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const downloadRef = useRef<HTMLAnchorElement>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [href, setHref] = useState("");
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);
  useEffect(() => {
    if (href && open) downloadRef.current?.focus();
  }, [href, open]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const data = new FormData(event.currentTarget);
    submissionId.current ??= crypto.randomUUID();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/resources/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: submissionId.current, resource, name: data.get("name"), email: data.get("email"), phone: data.get("phone"), location: data.get("location") }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "We couldn’t save your details. Please try again.");
      if (typeof result.href !== "string" || !result.href.startsWith(`/api/resources/${resource}/access?token=`)) throw new Error("We couldn’t prepare your resource. Please try again.");
      setHref(result.href);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "We couldn’t connect. Please try again.");
    } finally { setBusy(false); }
  }

  return <>
    <button type="button" className="button button-outline" aria-haspopup="dialog" onClick={() => setOpen(true)}>Get this free resource <span aria-hidden="true">↗</span></button>
    <dialog ref={dialogRef} className={styles.modal} aria-labelledby={`${prefix}-title`} onCancel={() => setOpen(false)} onClose={() => setOpen(false)} onClick={(event) => {
      if (event.target !== event.currentTarget) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) setOpen(false);
    }}>
      <button type="button" className={styles.close} onClick={() => setOpen(false)} aria-label="Close resource form">×</button>
      <p className={styles.modalEyebrow}>FREE · DIGITAL TECHNOLOGY ROUTE</p>
      <h2 id={`${prefix}-title`} className={styles.modalTitle}>{name}</h2>
      {href ? <div className={styles.success} role="status">
        <span className={styles.successMark} aria-hidden="true">✓</span>
        <h3>Your resource is ready.</h3>
        <p>Your details have been saved. {resource === "workbook" ? "Open your workbook in Google Docs." : "Download your free PDF below."}</p>
        <a ref={downloadRef} className="button button-dark" href={href} target={resource === "workbook" ? "_blank" : undefined} rel="noreferrer">{action} <span aria-hidden="true">{resource === "workbook" ? "↗" : "↓"}</span></a>
      </div> : <form onSubmit={submit} onChange={() => { submissionId.current = null; }} aria-label={`Get ${name}`}>
        <p className={styles.formIntro}>A few details, then it’s yours.</p>
        <fieldset disabled={busy} className={styles.fields}>
          <label className="field-label" htmlFor={`${prefix}-name`}>Name<input id={`${prefix}-name`} name="name" autoComplete="name" required maxLength={100} /></label>
          <label className="field-label" htmlFor={`${prefix}-email`}>Email<input id={`${prefix}-email`} name="email" type="email" autoComplete="email" required maxLength={254} /></label>
          <label className="field-label" htmlFor={`${prefix}-phone`}>Phone<input id={`${prefix}-phone`} name="phone" type="tel" autoComplete="tel" placeholder="+44…" required maxLength={40} /><span className="field-help">Include your country code.</span></label>
          <label className="field-label" htmlFor={`${prefix}-location`}>Location<input id={`${prefix}-location`} name="location" autoComplete="address-level2" placeholder="City, country" required maxLength={160} /></label>
        </fieldset>
        <p className={styles.privacy}>We’ll store these details with your resource request. This does not subscribe you to marketing emails. <Link href="/privacy">Privacy notice</Link></p>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button type="submit" className="button button-dark" disabled={busy}>{busy ? "Saving your details…" : "Unlock my resource"}<span aria-hidden="true">↗</span></button>
      </form>}
    </dialog>
  </>;
}
