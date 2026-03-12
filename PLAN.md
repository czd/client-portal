# Client Portal — Project Plan

## Overview

A custom-built client portal where customers can browse a service catalog, purchase subscriptions and one-time services, and manage their invoices and payment history. Built on the `nextjs/saas-starter` template, migrated from Drizzle/raw Postgres to Supabase, with Stripe handling all billing.

**Business context:** Norwegian AS selling technical services (websites, applications, consulting, workshops, coaching) to clients in Norway, Iceland, and the EU. Typically 1–5 active clients at any time with a mix of one-time, recurring, and hourly pricing.

---

## Tech Stack

| Layer        | Technology                          |
| ------------ | ----------------------------------- |
| Framework    | Next.js 15 (App Router, TypeScript) |
| Backend / DB | Supabase (Postgres + Auth + RLS)    |
| Payments     | Stripe (Checkout, Subscriptions, Customer Portal, Tax) |
| UI           | shadcn/ui + Tailwind CSS            |
| Hosting      | Vercel                              |

---

## What's Been Built

### Infrastructure
- [x] Supabase migration with full schema (profiles, services, service_prices, client_services, activity_log)
- [x] Row Level Security policies on all tables
- [x] Auto-create profile trigger on auth.users insert
- [x] Auto-update updated_at triggers
- [x] Database indexes for common query patterns
- [x] Seed SQL with 5 example services across all categories

### Auth
- [x] Supabase Auth replacing the template's custom JWT system
- [x] Email/password sign-in and sign-up
- [x] Magic link sign-in option
- [x] Auth callback route for magic links (`/auth/callback`)
- [x] Middleware protecting `/dashboard` and `/admin` routes
- [x] Admin role check in middleware (redirects non-admins away from `/admin`)

### Supabase Integration
- [x] Server client with cookie handling (`lib/supabase/server.ts`)
- [x] Browser client for client components (`lib/supabase/client.ts`)
- [x] Admin client using service_role key (`createAdminClient()`)
- [x] Comprehensive query module (`lib/supabase/queries.ts`)
- [x] Session refresh middleware (`lib/supabase/middleware.ts`)

### Stripe Integration
- [x] Checkout session creation with automatic_tax enabled
- [x] Support for both subscription and one-time payment modes
- [x] Customer Portal session creation for billing management
- [x] Auto-creation of Stripe Customer on first checkout
- [x] Webhook handler for: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- [x] Service ID passed through checkout metadata for linking purchases to catalog items

### Pages — Public
- [x] Landing page (`/`) with service category overview
- [x] Service catalog (`/services`) with category filtering
- [x] Service detail page (`/services/[slug]`) with multi-currency pricing and checkout buttons
- [x] Sign-in and sign-up pages with magic link option

### Pages — Client Dashboard
- [x] Dashboard overview (`/dashboard`) with active service count and quick links
- [x] My Services (`/dashboard/services`) with status badges and renewal dates
- [x] Billing (`/dashboard/billing`) with Stripe Customer Portal redirect
- [x] Settings (`/dashboard/settings`) with name, company, and currency preference

### Pages — Admin
- [x] Admin overview (`/admin`) with client/service/subscription counts
- [x] Service catalog list (`/admin/services`) showing all services including inactive
- [x] Client list (`/admin/clients`) with company, currency, and Stripe status
- [x] Activity log (`/admin/activity`) with all events across clients

### Types & Helpers
- [x] Full TypeScript types matching the database schema (`lib/types/index.ts`)
- [x] Currency formatting with locale-aware `Intl.NumberFormat`
- [x] Category and pricing type label maps

---

## What Still Needs To Be Built

### High Priority (before first client use)
- [ ] **Admin service editor** — Create (`/admin/services/new`) and edit (`/admin/services/[id]/edit`) forms for managing the catalog. Directories exist but pages are empty.
- [ ] **Admin service price management** — CRUD for service_prices within the service editor, including Stripe Price ID linking.
- [ ] **Stripe product/price sync** — Either manual (enter Stripe IDs in admin) or automated (create Stripe Products/Prices from the admin UI via API).
- [ ] **Branding** — Replace the generic landing page, logo (`CircleIcon`), and color scheme with your actual brand.
- [ ] **Email templates** — Configure Supabase Auth email templates (confirmation, magic link, password reset) with your branding.

### Medium Priority (quality of life)
- [ ] **Stripe Tax registration** — Configure your Norwegian AS tax registration in Stripe Dashboard and verify VAT calculation works for NO/IS/EU clients.
- [ ] **Error and loading states** — Add proper loading skeletons and error boundaries across dashboard pages.
- [ ] **Toast notifications** — Add feedback for actions like successful checkout return, settings save, etc.
- [ ] **Password reset flow** — Currently only magic link bypasses password; add an explicit "forgot password" flow.
- [ ] **Admin client detail page** — Click into a client to see their services, activity, and Stripe link.

### Lower Priority (future enhancements)
- [ ] **Hourly billing** — Time tracking or manual hour logging with Stripe usage-based billing.
- [ ] **Client-specific pricing** — Custom quotes and private pricing visible only to specific clients.
- [ ] **Notifications** — Email alerts for subscription changes, payment failures, upcoming renewals.
- [ ] **Localization** — Norwegian/Icelandic/English UI translations.
- [ ] **Analytics** — Revenue reporting dashboard in admin.
- [ ] **File sharing** — Attach deliverables to client_services (could use Supabase Storage).

---

## Getting Started

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the migration: copy `supabase/migrations/00001_initial_schema.sql` into the Supabase SQL editor and execute
3. Optionally run `supabase/seed.sql` to populate example services
4. Copy `.env.example` to `.env` and fill in Supabase + Stripe keys
5. `pnpm install && pnpm dev`
6. Create a user via `/sign-up`, then set their role to `admin` in Supabase: `update profiles set role = 'admin' where id = '<your-user-id>';`
7. Create Stripe Products and Prices in test mode, then insert rows into `service_prices` with the real `stripe_price_id` values
8. Test the full flow: browse catalog → checkout → webhook → dashboard
