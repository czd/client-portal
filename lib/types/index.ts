// Types matching the Supabase schema
// For full auto-generation, run: supabase gen types typescript --local > lib/types/supabase.ts

export type Currency = 'nok' | 'isk' | 'eur';
export type UserRole = 'client' | 'admin';
export type ServiceCategory = 'website' | 'application' | 'consulting' | 'workshop' | 'coaching';
export type PricingType = 'one_time' | 'recurring' | 'hourly' | 'custom';
export type ClientServiceStatus = 'active' | 'cancelled' | 'paused' | 'completed';
export type PriceInterval = 'month' | 'year';

export interface Profile {
  id: string;
  full_name: string | null;
  company_name: string | null;
  stripe_customer_id: string | null;
  preferred_currency: Currency;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: ServiceCategory;
  pricing_type: PricingType;
  stripe_product_id: string | null;
  is_active: boolean;
  display_order: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ServicePrice {
  id: string;
  service_id: string;
  currency: Currency;
  amount: number; // smallest currency unit
  interval: PriceInterval | null;
  stripe_price_id: string;
  is_active: boolean;
}

export interface ClientService {
  id: string;
  profile_id: string;
  service_id: string;
  status: ClientServiceStatus;
  stripe_subscription_id: string | null;
  stripe_checkout_session_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  profile_id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// Joined types for convenience
export interface ServiceWithPrices extends Service {
  service_prices: ServicePrice[];
}

export interface ClientServiceWithDetails extends ClientService {
  service: Service;
}

// Currency display helpers
export const CURRENCY_CONFIG: Record<Currency, { symbol: string; name: string; locale: string }> = {
  nok: { symbol: 'kr', name: 'Norwegian Krone', locale: 'nb-NO' },
  isk: { symbol: 'kr', name: 'Icelandic Króna', locale: 'is-IS' },
  eur: { symbol: '€', name: 'Euro', locale: 'de-DE' },
};

export function formatPrice(amount: number, currency: Currency): string {
  const config = CURRENCY_CONFIG[currency];
  // amount is in smallest unit, convert to main unit
  const divisor = currency === 'isk' ? 1 : 100; // ISK has no subunit in practice
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: currency === 'isk' ? 0 : 2,
  }).format(amount / divisor);
}

export const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  website: 'Websites',
  application: 'Applications',
  consulting: 'Consulting',
  workshop: 'Workshops',
  coaching: 'Coaching',
};

export const PRICING_TYPE_LABELS: Record<PricingType, string> = {
  one_time: 'One-time',
  recurring: 'Subscription',
  hourly: 'Hourly',
  custom: 'Custom quote',
};
