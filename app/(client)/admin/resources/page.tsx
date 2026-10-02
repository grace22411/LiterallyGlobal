import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { adminClient, verifiedUser } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/applications/access";
import { freeResources, isResourceId } from "@/lib/resources/catalog";
import { dateLabel, pageNumber } from "@/lib/admin/data";

export const metadata = { title: "Resource requests", robots: { index: false, follow: false } };
export default async function ResourceRequestsPage({ searchParams }: { searchParams: Promise<{ resource?: string; status?: string; page?: string }> }) {
  const user = await verifiedUser();
  if (!user) redirect("/login?next=%2Fadmin%2Fresources");
  if (!isAdminEmail(user.email)) notFound();
  const params = await searchParams;
  const resource = params.resource && isResourceId(params.resource) ? params.resource : "all";
  const status = params.status === "accessed" || params.status === "requested" ? params.status : "all";
  const page = pageNumber(params.page);
  let query = adminClient().from("resource_requests").select("id,name,email,phone,location,resource,created_at,accessed_at", { count: "exact" });
  if (resource !== "all") query = query.eq("resource", resource);
  if (status === "accessed") query = query.not("accessed_at", "is", null);
  if (status === "requested") query = query.is("accessed_at", null);
  const result = await query.order("created_at", { ascending: false }).order("id").range((page - 1) * 25, page * 25 - 1);
  const pageHref = (number: number) => `/admin/resources?${new URLSearchParams({ resource, status, page: String(number) })}`;
  return <>
    <div className="request-heading"><div><p className="eyebrow">LITERALLYGLOBAL OPERATIONS</p><h1>Free resource requests.</h1><p>See who requested each resource and whether they opened its link.</p></div><span className="request-status">{result.error ? "Unavailable" : `${result.count ?? 0} matching requests`}</span></div>
    <form className="admin-filters">
      <label className="field-label">Resource<select name="resource" defaultValue={resource}><option value="all">All resources</option>{freeResources.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label className="field-label">Activity<select name="status" defaultValue={status}><option value="all">All requests</option><option value="requested">Requested, not yet opened</option><option value="accessed">Download / workbook link opened</option></select></label>
      <button className="button button-dark">Filter requests</button>
    </form>
    {result.error ? <p className="form-error">Resource records are unavailable. <Link href="/admin/setup">Open setup</Link> to check the connection.</p> : <section className="request-card">
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Name & email</th><th>Phone</th><th>Location</th><th>Resource</th><th>Requested</th><th>Link opened</th></tr></thead>
        <tbody>{result.data?.map((entry) => <tr key={entry.id}>
          <td><strong>{entry.name}</strong><span>{entry.email}</span></td><td>{entry.phone}</td><td>{entry.location}</td>
          <td>{freeResources.find((item) => item.id === entry.resource)?.name ?? entry.resource}</td>
          <td>{dateLabel(entry.created_at)}</td><td>{entry.accessed_at ? dateLabel(entry.accessed_at) : "Not yet opened"}</td>
        </tr>)}</tbody></table></div>
      {!result.data?.length && <p>No resource requests match these filters.</p>}
      <p className="fine-print">Opening a PDF link records access; it cannot confirm that the visitor saved the file. WhatsApp community joins are not collected here.</p>
      <div className="report-actions">{page > 1 && <Link className="button button-outline" href={pageHref(page - 1)}>Previous</Link>}{page * 25 < (result.count ?? 0) && <Link className="button button-outline" href={pageHref(page + 1)}>Next</Link>}</div>
    </section>}
  </>;
}
