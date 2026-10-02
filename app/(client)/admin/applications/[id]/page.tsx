import type { Metadata } from "next";
import Link from "next/link";
import { notFound,redirect } from "next/navigation";
import { z } from "zod";
import { Brand } from "@/components/brand";
import { ApplicationDetail } from "@/components/applications/application-detail";
import { ReviewForm } from "@/components/admin/review-form";
import { adminClient,verifiedUser } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/applications/access";
export const metadata:Metadata={title:"Review application",robots:{index:false,follow:false}};
export default async function AdminApplication({params}:{params:Promise<{id:string}>}){
 const user=await verifiedUser();if(!user)redirect("/login?next=%2Fadmin");if(!isAdminEmail(user.email))notFound();const{id}=await params;if(!z.uuid().safeParse(id).success)notFound();const db=adminClient();const [a,files,payments,activity]=await Promise.all([db.from("service_applications").select("*").eq("id",id).maybeSingle(),db.from("application_files").select("*").eq("application_id",id),db.from("application_payments").select("id,installment,amount,status,paid_at").eq("application_id",id),db.from("application_activity").select("id,action,created_at").eq("application_id",id).order("created_at",{ascending:false}).limit(50)]);
 if(a.error||files.error||payments.error||activity.error)throw new Error("Unable to load this application. Please retry.");if(!a.data)notFound();
 return <><Link className="workspace-back" href="/admin/requests">← All requests</Link><ApplicationDetail application={a.data} files={files.data??[]} payments={payments.data??[]} admin/><ReviewForm key={a.data.version} application={a.data}/><section className="request-card"><h2>Activity</h2><ul className="activity-list">{activity.data?.map(e=><li key={e.id}><span>{e.action}</span><time>{new Date(e.created_at).toLocaleString("en-GB",{timeZone:"Europe/London"})}</time></li>)}</ul></section></>;
}
