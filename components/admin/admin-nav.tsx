"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
const links=[["/admin","Overview"],["/admin/users","Users"],["/admin/requests","Requests"],["/admin/resources","Resource requests"],["/admin/assessments","Eligibility checks"],["/admin/grace-ai","Grace AI usage"],["/admin/setup","Setup"]];
export function AdminNav(){const path=usePathname();return <nav className="admin-navigation" aria-label="Admin navigation">{links.map(([href,label])=><Link key={href} href={href} aria-current={(href==="/admin"?path===href:path.startsWith(href)||(href==="/admin/requests"&&path.startsWith("/admin/applications")))?"page":undefined}>{label}</Link>)}</nav>;}
