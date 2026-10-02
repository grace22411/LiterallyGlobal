# Service applications, payments and Grace AI

The code includes the two service forms, private documents, client requests, PDF reports, Stripe checkout, Grace AI and the admin queue. New database tables and provider settings must be activated before these features accept real customers. Existing authentication and eligibility assessments continue to use their original setup.

## 1. Apply the database migration

In your existing Supabase project, open **SQL Editor** and run the contents of `supabase/migrations/202610020001_services.sql` once, after the existing eligibility migration. It adds tables and service-only database functions; it does not delete existing records. The file includes a transaction so a failure rolls back all changes.

The migration also creates the private `application-documents` bucket. Do not make this bucket public or add browser upload policies. Uploads and short-lived download URLs are issued by authenticated server routes. The client can only read their own applications, files, payments and discussions. Internal admin notes and activity are not exposed to client database roles.

## 2. Admin access

Set `ADMIN_EMAILS` in `.env.local` to the exact verified account email(s) you authorise, separated by commas. No address is enabled in the example configuration. The local project has been configured for the owner-authorised `graceolayinka22@gmail.com`; production needs its own `ADMIN_EMAILS` setting. Sign in using that email, then open `/admin` or use **Team admin** in the dashboard sidebar. `/admin/setup` shows configuration status and provides the migration download. Restart the development server after changing environment variables.

The admin overview shows registered account, submitted request, saved assessment and Grace AI conversation counts. The profile menu and account page also show an **Admin** button for the authorised account. Each admin page checks the verified email on the server; hiding the button is not the access control.

Use **Users** to open a client's requests, checks and conversations together. **Eligibility checks** includes saved scores, recommendations and submitted answers, with route filters. **Grace AI usage** includes route filters, client message and reply counts, transcripts and downloadable reports. These are actual saved exchanges, not unsent drafts or failed provider calls. Anonymous unfinished checkers are not stored or counted. Historical results keep their original rule version and score.

Use **Requests** to review an application, open its private documents and linked reports, check confirmed payments, update its status and publish Grace’s personal verdict. The verdict appears on the client's request page and can be downloaded as PDF. Internal notes remain team-only. Saving a review does not automatically send an email or WhatsApp message.

## 3. Stripe

Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` on the server. Begin with Stripe **test mode**. Create a webhook endpoint for `APP_URL/api/payments/webhook` and subscribe to:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `charge.refunded`

For localhost, forward events with the Stripe CLI to `http://localhost:3000/api/payments/webhook`, and use the CLI's signing secret locally. Enable card payments in the Stripe account. The installed Stripe SDK uses `allowed_payment_method_types: ["card"]`; see [Checkout creation](https://docs.stripe.com/api/checkout/sessions/create).

Document review costs £1,000: either one £1,000 checkout or two separate £500 checkouts. The second checkout appears after the first payment is confirmed. There is no subscription, automatic later charge or invented due date. Agree delivery and second-payment timing with the client. Full support collects an application only; Ultimate directs customers to contact the team.

The database chooses the amount and installment; it cannot be changed by the client. Signed webhook events reconcile the Stripe amount, currency, order and checkout attempt. Redirecting to a success URL never marks a payment as paid. Repeated events and repeated checkout requests are idempotent. Refunds stop further checkout pending team review; refunds themselves are managed in Stripe. If a provider request may have succeeded but could not be saved for more than 23 hours, inspect Stripe before retrying—the app blocks an ambiguous new charge.

Before accepting real payments, test success, cancellation, duplicate webhook delivery, two installments and refunds in Stripe test mode. Then use live keys and the corresponding live webhook secret in the production environment. This repository has not made a real charge.

## 4. Grace AI

Grace AI is currently **Coming soon**. `GRACE_AI_AVAILABLE` in `lib/grace-ai/availability.ts` is false. The dashboard shows a coming-soon page and the message endpoint rejects new requests before database writes or provider calls. Existing reports remain downloadable. Credentials and imported knowledge are preserved; the eligibility checker continues using the shared guidance.

Set `OPENAI_API_KEY` and `OPENAI_MODEL` server-side. Choose a model enabled for your OpenAI project that supports the Responses API and strict JSON-schema outputs. Use its API identifier, not its display name: the local setting was corrected from `GPT-6.1 Sol` to `gpt-6.1-sol` and a synthetic structured response succeeded on 2 October 2026. See [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs). Set project usage limits in the provider dashboard.

The assistant uses the application's versioned route questions, optional saved assessment and conversation history. It cannot browse current guidance or inspect uploaded documents. It is labelled AI throughout, never presented as Grace herself. It does not invent a score; the structured eligibility checker remains the source of the readiness percentage. Each discussion is limited to 20 messages, with per-account request limits. Messages and reports are saved to the user's account and can be downloaded or attached to full support. `store: false` is sent to OpenAI; this is not a promise of zero provider retention.

Without credentials the assistant is visibly unavailable and directs users to the checker or consultation. It never generates a pretend response.

The checker and Grace AI share the owner's imported GTV Assistant review method, technology and research guidance, and anonymised case lessons in `lib/knowledge/gtv.ts`. All 14 references were reviewed. The original client documents stay outside the application and are not uploaded to OpenAI. This is a reviewed snapshot, not automatic synchronisation with ChatGPT. Admin setup shows the imported version separately from provider credential status. Design uses official requirements with the general review method. See `docs/ELIGIBILITY-KNOWLEDGE.md` for source handling and the nine-question technology flow.

## 5. Production

Use a Next.js server deployment, not a static export. Configure all server environment variables there, use the exact HTTPS `APP_URL`, and complete authentication redirect/SMTP settings from the existing setup guide. Deploying only the old `out/` folder will not run these APIs. Private document downloads need access to Supabase Storage; PDFs use the bundled Poppins font files. Test in a staging account before inviting clients.

## Client workspace

All client work is under `/dashboard`, with persistent desktop navigation and a mobile menu. The overview summarises actual saved records; `/dashboard/requests` includes all submitted requests and drafts, with filters and pagination. Request details keep payment, documents and verdicts together. `/dashboard/reports` lists eligibility results, AI reports and personal verdicts. Services and their forms live at `/dashboard/services`. Grace AI is a chat workspace with history, suggested starters, Enter-to-send, a persistent composer and an expandable action plan. Legacy request and chat URLs redirect into this workspace.

Service form text is preserved in session storage for 24 hours while the client visits the checker or chat. Draft fields clear after a request is saved or on sign-out. Files must be reselected after navigation. Saved draft requests can be reopened in My requests. Sign-in redirects accept only known account paths and supported ID parameters.

## Free resource requests

The homepage resource links lead to `/resources`, where each technology resource has a name, email, international phone and location form. A successful database write unlocks only that resource. PDFs are served from `content/resources/` through a signed access endpoint; they are not public static downloads. The supplied planning workbook opens as a Google Docs link through the same recorded-access flow. The WhatsApp community is open to all routes and bypasses the form.

Apply `supabase/migrations/202610020002_resources.sql` once after the eligibility migration, which provides the shared request limiter. `/admin/setup` has a separate resource connection status and migration download. This migration creates only the private resource-request table and indexes, with no client-role access. It does not modify existing records. Configure the existing Supabase server credentials and `APP_URL` as usual. The local migration and tests do not apply this SQL to a hosted database.

Authorised admins can open **Resource requests** (`/admin/resources`) to view contact details, resource choice, submission date and first link-open date, filtered by resource or activity. Each resource submission is a separate record; retries of the same form submission reuse its ID. A saved request does not subscribe a visitor to marketing or send an email. Link-open tracking records PDF delivery or a workbook redirect, not confirmation that a browser saved the file. Access links expire after 24 hours; visitors can complete the form again for a new link. Next.js file tracing includes both PDFs and the admin migration download in server builds.
