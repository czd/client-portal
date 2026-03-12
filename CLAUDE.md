# CLAUDE.md — Project Context for AI Assistants

## Project Summary

This is a **client portal SaaS** built with Next.js 15 (App Router), Supabase, and Stripe. It was scaffolded from the [nextjs/saas-starter](https://github.com/nextjs/saas-starter) template with significant modifications: Drizzle ORM and custom JWT auth were replaced with Supabase (Auth + Postgres + RLS), and the team/RBAC model was replaced with a simpler client/admin role system.

The portal lets clients browse a service catalog, purchase services via Stripe Checkout, and manage billing through Stripe's Customer Portal. An admin section provides catalog management and client oversight.

---

## Architecture

### Route Groups
- `(dashboard)` — Public pages and authenticated client pages. Shares a layout with a header/nav.
- `(login)` — Sign-in and sign-up pages. Separate layout (no header).
- `(admin)` — Admin-only pages. Has its own sidebar layout. Protected by role check in middleware.
- `api/` — API routes for Stripe webhooks, checkout, portal, and user data.
- `auth/` — Supabase auth callback for magic links.

### Key Directories
- `lib/supabase/` — All Supabase client setup and database queries.
  - `server.ts` — Server-side Supabase client (cookie-based, respects RLS) and admin client (service_role, bypasses RLS).
  - `client.ts` — Browser-side Supabase client.
  - `queries.ts` — All database operations. This is the main data layer. Server components and API routes import from here.
  - `middleware.ts` — Session refresh and route protection logic.
- `lib/payments/` — Stripe integration.
  - `stripe.ts` — Stripe client init, checkout session creation, customer portal, and all webhook handlers.
  - `actions.ts` — Server actions wrapping Stripe operations for use in forms.
- `lib/types/` — TypeScript types matching the database schema, plus currency/category helpers.
- `supabase/migrations/` — SQL migration files. The schema is the source of truth for the database structure.
- `components/ui/` — shadcn/ui components (button, card, input, etc.).

### Database Schema (Supabase Postgres)
Five tables, all with RLS enabled:
- `profiles` — Extends auth.users. Has stripe_customer_id, preferred_currency, role (client/admin). Auto-created via trigger on signup.
- `services` — Product catalog. Slug-based, categorized, with a metadata JSONB field for flexible data.
- `service_prices` — Multi-currency pricing. Each row maps to a Stripe Price ID. One service can have many prices (NOK/EUR/ISK × month/year/one-time).
- `client_services` — Join table tracking what each client has purchased. Written by the webhook handler, read by client dashboard.
- `activity_log` — Audit trail. Written by webhook handlers and server actions.

### Auth Flow
- Supabase Auth handles all authentication (email/password + magic link).
- The root `middleware.ts` calls `lib/supabase/middleware.ts` which refreshes the session and enforces route protection.
- `/dashboard/*` requires any authenticated user.
- `/admin/*` requires an authenticated user with `role = 'admin'` in the profiles table.
- The admin client (`createAdminClient()`) uses `SUPABASE_SERVICE_ROLE_KEY` and bypasses RLS. It's used in webhook handlers and admin queries. **Never expose this key client-side.**

### Stripe Flow
1. Client clicks "Purchase" or "Subscribe" on a service detail page.
2. A form posts to the `checkoutAction` server action with priceId, serviceId, and mode.
3. The action creates a Stripe Checkout Session (creating a Stripe Customer if needed) and redirects.
4. After payment, Stripe sends a `checkout.session.completed` webhook to `/api/stripe/webhook`.
5. The webhook handler creates a `client_services` row and logs the activity.
6. Subscription lifecycle events (updated, deleted, payment_failed) are also handled via webhooks.
7. Clients manage billing through Stripe's Customer Portal, accessed via `/dashboard/billing`.

---

## Conventions

### Data Access
- **Server Components and API routes** import from `lib/supabase/queries.ts`. Never query Supabase directly in components.
- **Client Components** fetch data via SWR from `/api/user` or similar API routes.
- **Writes from webhooks or admin** use `createAdminClient()` (bypasses RLS).
- **Writes from authenticated users** use `createClient()` (respects RLS).

### Naming
- Database columns use `snake_case`.
- TypeScript interfaces use `PascalCase` and match column names with snake_case (Supabase convention).
- Route files follow Next.js App Router conventions: `page.tsx`, `layout.tsx`, `route.ts`.

### Stripe Metadata
- Checkout sessions include `profile_id` and `service_id` in metadata. The webhook handler uses these to create the correct `client_services` row.
- Stripe Customer objects include `supabase_profile_id` in metadata for traceability.

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL     — Supabase project URL (public)
NEXT_PUBLIC_SUPABASE_ANON_KEY — Supabase anon key (public, respects RLS)
SUPABASE_SERVICE_ROLE_KEY     — Supabase service role key (server-only, bypasses RLS)
STRIPE_SECRET_KEY             — Stripe secret key (server-only)
STRIPE_WEBHOOK_SECRET         — Stripe webhook signing secret (server-only)
BASE_URL                      — App URL for Stripe redirects (http://localhost:3000 in dev)
```

---

## Common Tasks

### Adding a new service to the catalog
1. Insert a row into `services` via admin UI or SQL.
2. Create matching Stripe Product and Price(s) in the Stripe Dashboard.
3. Insert rows into `service_prices` with the `stripe_price_id` from Stripe.

### Adding a new database table
1. Create a new migration SQL file in `supabase/migrations/`.
2. Enable RLS and add appropriate policies.
3. Add the TypeScript type to `lib/types/index.ts`.
4. Add query functions to `lib/supabase/queries.ts`.

### Adding a new admin page
1. Create a page in `app/(admin)/admin/your-page/page.tsx`.
2. Add a nav item in `app/(admin)/layout.tsx`.
3. The middleware already protects all `/admin/*` routes.

### Adding a new client dashboard page
1. Create a page in `app/(dashboard)/dashboard/your-page/page.tsx`.
2. Start with `const profile = await getUser(); if (!profile) redirect('/sign-in');`.
3. Add navigation if needed in the dashboard layout or user menu dropdown.

### Testing Stripe locally
```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
# Use test card: 4242 4242 4242 4242, any future date, any CVC
```

---

## Known Gaps / TODOs

These are documented in detail in `PLAN.md`. The main incomplete pieces:
- Admin service editor forms (create/edit pages are empty directories)
- Admin service price management
- Stripe Product/Price sync workflow
- Branding (still uses generic placeholder logo and colors)
- Email template customization in Supabase
- Proper loading/error states across pages

---

## Things to Avoid

- **Don't query Supabase directly in components.** Always go through `lib/supabase/queries.ts`.
- **Don't expose `SUPABASE_SERVICE_ROLE_KEY` client-side.** It bypasses all RLS.
- **Don't create Stripe Customers outside the checkout flow.** The `createCheckoutSession` function handles customer creation automatically.
- **Don't store financial data in Supabase.** Stripe is the source of truth for all billing. Supabase stores references (IDs and status) only.
- **Don't remove RLS policies** without understanding the security implications. Every table must have RLS enabled.
