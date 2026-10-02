import Link from "next/link";
import { PaymentReturn } from "@/components/dashboard/payment-return";
import { redirect,notFound } from "next/navigation";
import { z } from "zod";
import { verifiedUser,adminClient } from "@/lib/supabase/server";
import { ApplicationDetail } from "@/components/applications/application-detail";
export const dynamic="force-dynamic";export const metadata={title:"Your request",robots:{index:false,follow:false}};
export default async function ApplicationPage({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{payment?:string}>}){
 const {id}=await params;if(!z.uuid().safeParse(id).success)notFound();const user=await verifiedUser();if(!user)redirect(`/login?next=${encodeURIComponent(`/dashboard/requests/${id}`)}`);const db=adminClient();const a=await db.from("service_applications").select("*").eq("id",id).eq("user_id",user.id).maybeSingle();if(a.error)throw new Error("Your request could not be loaded.");if(!a.data)notFound();
 const [files,payments]=await Promise.all([db.from("application_files").select("*").eq("application_id",id),db.from("application_payments").select("id,installment,amount,status,paid_at").eq("application_id",id)]);if(files.error||payments.error)throw new Error("Your request details could not be loaded.");const query=await searchParams;
 return <><Link className="workspace-back" href="/dashboard/requests">← All requests</Link>{query.payment==="returned"&&<PaymentReturn paid={(payments.data??[]).filter(p=>p.status==="paid").reduce((n,p)=>n+p.amount,0)} pending={(payments.data??[]).some(p=>p.status==="pending")}/>}{query.payment==="cancelled"&&<p className="status-notice">Checkout was closed. Your request is saved and you can pay when ready.</p>}<ApplicationDetail application={a.data} files={files.data??[]} payments={payments.data??[]}/></>;
}
