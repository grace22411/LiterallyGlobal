import { UiIcon } from "@/components/ui-icon";
import type {ReactNode} from "react";
import Link from "next/link";
import {redirect} from "next/navigation";
import {verifiedUser} from "@/lib/supabase/server";
import {isAdminEmail} from "@/lib/applications/access";
import {Brand} from "@/components/brand";
import {AdminNav} from "@/components/admin/admin-nav";
import {SignOutButton} from "@/components/dashboard/account-actions";
export const dynamic="force-dynamic";
export const metadata={robots:{index:false,follow:false}};
export default async function AdminLayout({children}:{children:ReactNode}){const user=await verifiedUser();if(!user)redirect("/login?next=%2Fadmin");if(!isAdminEmail(user.email))return <main className="container app-page"><p className="eyebrow">TEAM ACCESS</p><h1>Use your administrator account.</h1><p>{user.email} does not have admin access. Sign out and sign in with your authorised team email.</p><SignOutButton/><Link href="/dashboard">Back to dashboard</Link></main>;return <div className="admin-workspace"><header className="dashboard-header"><div className="container"><Brand/><div className="account-menu"><span className="admin-role">ADMIN</span><Link href="/dashboard/account">My profile</Link><Link href="/dashboard">Client dashboard <UiIcon name="arrow-up-right" /></Link></div></div></header><div className="admin-nav-wrap"><div className="container"><AdminNav/></div></div><main className="container admin-main">{children}</main></div>;}
