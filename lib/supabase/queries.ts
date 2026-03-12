import 'server-only';
import { createClient, createAdminClient } from './server';
import type {
  Profile,
  Service,
  ServiceWithPrices,
  ClientServiceWithDetails,
  ActivityLog,
  Currency,
} from '@/lib/types';

// ============================================
// AUTH & PROFILE
// ============================================

export async function getUser(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile;
}

export async function getProfileByStripeCustomerId(customerId: string): Promise<Profile | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('profiles')
    .select('*')
    .eq('stripe_customer_id', customerId)
    .single();

  return data;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, 'full_name' | 'company_name' | 'preferred_currency'>>
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function setStripeCustomerId(userId: string, stripeCustomerId: string) {
  const admin = createAdminClient();
  await admin
    .from('profiles')
    .update({ stripe_customer_id: stripeCustomerId })
    .eq('id', userId);
}

// ============================================
// SERVICES (catalog)
// ============================================

export async function getActiveServices(): Promise<ServiceWithPrices[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('services')
    .select('*, service_prices(*)')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return (data ?? []) as ServiceWithPrices[];
}

export async function getServiceBySlug(slug: string): Promise<ServiceWithPrices | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('services')
    .select('*, service_prices(*)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as ServiceWithPrices | null;
}

export async function getServiceById(id: string): Promise<ServiceWithPrices | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('services')
    .select('*, service_prices(*)')
    .eq('id', id)
    .single();

  return data as ServiceWithPrices | null;
}

// Admin: get all services including inactive
export async function getAllServices(): Promise<ServiceWithPrices[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('services')
    .select('*, service_prices(*)')
    .order('display_order', { ascending: true });

  if (error) throw error;
  return (data ?? []) as ServiceWithPrices[];
}

export async function createService(service: Omit<Service, 'id' | 'created_at'>) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('services')
    .insert(service)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateService(id: string, updates: Partial<Service>) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('services')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// CLIENT SERVICES (purchases)
// ============================================

export async function getClientServices(profileId: string): Promise<ClientServiceWithDetails[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('client_services')
    .select('*, service:services(*)')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as ClientServiceWithDetails[];
}

export async function createClientService(params: {
  profile_id: string;
  service_id: string;
  status: string;
  stripe_subscription_id?: string | null;
  stripe_checkout_session_id?: string | null;
  current_period_start?: string | null;
  current_period_end?: string | null;
}) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('client_services')
    .insert(params)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateClientServiceBySubscription(
  stripeSubscriptionId: string,
  updates: {
    status?: string;
    current_period_start?: string;
    current_period_end?: string;
  }
) {
  const admin = createAdminClient();
  const { error } = await admin
    .from('client_services')
    .update(updates)
    .eq('stripe_subscription_id', stripeSubscriptionId);

  if (error) throw error;
}

// ============================================
// ACTIVITY LOG
// ============================================

export async function logActivity(params: {
  profile_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  metadata?: Record<string, unknown>;
}) {
  const admin = createAdminClient();
  await admin.from('activity_log').insert(params);
}

export async function getActivityLogs(profileId?: string, limit = 50): Promise<ActivityLog[]> {
  const admin = createAdminClient();
  let query = admin
    .from('activity_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (profileId) {
    query = query.eq('profile_id', profileId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ActivityLog[];
}

// ============================================
// ADMIN QUERIES
// ============================================

export async function getAllClients(): Promise<Profile[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('profiles')
    .select('*')
    .eq('role', 'client')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Profile[];
}

export async function getAdminDashboardStats() {
  const admin = createAdminClient();

  const [clientsResult, activeServicesResult, activeSubscriptionsResult] = await Promise.all([
    admin.from('profiles').select('id', { count: 'exact' }).eq('role', 'client'),
    admin.from('client_services').select('id', { count: 'exact' }).eq('status', 'active'),
    admin.from('client_services').select('id', { count: 'exact' })
      .eq('status', 'active')
      .not('stripe_subscription_id', 'is', null),
  ]);

  return {
    totalClients: clientsResult.count ?? 0,
    activeServices: activeServicesResult.count ?? 0,
    activeSubscriptions: activeSubscriptionsResult.count ?? 0,
  };
}
