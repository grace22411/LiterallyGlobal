# Account and email setup

The application code is implemented locally. No Supabase project, sender domain, production environment or scheduler has been provisioned by this change, and no live verification code or result email has been sent. Keep credentials in `.env.local` or the host's secret settings, never in source control or chat.

## 1. Supabase database

Create a Supabase project, then run `supabase/migrations/202610010001_eligibility.sql` once in its SQL editor (or use your normal Supabase migration workflow). It creates assessments, the durable result-email queue, rate-limit records and service-role-only functions. Row-level security restricts each authenticated user to their own assessments and safe delivery-status fields. Clients cannot insert or change computed results.

Copy the project URL, publishable key and service-role key into the corresponding names in `.env.example`. The service-role key belongs only in the server environment. The application uses it for atomic assessment saving, the queue and rate limits; the browser never receives it.

## 2. Verified-email signup and login

Enable the Supabase Email auth provider and allow new signups. Set the Site URL to your exact application origin. Under **Authentication → Emails**, update both **Confirm signup** (new/unconfirmed accounts) and **Magic Link** (returning accounts). Use `supabase/templates/confirm-signup.html` for Confirm signup and `supabase/templates/magic-link.html` for Magic Link, with the subject `Your LiterallyGlobal verification code`. Both templates must display `{{ .Token }}` instead of a confirmation link. Updating only Magic Link leaves new users receiving the default confirmation-link email. These local template files do not automatically synchronise with the hosted Supabase dashboard; save both there, then request a new code from the app.

The app accepts Supabase’s configurable 6–10 digit email codes, including eight-digit codes. Keep your chosen length and use a ten-minute expiry. See [Supabase OTP length configuration](https://supabase.com/docs/guides/local-development/cli/config#auth.email.otp_length). The UI supports resending after 60 seconds; server-side email and verification limits also apply. Users do not see or save a result until Supabase confirms their email.

For public signup, configure custom SMTP. Supabase's default mail service is not a production delivery solution. Resend can supply both SMTP for account codes and the HTTP API for assessment reports:

- Verify a sending domain in Resend and complete its required DNS records.
- Set Supabase custom SMTP host `smtp.resend.com`, port `465`, username `resend`, and password to a suitable Resend API key.
- Use a sender address on that verified domain and the sender name `LiterallyGlobal`.

See [Supabase email OTP documentation](https://supabase.com/docs/guides/auth/auth-email-passwordless) and [Resend's Supabase SMTP setup](https://resend.com/docs/send-with-supabase-smtp).

## 3. Result emails and environment

Configure all values in `.env.example` on the server:

| Variable | Value |
| --- | --- |
| `APP_URL` | Exact visitor-facing origin; `http://localhost:3000` locally, HTTPS in production. Used for same-origin request checks and private report links. |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Project publishable key. |
| `SUPABASE_SERVICE_ROLE_KEY` | Private service-role key. Never use a `NEXT_PUBLIC_` prefix. |
| `RESEND_API_KEY` | API key authorised to send email from the verified domain. |
| `EMAIL_FROM` | For example, `LiterallyGlobal <hello@your-verified-domain.com>`. |
| `CRON_SECRET` | Independent random secret, at least 32 characters, shared only with the scheduler. |

Restart the development server after environment changes. Set the public Supabase variables before the production build as well as at runtime.

Saving an assessment atomically saves its report and queues its email. The request immediately attempts delivery. Reports include the same score, criterion checks and recommendations as the private dashboard. Recipients come from the verified account, never a submitted recipient field. A missing email configuration leaves the report queued; it does not claim success. Provider acceptance is not proof of inbox delivery.

## 4. Retry scheduler

Configure a trusted scheduler to send an HTTPS **POST** every five minutes to:

```text
https://YOUR_APP_ORIGIN/api/internal/email-jobs
Authorization: Bearer YOUR_CRON_SECRET
```

The endpoint processes up to five due jobs per invocation. Use a scheduler that supports POST and a secret authorization header; a GET-only cron call will not work. Increase cadence or batch capacity if volume requires it. Monitor exhausted jobs rather than treating a successful scheduler HTTP response as proof every message was delivered.

Each email job has an exclusive lease, exponential backoff and at most five attempts. Resend requests reuse a stable idempotency key. Automatic retries stop 23 hours after the first attempt because [Resend retains these keys for 24 hours](https://resend.com/docs/dashboard/emails/idempotency-keys). For an exhausted or expired job, inspect the provider logs before considering any manual resend; do not blindly reset the queue and risk duplicate mail.

## 5. Deployment and connected acceptance checks

Run `npm test` and `npm run build`, then deploy on a Next.js-compatible server host and set the variables above. The old static Sites preview does not include these account features and must not be used as the app deployment.

With a test inbox you control, verify:

1. Complete each route's questionnaire; results stay hidden before email verification.
2. Sign up, receive the verification code, verify it, and confirm the completed answers survive signup and produce a private saved report.
3. Confirm the result email arrives and matches the dashboard's score and recommendations. Its report link must require login when opened without a session.
4. Log out and back in. Check the saved result and service prices. In a second account, verify the first account's report URL is inaccessible.
5. Simulate a provider failure in a non-production project. Confirm the result remains saved, the email is marked pending/failed, and the scheduler recovers delivery without duplicate mail.
6. Check mobile layout, keyboard navigation, validation messages and the privacy notice in a browser.

Automated tests use an isolated PostgreSQL-compatible PGlite database; they do not prove that a real Supabase project, SMTP sender or scheduler is configured. Browser visual testing and live delivery have not been completed in this environment.

## Maintenance

Review [eligibility-rules.md](eligibility-rules.md) whenever official guidance changes. Update questions, evaluator tests and the rules version together. Existing reports retain their original rules version; retaking the checker produces a new assessment.

Account deletion through Supabase Auth cascades to assessments and queued email jobs. Coordinate provider-log retention and identity verification when handling deletion requests; deleting an account cannot recall messages already delivered. Booking links and business contact details remain configurable in `lib/site.ts`.
