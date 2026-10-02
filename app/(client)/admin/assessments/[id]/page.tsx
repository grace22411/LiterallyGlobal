import Link from "next/link";
import {notFound} from "next/navigation";
import {z} from "zod";
import {requireAdmin} from "@/lib/applications/access";
import {adminClient} from "@/lib/supabase/server";
import {userLabels} from "@/lib/admin/data";
import {questionsForVersion} from "@/lib/eligibility/questions";
import type {Route} from "@/lib/eligibility/questions";
import {ResultPanel} from "@/components/dashboard/result-panel";
export const metadata={title:"Admin · Assessment detail"};
export default async function Assessment({params}:{params:Promise<{id:string}>}){await requireAdmin();const{id}=await params;if(!z.uuid().safeParse(id).success)notFound();const{data:a,error}=await adminClient().from("assessments").select("*").eq("id",id).maybeSingle();if(error)throw new Error("Unable to load this check.");if(!a)notFound();const labels=await userLabels([a.user_id]);const questions=questionsForVersion(a.route as Route,a.answers,a.rules_version);return <><Link href="/admin/assessments" className="workspace-back">← Eligibility checks</Link><div className="workspace-page-heading"><div><p className="eyebrow">SAVED ASSESSMENT</p><h1>{labels[a.user_id]?.name}</h1><p>{labels[a.user_id]?.email}</p></div><Link href={`/admin/users/${a.user_id}`} className="button button-outline">View client profile ↗</Link></div><ResultPanel id={a.id} result={a.result} createdAt={a.created_at} email={null} adminView/><section className="workspace-panel"><h2>Submitted answers</h2><p className="fine-print">This result retains rules version {a.rules_version}. Saved scores are not recalculated when the questionnaire changes.</p><dl className="admin-answer-list">{Object.entries(a.answers as Record<string,string>).map(([id,value])=>{const q=questions.find(q=>q.id===id);return <div key={id}><dt>{q?.title??id.replaceAll("_"," ")}</dt><dd>{String(value).split("|").map(v=>q?.options.find(o=>o.value===v)?.label??v).join(" · ")}</dd></div>;})}</dl></section></>;}
