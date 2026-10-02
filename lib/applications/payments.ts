import "server-only";
import Stripe from "stripe";
import { z } from "zod";
import { adminClient } from "@/lib/supabase/server";
import { HttpError,appOrigin } from "@/lib/server/http";
import type { Application } from "./types";
export function paymentsConfigured(){return Boolean(process.env.STRIPE_SECRET_KEY&&process.env.STRIPE_WEBHOOK_SECRET);}
export function stripeClient(){if(!process.env.STRIPE_SECRET_KEY)throw new HttpError(503,"Payments are not available yet. Your request is saved; please contact us to arrange payment.");return new Stripe(process.env.STRIPE_SECRET_KEY,{maxNetworkRetries:1,timeout:15000});}
export async function confirmCheckout(session:Stripe.Checkout.Session){
 if(session.mode!=="payment"||session.payment_status!=="paid")return false;
 const id=session.metadata?.payment_id,attempt=session.metadata?.attempt_id;
 if(!id||!attempt)return false;
 if(!z.uuid().safeParse(id).success||!z.uuid().safeParse(attempt).success)throw new Error("Invalid payment reference");
 const payment=typeof session.payment_intent==="string"?session.payment_intent:session.payment_intent?.id;
 if(!payment||!session.amount_total||session.currency!=="gbp")throw new Error("Invalid payment details");
 const {data,error}=await adminClient().rpc("confirm_review_payment",{p_id:id,p_attempt:attempt,p_checkout:session.id,p_amount:session.amount_total,p_currency:session.currency,p_payment:payment});if(error)throw new Error("Payment confirmation could not be stored");return Boolean(data);
}
export async function checkoutFor(application:Application,renewed=false):Promise<{url?:string;paid?:boolean}>{
 if(!paymentsConfigured())throw new HttpError(503,"Payments are not available yet. Your request is saved; please contact us to arrange payment.");
 const stripe=stripeClient(),db=adminClient();const reserved=await db.rpc("reserve_review_payment",{p_application:application.id,p_user:application.user_id});
 if(reserved.error)throw new HttpError(409,"Checkout is being prepared, or this payment needs our help. Please wait a moment and retry; contact us if it continues.");
 const order=reserved.data?.[0];if(!order)return {paid:true};
 if(order.checkout_id){const existing=await stripe.checkout.sessions.retrieve(order.checkout_id);
  if(existing.payment_status==="paid"){await confirmCheckout(existing);return {paid:true};}
  if(existing.status==="open"&&existing.url)return {url:existing.url};
  if(existing.status!=="expired"||renewed)throw new HttpError(409,"Your payment is being processed. Refresh your request shortly.");
  const reset=await db.from("application_payments").update({attempt_id:crypto.randomUUID(),checkout_id:null,checkout_url:null,checkout_expires_at:null,lease_until:null,created_at:new Date().toISOString()}).eq("id",order.id).eq("checkout_id",existing.id).eq("status","pending").select("id");
  if(reset.error||!reset.data?.length)throw new HttpError(409,"Your payment status changed. Refresh and try again.");return checkoutFor(application,true);
 }
 // Do not reuse an expired Stripe idempotency key after an ambiguous failure.
 if(Date.now()-Date.parse(order.created_at)>23*3600*1000)throw new HttpError(409,"Please contact us to check this payment attempt before trying again.");
 const session=await stripe.checkout.sessions.create({mode:"payment",adaptive_pricing:{enabled:false},allowed_payment_method_types:["card"],client_reference_id:application.id,customer_email:application.email,
  line_items:[{quantity:1,price_data:{currency:"gbp",unit_amount:order.amount,product_data:{name:application.payment_plan==="once"?"LiterallyGlobal document review":"LiterallyGlobal document review — instalment "+order.installment+" of 2",description:application.payment_plan==="once"?"Document review package — £1,000 total":"Two separate payments of £500 — £1,000 total. No recurring subscription."}}}],
  metadata:{payment_id:order.id,attempt_id:order.attempt_id},payment_intent_data:{metadata:{payment_id:order.id,application_id:application.id}},
  success_url:`${appOrigin()}/dashboard/requests/${application.id}?payment=returned`,cancel_url:`${appOrigin()}/dashboard/requests/${application.id}?payment=cancelled`,
 },{idempotencyKey:`review-${order.id}-${order.attempt_id}`});
 if(!session.url)throw new HttpError(503,"Unable to open checkout. Your request is saved.");
 const saved=await db.from("application_payments").update({checkout_id:session.id,checkout_url:session.url,checkout_expires_at:new Date(session.expires_at*1000).toISOString(),lease_until:null}).eq("id",order.id).eq("attempt_id",order.attempt_id);
 if(saved.error)throw new HttpError(503,"Checkout could not be saved. Please retry in a minute.");return {url:session.url};
}
