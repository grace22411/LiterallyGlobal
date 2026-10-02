import { redirect,notFound } from "next/navigation";
import { z } from "zod";
export default async function LegacyRequest({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{payment?:string}>}){const{id}=await params;if(!z.uuid().safeParse(id).success)notFound();const{payment}=await searchParams;redirect(`/dashboard/requests/${id}${payment&&["returned","cancelled"].includes(payment)?`?payment=${payment}`:""}`);}
