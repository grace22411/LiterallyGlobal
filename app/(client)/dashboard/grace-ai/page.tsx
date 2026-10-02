import { redirect,notFound } from "next/navigation";
import { z } from "zod";
import { authClient,verifiedUser } from "@/lib/supabase/server";
import { GraceChat } from "@/components/grace-ai/chat";
import { graceConfigured } from "@/lib/grace-ai/respond";
import {GRACE_AI_AVAILABLE} from "@/lib/grace-ai/availability";
import {GraceComingSoon} from "@/components/grace-ai/coming-soon";
export const metadata={title:"Grace AI · Coming soon"};
export default async function ChatPage({searchParams}:{searchParams:Promise<{conversation?:string;assessment?:string;page?:string}>}){
 if(!GRACE_AI_AVAILABLE)return <GraceComingSoon/>;
 const user=await verifiedUser();if(!user)redirect("/login?next=%2Fdashboard%2Fgrace-ai");const p=await searchParams;if(p.conversation&&!z.uuid().safeParse(p.conversation).success)notFound();const page=Math.max(1,Math.min(10000,parseInt(p.page??"1")||1));const db=await authClient();
 const [assessments,history,selected]=await Promise.all([db.from("assessments").select("id,route,created_at").eq("user_id",user.id).order("created_at",{ascending:false}).limit(100),db.from("grace_conversations").select("id,route,created_at",{count:"exact"}).eq("user_id",user.id).order("created_at",{ascending:false}).range((page-1)*20,page*20-1),p.conversation?db.from("grace_conversations").select("id,route,assessment_id,turns,report,version,created_at,updated_at").eq("user_id",user.id).eq("id",p.conversation).maybeSingle():Promise.resolve({data:null,error:null})]);
 if(selected.error)throw new Error("Unable to load your conversation.");if(p.conversation&&!selected.data)notFound();
 return <GraceChat key={selected.data?.id??"new"} initial={selected.data} assessments={assessments.data??[]} preferredAssessment={p.assessment} history={history.data??[]} historyPage={page} hasMore={page*20<(history.count??0)} historyError={Boolean(history.error)} available={graceConfigured()&&!history.error&&!assessments.error}/>;
}
