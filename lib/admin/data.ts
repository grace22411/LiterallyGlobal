import "server-only";
import {adminClient} from "@/lib/supabase/server";
export const pageNumber=(v?:string)=>Math.max(1,Math.min(10000,parseInt(v??"1")||1));
export const dateLabel=(v?:string|null)=>v?new Date(v).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric",timeZone:"Europe/London"}):"—";
export async function userLabels(ids:string[]){const db=adminClient();const unique=[...new Set(ids)];const entries=await Promise.all(unique.map(async id=>{try{const{data,error}=await db.auth.admin.getUserById(id);if(error||!data.user)return [id,{name:"Unavailable user",email:""}] as const;const u=data.user;return [id,{name:typeof u.user_metadata?.full_name==="string"?u.user_metadata.full_name:u.email??"Client",email:u.email??""}] as const;}catch{return [id,{name:"Unavailable user",email:""}] as const;}}));return Object.fromEntries(entries);}
