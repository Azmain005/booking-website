# 🌿 Serene Wellness - Premium Booking Platform

A modern, production-ready booking website for wellness services with integrated payments, email confirmations, and administrative management.

![Serene Wellness](https://img.shields.io/badge/Status-Production%20Ready-green?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-16+-black?style=flat-square&logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?style=flat-square&logo=typescript)
![Stripe](https://img.shields.io/badge/Stripe-Integrated-purple?style=flat-square&logo=stripe)

## ✨ Key Features

### 🎯 **Customer Experience**

- **Modern UI/UX** with animated gradients, professional styling, and responsive design
- **Service Discovery** with detailed pricing and duration information
- **Real-time Booking Form** with comprehensive validation and error handling
- **Secure Payment Processing** via Stripe Checkout with PCI compliance
- **Instant Email Confirmations** with professional HTML templates
- **Toast Notifications** for enhanced user feedback throughout the journey

### 👥 **Admin Management**

- **Secure Admin Panel** with cookie-based authentication and timing-safe password verification
- **Comprehensive Analytics Dashboard** with revenue tracking, booking metrics, and business insights
- **Advanced Booking Management** with search, filtering, and status updates
- **Real-time Search & Filter** across customer names, emails, services, and booking IDs
- **Professional Admin Experience** with toast notifications and intuitive UI

### 🛡️ **Security & Reliability**

- **Webhook Verification** with Stripe signature validation and idempotency handling
- **Payment Confirmation** only after verified webhook events (never from client-side)
- **HMAC SHA-256 Signed Cookies** for secure admin session management
- **SQL Injection Protection** via Prisma ORM with parameterized queries
- **Rate Limiting Ready** architecture for production deployment

### ⚡ **Performance & SEO**

- **Next.js App Router** with Server Components for optimal performance
- **Comprehensive SEO Metadata** with Open Graph, Twitter Cards, and structured data
- **Progressive Enhancement** with graceful JavaScript fallbacks
- **Optimized Database Queries** with proper indexing and relations

## 🏗️ Architecture & Tech Stack

### **Frontend**

- **[Next.js 15+](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling
- **[shadcn/ui](https://ui.shadcn.com/)** - Modern component library
- **[Sonner](https://sonner.emilkowal.ski/)** - Toast notifications

### **Backend & Database**

- **[Prisma](https://prisma.io/)** - Type-safe database ORM
- **[SQLite](https://sqlite.org/)** - Lightweight database (production-ready with turso/libsql)
- **[Stripe API](https://stripe.com/)** - Payment processing
- **[Resend](https://resend.com/)** - Transactional email delivery

### **Authentication & Security**

- **Cookie-based Sessions** with HMAC SHA-256 signing
- **Webhook Signature Verification** with raw body validation
- **Environment Variable Security** for sensitive configuration

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and npm/yarn/pnpm
- **Stripe Account** (free for testing)
- **Resend Account** (free tier available)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/serene-wellness.git
cd serene-wellness
npm install
```

### 2. Environment Configuration

Create `.env.local` with your configuration:

```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# Optional for Turso/libsql production
# DATABASE_AUTH_TOKEN="your_turso_auth_token"

# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# Email Configuration
RESEND_API_KEY="re_your_resend_api_key"
EMAIL_FROM="Serene Wellness <onboarding@resend.dev>"

# Admin Authentication
ADMIN_PASSWORD="your-admin-login-password"
ADMIN_SECRET="your-cookie-signing-secret"

# Application URLs
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Optional legacy alias (supported)
# NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Seed with sample services (optional)
npm run db:seed
```

### 4. Stripe Webhook Configuration

#### For Development:

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy the webhook secret to your .env.local file
```

#### For Production:

1. Create a webhook endpoint in your Stripe dashboard
2. Set URL to: `https://yourdomain.com/api/webhooks/stripe`
3. Listen for: `checkout.session.completed`
4. Copy the webhook secret to your environment variables

### 5. Launch Application

```bash
npm run dev
# Open http://localhost:3000
```

## 📋 Usage Guide

### For Customers

1. **Browse Services** - View available treatments with pricing and duration
2. **Book Treatment** - Fill out the booking form with preferred date/time
3. **Secure Payment** - Complete payment via Stripe Checkout
4. **Confirmation** - Receive instant email confirmation with booking details

### For Administrators

1. **Access Admin Panel** - Navigate to `/admin/login`
2. **Enter Credentials** - Use your `ADMIN_PASSWORD`
3. **View Dashboard** - Monitor analytics, revenue, and booking trends
4. **Manage Bookings** - Search, filter, and update booking statuses

## 🔧 Development

### Database Operations

```bash
# View database in Prisma Studio
npx prisma studio

# Reset database (caution: deletes all data)
npx prisma db push --force-reset

# Generate new migration
npx prisma migrate dev --name your_migration_name
```

### Testing Payments

Use Stripe's test card numbers:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Require 3D Secure**: `4000 0000 0000 3220`

### Email Testing

- Check Resend dashboard for delivery logs
- Use temporary email services for testing
- Preview email templates in development

## 🚀 Deployment

### Best deployment option (recommended)

**Vercel + Turso (libsql) + Stripe + Resend**

- Vercel is the smoothest production host for Next.js App Router.
- Turso fits this codebase because it already uses the Prisma libsql adapter.

### Production environment variables (checklist)

Required:

- `NEXT_PUBLIC_BASE_URL` — your production URL, e.g. `https://your-domain.com`
- `DATABASE_URL` — Turso URL (`libsql://...`) or another durable DB URL
- `STRIPE_SECRET_KEY` — `sk_live_...`
- `STRIPE_WEBHOOK_SECRET` — `whsec_...` from the **live** webhook endpoint
- `RESEND_API_KEY`
- `ADMIN_PASSWORD` — admin login password
- `ADMIN_SECRET` — strong random signing secret for the admin session cookie

Recommended:

- `DATABASE_AUTH_TOKEN` — required for most Turso databases
- `EMAIL_FROM` — verified sender, e.g. `Serene Wellness <booking@your-domain.com>`

Tip: keep a clean baseline by starting from `.env.example`.

### Database deployment recommendation

This project uses Prisma + the libsql adapter.

- Recommended: **Turso (libsql)** for production.
- Local dev: SQLite file via `DATABASE_URL="file:./prisma/dev.db"`.

Apply schema to production DB:

```bash
# Ensure DATABASE_URL (+ DATABASE_AUTH_TOKEN if needed) are set for production
npx prisma db push
```

If you later introduce migrations, you can switch to `prisma migrate deploy`.

### Stripe production setup notes

- Switch to **Live mode** in Stripe Dashboard.
- Use **live API keys** in Vercel env vars (`sk_live_...`).
- Ensure your redirect base URL matches `NEXT_PUBLIC_BASE_URL`.
- Verify your business details, payouts, and the payment methods you want to accept.

### Webhook production setup (Stripe)

1. Stripe Dashboard → Developers → Webhooks → **Add endpoint**
2. Endpoint URL: `https://your-domain.com/api/webhooks/stripe`
3. Events to send:
   - `checkout.session.completed`
4. Copy the signing secret (`whsec_...`) to `STRIPE_WEBHOOK_SECRET`

Notes:

- This route verifies the Stripe signature using the **raw request body**.
- Don’t place auth middleware in front of `/api/webhooks/stripe`.

### Email provider production notes (Resend)

- Verify a sending domain in Resend and set `EMAIL_FROM` to that domain.
- Configure SPF/DKIM as Resend instructs to improve deliverability.
- Test delivery to Gmail/Outlook and watch Resend logs for bounces/blocks.

### Common deployment pitfalls

- `NEXT_PUBLIC_BASE_URL` not set (Stripe success/cancel URLs break)
- Using `sk_test_...` in production (payments won’t match live webhooks)
- Missing `DATABASE_AUTH_TOKEN` for Turso (DB queries fail at runtime)
- Webhook secret copied from **test** endpoint instead of **live**
- Forgetting to run `npx prisma db push` against the production database
- Unverified `EMAIL_FROM` sender leading to poor deliverability or blocked emails

### Exact deployment steps (Vercel + Turso)

1. Create a Turso database
   - Create DB in Turso and get:
     - `DATABASE_URL` (libsql URL)
     - `DATABASE_AUTH_TOKEN`
2. Apply schema to the production DB
   - Locally set `DATABASE_URL` (+ `DATABASE_AUTH_TOKEN`) and run:
     - `npx prisma db push`
3. Create a Vercel project
   - Import the Git repo into Vercel
   - Framework preset: Next.js
4. Configure Vercel Environment Variables
   - Add all required vars from the checklist above
5. Deploy
   - Trigger a deploy from Vercel (or push to your main branch)
6. Create the Stripe live webhook endpoint
   - Add endpoint URL and event `checkout.session.completed`
   - Set `STRIPE_WEBHOOK_SECRET` in Vercel and redeploy if needed
7. Configure Resend domain + sender
   - Verify domain
   - Set `EMAIL_FROM`

### Post-deployment test checklist

- Homepage loads and services render
- Booking flow creates a PENDING booking and redirects to Stripe Checkout
- Live payment succeeds and webhook confirms booking (status becomes CONFIRMED)
- Confirmation email is delivered (check Resend logs)
- Cancel flow works (booking not confirmed)
- Admin login works and bookings list loads
- Admin status updates work (and don’t allow invalid transitions)

## 📊 Analytics & Monitoring

The admin dashboard provides comprehensive business insights:

- **Revenue Tracking** - Total and daily revenue analytics
- **Booking Metrics** - Confirmed, pending, and cancelled booking counts
- **Service Performance** - Most popular services and customer preferences
- **Daily Activity** - Today's booking sessions and customer engagement

## 🛠️ API Reference

### Public Endpoints

- `POST /api/checkout` - Create Stripe Checkout Session
- `POST /api/webhooks/stripe` - Handle Stripe webhook events

### Admin Endpoints (Protected)

- `POST /api/admin/auth` - Admin login/logout
- `PATCH /api/admin/bookings/[id]` - Update booking status

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[shadcn](https://github.com/shadcn)** for the beautiful UI component library
- **[Stripe](https://stripe.com/)** for robust payment infrastructure
- **[Prisma](https://prisma.io/)** for type-safe database operations
- **[Vercel](https://vercel.com/)** for seamless deployment platform

---

<div align="center">

**Built with ❤️ for wellness businesses everywhere**

[Report Bug](https://github.com/yourusername/serene-wellness/issues) •
[Request Feature](https://github.com/yourusername/serene-wellness/issues) •
[View Demo](https://your-demo-url.com)

</div>
