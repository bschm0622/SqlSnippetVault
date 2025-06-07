# Phase 3 PRD — Stripe Payments Integration

## Goal
Allow users to upgrade to the paid plan using Stripe. Paid status will be stored in Supabase and used to unlock GitHub sync and other premium features.

---

## Tech Stack
- **Frontend**: React
- **Auth**: Supabase (GitHub login from Phase 2)
- **Payments**: Stripe Checkout
- **Backend**: Supabase Edge Functions (for payment webhooks and database updates)

---

## Functional Requirements

### 1. Pricing Page / Upgrade Prompt
- [ ] Display a clean "Upgrade to Pro" button in the UI (e.g., settings panel)
- [ ] Clicking it redirects to a **Stripe Checkout session**
- [ ] Price: `$29 one-time purchase`
- [ ] After payment, user is redirected back to the app

### 2. Supabase Database Changes
- [x] Create `profiles` table (if not already)
- [x] Add a `is_paid` boolean column, default `false`
- [x] Use `user.id` as primary key or foreign key from auth.users

### 3. Webhook to Handle Stripe Checkout
- [ ] Create a Supabase Edge Function that:
  - Listens for successful Stripe Checkout sessions
  - Matches the Stripe email to the Supabase user
  - Sets `is_paid = true` in the `profiles` table
- [ ] Secure the endpoint with Stripe webhook secrets

### 4. Frontend Logic (React)
- [ ] On app load, fetch `is_paid` from Supabase for the current user
- [ ] Store `is_paid` in React context or state
- [ ] Gate premium features (like GitHub sync) behind the `is_paid` check

---

## Non-Functional Requirements
- [ ] Users must be logged in before upgrading
- [ ] Payment flow should be smooth and trustworthy
- [ ] Stripe should send confirmation email to the user
- [ ] Use test mode during development, switch to live in production

---

## Stripe Configuration
- [ ] Set up product and one-time price ($49)
- [ ] Configure Checkout with redirect URLs:
  - Success: `https://your-app.com/success`
  - Cancel: `https://your-app.com/cancel`
- [ ] Set up webhook endpoint to hit Supabase Edge Function

---

## Optional Enhancements (Nice-to-Have)
- [ ] Display “Pro” badge or status in UI after payment
- [ ] Email receipt / confirmation from your side
- [ ] Graceful handling if payment status fetch fails

