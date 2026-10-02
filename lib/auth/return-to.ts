const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Keep sign-in return destinations inside known account screens. */
export function safeReturnTo(value?:string|null){
 if(!value||!value.startsWith("/")||value.startsWith("//")||/[\\\r\n]/.test(value))return "/dashboard";
 try{
 const url=new URL(value,"https://account.invalid");if(url.origin!=="https://account.invalid")return "/dashboard";
 const p=url.pathname;
 const allowed=/^\/dashboard(?:\/(?:requests(?:\/[0-9a-f-]{36})?|services(?:\/(?:document-review|full-support))?|grace-ai|eligibility|reports|account))?$/.test(p)||/^\/services\/(document-review|full-support)$/.test(p)||/^\/applications\/[0-9a-f-]{36}$/.test(p)||["/grace-ai","/admin"].includes(p);
 if(!allowed)return "/dashboard";
 const query=new URLSearchParams();
 if(["/dashboard","/dashboard/reports","/dashboard/grace-ai","/dashboard/services/full-support"].includes(p)){
  const assessment=url.searchParams.get("assessment");if(assessment&&uuid.test(assessment))query.set("assessment",assessment);
 }
 if(["/grace-ai","/dashboard/grace-ai","/dashboard/services/full-support"].includes(p)){
  const conversation=url.searchParams.get("conversation");if(conversation&&uuid.test(conversation))query.set("conversation",conversation);
 }
 if(/^\/dashboard\/requests\//.test(p)){const payment=url.searchParams.get("payment");if(payment&&["returned","cancelled"].includes(payment))query.set("payment",payment);}
 return p+(query.size?`?${query}`:"");
 }catch{return "/dashboard";}
}
