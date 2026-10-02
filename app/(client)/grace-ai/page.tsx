import { redirect } from "next/navigation";
import { z } from "zod";
export default async function LegacyChat({searchParams}:{searchParams:Promise<{conversation?:string}>}){const p=await searchParams;redirect(`/dashboard/grace-ai${p.conversation&&z.uuid().safeParse(p.conversation).success?`?conversation=${p.conversation}`:""}`);}
