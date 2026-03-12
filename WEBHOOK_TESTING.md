# Stripe Webhook Testing Guide

## What was implemented

**File:** `src/app/api/webhooks/stripe/route.ts`

This webhook handler:

- ✅ Verifies Stripe webhook signatures (rejects forged requests)
- ✅ Handles `checkout.session.completed` events
- ✅ Updates booking status: `PENDING` → `CONFIRMED`
- ✅ Stores payment details (`stripePaymentIntentId`, `amountPaid`)
- ✅ Sends confirmation email
- ✅ Is idempotent (handles duplicate webhooks safely)
- ✅ Returns 200 quickly to avoid retries

---

## Local testing with Stripe CLI

### 1. Install Stripe CLI

**macOS (Homebrew):**

```bash
brew install stripe/stripe-cli/stripe
```

**Windows (Scoop):**

```bash
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

**Or download directly:**
https://github.com/stripe/stripe-cli/releases

### 2. Authenticate Stripe CLI

```bash
stripe login
```

This opens your browser to authorize the CLI with your Stripe account. Log in with the same account where your test keys came from.

### 3. Start your Next.js dev server

```bash
npm run dev
```

Your app should be running on `http://localhost:3000`.

### 4. Forward webhooks to your local endpoint

Open a **new terminal** and run:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

You'll see output like:

```
> Ready! You are using Stripe API Version [2026-02-25]. Your webhook signing secret is whsec_abc123... (^C to quit)
```

**Copy the `whsec_...` signing secret** — you need it in step 5.

### 5. Update your `.env` with the webhook secret

Add the signing secret from step 4 to your `.env`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_abc123...
```

**Restart your dev server** for the new env var to load.

### 6. Test the full payment flow

1. Go to `http://localhost:3000`
2. Click **Book Now** on any service
3. Fill in the form (name, email, date tomorrow, time slot)
4. Click **Pay & Book** → redirected to Stripe Checkout
5. Enter test card: `4242 4242 4242 4242`, expiry `12/34`, CVC `123`
6. Click **Pay**
7. Watch the Stripe CLI terminal — you should see:
   ```
   [200 POST] /api/webhooks/stripe [evt_abc123]
   ```
8. Check the Next.js console logs for:
   ```
   [webhook] Processing checkout.session.completed: cs_test_...
   [webhook] Booking <id> confirmed successfully
   ```
9. You'll be redirected to `/success` showing your confirmed booking
10. Check your email inbox for the confirmation email

### 7. Verify in the database

```bash
npx prisma studio
```

Open the `Booking` table — the booking should now have:

- `status: "CONFIRMED"`
- `stripePaymentIntentId: "pi_..."`
- `amountPaid: 8500` (or whatever the service price is)

---

## Manual webhook testing (without full checkout)

You can trigger test webhooks directly using the Stripe CLI:

```bash
stripe trigger checkout.session.completed
```

This creates a fake `checkout.session.completed` event and sends it to your webhook. However, it won't have a real `bookingId` in metadata, so your webhook will log an error — that's expected.

For a more realistic test, use the full flow in step 6.

---

## Common issues

### ❌ "Webhook signature verification failed"

**Cause:** Mismatch between the signing secret in `.env` and what Stripe CLI is using.

**Fix:**

1. Check the Stripe CLI output for the current `whsec_...` value
2. Update `STRIPE_WEBHOOK_SECRET` in `.env`
3. Restart your dev server

### ❌ "STRIPE_WEBHOOK_SECRET is not configured"

**Cause:** The env var is missing or not loaded.

**Fix:**

1. Add `STRIPE_WEBHOOK_SECRET=whsec_...` to `.env`
2. Restart your dev server (env vars only load on startup)

### ❌ Webhook returns 500, Stripe retries forever

**Cause:** Error in your webhook handler code (e.g., DB connection failed).

**Fix:**

1. Check the Next.js console for error logs
2. Fix the issue and restart the server
3. Stripe will automatically retry and succeed

### ❌ Email not sent after payment

**Cause:** `RESEND_API_KEY` is invalid or not set.

**Fix:**

1. Go to https://resend.com/api-keys and create a test key
2. Add to `.env`: `RESEND_API_KEY=re_...`
3. Restart server and test again

**Note:** The booking will still be CONFIRMED even if email fails. Check logs for:

```
[webhook] Failed to send confirmation email for booking <id>
```

---

## Production deployment checklist

Before going live, you'll need to:

1. **Get production webhook secret:**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Click **Add endpoint**
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events: Select `checkout.session.completed`
   - Copy the signing secret and add to production env as `STRIPE_WEBHOOK_SECRET`

2. **Use live mode keys:**
   - Replace `STRIPE_SECRET_KEY=sk_test_...` with `sk_live_...`
   - Replace `STRIPE_PUBLISHABLE_KEY=pk_test_...` with `pk_live_...`

3. **Test in production:**
   - Make a real $1 booking using a real card
   - Verify webhook fires successfully
   - Refund the test payment from Stripe Dashboard

---

## Verify everything is working

Run this checklist after implementing webhooks:

- [ ] Stripe CLI forwards webhooks to your local server
- [ ] Full booking + payment flow completes without errors
- [ ] Booking status changes from `PENDING` → `CONFIRMED` in DB
- [ ] `stripePaymentIntentId` and `amountPaid` are saved
- [ ] Confirmation email arrives in inbox
- [ ] Duplicate webhooks (if you manually replay one) don't re-send email
- [ ] Console shows: `[webhook] Booking <id> confirmed successfully`
- [ ] `/success` page shows payment confirmed

If all boxes are checked, your webhook implementation is production-ready! ✅
