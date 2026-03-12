-- ============================================
-- Client Portal Schema
-- Run via: supabase db push or supabase migration up
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- 1. PROFILES
-- ============================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  company_name text,
  stripe_customer_id text unique,
  preferred_currency text not null default 'nok'
    check (preferred_currency in ('nok', 'isk', 'eur')),
  role text not null default 'client'
    check (role in ('client', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ============================================
-- 2. SERVICES (product catalog)
-- ============================================
create table public.services (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  category text not null
    check (category in ('website', 'application', 'consulting', 'workshop', 'coaching')),
  pricing_type text not null
    check (pricing_type in ('one_time', 'recurring', 'hourly', 'custom')),
  stripe_product_id text,
  is_active boolean not null default true,
  display_order integer not null default 0,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.services enable row level security;

create policy "Anyone can view active services"
  on public.services for select
  using (is_active = true);

-- Admin writes handled via service_role key (bypasses RLS)

-- ============================================
-- 3. SERVICE PRICES (multi-currency)
-- ============================================
create table public.service_prices (
  id uuid primary key default uuid_generate_v4(),
  service_id uuid not null references public.services(id) on delete cascade,
  currency text not null
    check (currency in ('nok', 'isk', 'eur')),
  amount integer not null, -- smallest unit (øre, aurar, cents)
  interval text
    check (interval is null or interval in ('month', 'year')),
  stripe_price_id text not null,
  is_active boolean not null default true
);

alter table public.service_prices enable row level security;

create policy "Anyone can view active prices"
  on public.service_prices for select
  using (is_active = true);

-- ============================================
-- 4. CLIENT SERVICES (purchased services)
-- ============================================
create table public.client_services (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  service_id uuid not null references public.services(id),
  status text not null default 'active'
    check (status in ('active', 'cancelled', 'paused', 'completed')),
  stripe_subscription_id text,
  stripe_checkout_session_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.client_services enable row level security;

create policy "Users can view own client_services"
  on public.client_services for select
  using (auth.uid() = profile_id);

-- Writes via service_role (webhook handler)

-- ============================================
-- 5. ACTIVITY LOG
-- ============================================
create table public.activity_log (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  action text not null,
  resource_type text not null,
  resource_id text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.activity_log enable row level security;

create policy "Users can view own activity"
  on public.activity_log for select
  using (auth.uid() = profile_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

create trigger client_services_updated_at
  before update on public.client_services
  for each row execute function public.update_updated_at();

-- ============================================
-- INDEXES
-- ============================================
create index idx_services_slug on public.services(slug);
create index idx_services_category on public.services(category);
create index idx_services_active on public.services(is_active);
create index idx_service_prices_service on public.service_prices(service_id);
create index idx_client_services_profile on public.client_services(profile_id);
create index idx_client_services_status on public.client_services(status);
create index idx_activity_log_profile on public.activity_log(profile_id);
create index idx_profiles_stripe_customer on public.profiles(stripe_customer_id);
