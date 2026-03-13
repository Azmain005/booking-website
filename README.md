# Serene Wellness Booking Platform

Serene Wellness is a Next.js booking website for service-based businesses. Customers can browse services, book a time, pay via Stripe Checkout, and receive an email confirmation. Admins can log in to manage services and bookings.

## Highlights

Customer flow

- Browse services and view pricing/duration
- Book an appointment and pay via Stripe Checkout
- Confirmation page and email receipt/confirmation

Admin

- Cookie-based admin authentication (HTTP-only signed cookie)
- Dashboard analytics
- Manage services (create/edit)
- Manage bookings (search/filter/status updates)

Reliability

- Stripe webhook signature verification
- Idempotent booking confirmation and email sending
- Fallback reconciliation on the success page and in the admin list (helps in dev or when webhooks are delayed)

UI

- Tailwind CSS v4 + shadcn/ui primitives
- Dark mode toggle

## Tech stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- Prisma Client (generated into `src/generated/prisma`)
- Turso/libsql runtime access via Prisma driver adapter
- Stripe for payments
- Resend for transactional email

## Key paths

- `src/app` - App Router pages and API routes
- `src/app/api/checkout/route.ts` - creates Stripe Checkout session + PENDING booking
- `src/app/api/webhooks/stripe/route.ts` - confirms booking from Stripe webhook
- `src/app/success/page.tsx` - success page with fallback reconciliation
- `src/app/api/admin` - admin API routes
- `src/lib/prisma.ts` - runtime Prisma client via libsql adapter
- `prisma.config.ts` - Prisma engine datasource configuration (uses `PRISMA_DATABASE_URL`)

## Images

Remote images are currently allowed only from `images.unsplash.com`. If you store service images on a different host, update `remotePatterns` in `next.config.ts`.

## Project notes (important)

This repo intentionally uses two database URLs:

- `DATABASE_URL` and `DATABASE_AUTH_TOKEN` are used at runtime via the libsql adapter (Turso or local file).
- `PRISMA_DATABASE_URL` is used only by Prisma CLI/engine (`prisma generate`, `prisma db push`, `prisma studio`). Prisma's SQLite connector expects a `file:` URL and does not connect to `libsql://`.

If you are using Turso in production, schema provisioning is done with `npm run db:init` (not `prisma db push`).

## Getting started (local)

### Prerequisites

- Node.js 18+
- A Stripe account (test mode is fine)
- A Resend account (for email)

### 1) Install dependencies

```bash
npm install
```

`prisma generate` runs automatically on install via `postinstall`.

### 2) Create `.env`

For local development with a SQLite file:

```env
# Runtime DB (used by the app via the libsql adapter)
DATABASE_URL="file:./prisma/dev.db"

# Prisma engine DB (used by Prisma CLI)
PRISMA_DATABASE_URL="file:./prisma/dev.db"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Resend
RESEND_API_KEY="re_..."
EMAIL_FROM="Serene Wellness <onboarding@resend.dev>"

# Admin auth
ADMIN_PASSWORD="change-me"
ADMIN_SECRET="change-me-to-a-long-random-string"

# App URL (used to build Stripe success/cancel URLs)
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Optional legacy alias (supported)
# NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3) Create tables

For local file DBs you can use Prisma CLI:

```bash
npm run db:push
```

### 4) Seed sample services (optional)

```bash
npm run db:seed
```

### 5) Start the dev server

```bash
npm run dev
```

Open `http://localhost:3000`.

## Stripe webhooks (development)

The booking becomes confirmed only after Stripe sends `checkout.session.completed` and the webhook verifies the signature.

For local testing you typically need Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the printed `whsec_...` into `STRIPE_WEBHOOK_SECRET` and restart `npm run dev`.

For a detailed step-by-step guide, see `WEBHOOK_TESTING.md`.

## Email (Resend)

In Resend test/sandbox mode, sending may be restricted (for example, only to your account email) until you verify a domain and configure a verified sender. If emails appear to work only for one recipient, check Resend logs and domain verification status.

## Admin

- Login: `/admin/login`
- Dashboard: `/admin`

The admin session is an HTTP-only cookie signed with `ADMIN_SECRET`. Logging in requires the exact `ADMIN_PASSWORD`.

## Useful scripts

- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run start` - start production server
- `npm run lint` - run ESLint
- `npm run db:push` - apply schema to the local Prisma engine DB (uses `PRISMA_DATABASE_URL`)
- `npm run db:init` - provision tables/indexes on a libsql/Turso DB (uses `DATABASE_URL` + optional `DATABASE_AUTH_TOKEN`)
- `npm run db:seed` - seed sample services (uses `DATABASE_URL`)
- `npm run db:studio` - open Prisma Studio (uses `PRISMA_DATABASE_URL`)

## Deployment (Vercel + Turso + Stripe + Resend)

### Environment variables

Required (runtime)

- `DATABASE_URL` - Turso/libsql URL (`libsql://...`) or `file:...` locally
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `ADMIN_PASSWORD`
- `ADMIN_SECRET`

Recommended (runtime)

- `DATABASE_AUTH_TOKEN` - usually required for Turso
- `EMAIL_FROM` - verified sender
- `NEXT_PUBLIC_BASE_URL` - your public site URL

Prisma CLI only

- `PRISMA_DATABASE_URL` - must be a `file:` URL for Prisma engine commands

### Database provisioning

- Local file DB: `npm run db:push`
- Turso/libsql: `npm run db:init`

### Stripe webhook (production)

1. Stripe Dashboard -> Developers -> Webhooks -> Add endpoint
2. Endpoint URL: `https://your-domain.com/api/webhooks/stripe`
3. Event: `checkout.session.completed`
4. Copy `whsec_...` into `STRIPE_WEBHOOK_SECRET`

### Post-deploy checks

- Visit `/api/health` to confirm environment variables and DB connectivity
- Complete a test payment in Stripe test mode
- Confirm the booking moves from `PENDING` to `CONFIRMED` and email is delivered

## Troubleshooting

- Stripe CLI not found when running `stripe listen`: install Stripe CLI (see `WEBHOOK_TESTING.md`).
- Bookings stuck as unpaid in dev: confirm webhooks are being forwarded, and check `/api/health`.
- Emails not delivered to arbitrary recipients: verify Resend sender domain and check Resend logs.

## API reference (selected)

Public

- `POST /api/checkout` - create Stripe Checkout session and create a `PENDING` booking
- `POST /api/webhooks/stripe` - Stripe webhook handler
- `GET /api/health` - environment + DB connectivity check

Admin (requires admin session cookie)

- `POST /api/admin/auth` - login (sets cookie)
- `DELETE /api/admin/auth` - logout (clears cookie)
- `GET /api/admin/bookings` - list bookings (includes best-effort reconciliation)
- `PATCH /api/admin/bookings/:id` - update booking status
- `GET /api/admin/services` - list services
- `POST /api/admin/services` - create service
- `PATCH /api/admin/services/:id` - update service

Legacy/optional

- `POST /api/bookings` - creates a `PENDING` booking without creating a Stripe session (not used by the main UI flow)

## License

No license file is included in this repository.
