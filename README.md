# LiterallyGlobal

Next.js App Router, React and TypeScript website and client account for UK Global Talent endorsement support.

Includes a route-specific eligibility questionnaire, verified-email signup, private assessment results, service recommendations and queued result emails. The client dashboard includes persistent navigation, a requests tracker, service intake and payments, a report library, and the Grace AI chat workspace. Checks cover digital technology, the DBA design pathway, and four academia/research pathways. Scores describe self-reported evidence readiness, not the probability of endorsement.

## Run locally

Requires Node.js 22.13 or later.

```sh
npm install
# First setup only: preserve an existing .env.local
cp -n .env.example .env.local
npm run dev
```

The marketing pages and questionnaire work without provider credentials. Signup, saved results and email delivery need [the setup guide](docs/setup.md). There is no mock authentication or pretend email delivery. Service forms, private uploads, Stripe checkout, Grace AI and the team admin require the additional [services setup](docs/SERVICES-SETUP.md).

## Verify and deploy

```sh
npm test
npm run build
npm start
```

Use a host with a Next.js server runtime. Authentication, private results, APIs and email retries cannot run from a static HTML export. The Sites project identity remains in `.openai/hosting.json`; local changes do not update the previously published preview.

Tests cover route rules, unauthenticated access, payload validation, PostgreSQL ownership, private admin notes, result idempotency, email-job leases, payment installments, signed webhooks, AI output validation and PDF pagination. Live delivery requires connected acceptance checks in the setup guide.

## Main files

- `lib/services.ts`: package copy and prices (£1,000 document review, £2,500 full support, £4,950 ultimate).
- `lib/eligibility/questions.ts`: conditional questionnaires and official sources.
- `lib/eligibility/evaluate.ts`: server-only scoring and recommendations.
- `app/(marketing)/eligibility/`: checker; `app/(account)/`: signup/login; `app/(client)/dashboard/`: results and services.
- `app/api/`: authentication, assessment saving, email retries and scheduler endpoint.
- `supabase/migrations/`: database schema, row-level security and atomic queue operations.
- `supabase/templates/`: email verification template.
- [Eligibility research](docs/eligibility-rules.md): rules, score interpretation and review limits.

Booking and resource destinations are configured in `lib/site.ts`. Consultation and the Digital Tech guide link to the supplied Nestuge pages. Document review and full support use account-linked intake forms; Ultimate opens an email enquiry. Document-review payments use Stripe after provider configuration; uploads use private Supabase storage. `/admin` requires an explicitly allowlisted, verified email. Grace AI and all three PDF report types are linked from the client dashboard. See [services setup](docs/SERVICES-SETUP.md) before accepting customers.
