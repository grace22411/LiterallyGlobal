"use client";
import Link from "next/link";
export default function ClientError({reset}:{error:Error;reset:()=>void}){return <main className="container app-page"><p className="eyebrow">PLEASE TRY AGAIN</p><h1>We couldn’t load this page.</h1><p>Your saved information has not been changed. Please retry or return to your dashboard.</p><div className="report-actions"><button className="button button-gold" onClick={reset}>Try again</button><Link className="button button-outline" href="/dashboard">Back to dashboard</Link></div></main>;}
