import type Stripe from "stripe";
import { stripeClient,confirmCheckout } from "@/lib/applications/payments";
import { adminClient } from "@/lib/supabase/server";
export async function POST(request:Request){
 const secret=process.env.STRIPE_WEBHOOK_SECRET,signature=request.headers.get("stripe-signature");if(!secret||!signature)return new Response("Webhook unavailable",{status:400});
 if(Number(request.headers.get("content-length")??0)>262144)return new Response("Too large",{status:413});
 const reader=request.body?.getReader();if(!reader)return new Response("Invalid payload",{status:400});const chunks:Uint8Array[]=[];let size=0;
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>262144){await reader.cancel();return new Response("Too large",{status:413});}chunks.push(value);}
 let event:Stripe.Event;try{event=stripeClient().webhooks.constructEvent(Buffer.concat(chunks),signature,secret);}catch{return new Response("Invalid signature",{status:400});}
 try{
  if(event.type==="checkout.session.completed"||event.type==="checkout.session.async_payment_succeeded")await confirmCheckout(event.data.object as Stripe.Checkout.Session);
  if(event.type==="charge.refunded"){const charge=event.data.object as Stripe.Charge;const intent=typeof charge.payment_intent==="string"?charge.payment_intent:charge.payment_intent?.id;if(intent){const {error}=await adminClient().from("application_payments").update({status:"refunded"}).eq("provider_payment_id",intent);if(error)throw new Error("Refund status unavailable");}}
  return Response.json({received:true});
 }catch{console.error("Payment event needs retry",{eventId:event.id});return new Response("Retry required",{status:500});}
}
