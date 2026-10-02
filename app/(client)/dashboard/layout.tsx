import type { Metadata } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import { safeReturnTo } from "@/lib/auth/return-to";
import { redirect } from "next/navigation";
import { verifiedUser } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/applications/access";
import { WorkspaceShell } from "@/components/dashboard/workspace-shell";
export const metadata:Metadata={robots:{index:false,follow:false}};
export const dynamic="force-dynamic";
export default async function DashboardLayout({children}:{children:ReactNode}){const user=await verifiedUser();if(!user){const path=safeReturnTo((await headers()).get("x-workspace-path"));redirect(`/login?next=${encodeURIComponent(path)}`);}const raw=user.user_metadata?.full_name;const name=typeof raw==="string"&&raw.trim()?raw.trim().slice(0,80):"Your account";return <WorkspaceShell name={name} email={user.email??""} admin={isAdminEmail(user.email)}>{children}</WorkspaceShell>;}
