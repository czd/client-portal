import Stripe from 'stripe';
import {
  getProfileByStripeCustomerId,
  setStripeCustomerId,
  createClientService,
  updateClientServiceBySubscription,
  logActivity,
} from '@/lib/supabase/queries';
import type { Profile } from '@/lib/types';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

// ============================================
// CHECKOUT
// ============================================

export async function createCheckoutSession({
  profile,
  priceId,
  serviceId,
  mode,
}: {
  profile: Profile;
  priceId: string;
  serviceId: string;
  mode: 'subscription' | 'payment';
}) {
  let stripeCustomerId = profile.stripe_customer_id;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      metadata: { supabase_profile_id: profile.id },
    });
    stripeCustomerId = customer.id;
    await setStripeCustomerId(profile.id, stripeCustomerId);
  }

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode,
    success_url: `${process.env.BASE_URL}/dashboard?checkout=success`,
    cancel_url: `${process.env.BASE_URL}/services?checkout=cancelled`,
    automatic_tax: { enabled: true },
    client_reference_id: profile.id,
    metadata: {
      profile_id: profile.id,
      service_id: serviceId,
    },
  });

  return session;
}

// ============================================
// CUSTOMER PORTAL
// ============================================

export async function createCustomerPortalSession(profile: Profile) {
  if (!profile.stripe_customer_id) {
    throw new Error('No Stripe customer ID found');
  }

  return stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${process.env.BASE_URL}/dashboard/billing`,
  });
}

// ============================================
// WEBHOOK HANDLERS
// ============================================

export async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const profileId = session.metadata?.profile_id || session.client_reference_id;
  const serviceId = session.metadata?.service_id;
  if (!profileId || !serviceId) {
    console.error('Missing profile_id or service_id in checkout session metadata');
    return;
  }

  const customerId = typeof session.customer === 'string'
    ? session.customer : session.customer?.id;
  if (customerId) await setStripeCustomerId(profileId, customerId);

  const subscriptionId = typeof session.subscription === 'string'
    ? session.subscription : session.subscription?.id;

  if (subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await createClientService({
      profile_id: profileId,
      service_id: serviceId,
      status: 'active',
      stripe_subscription_id: subscriptionId,
      stripe_checkout_session_id: session.id,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    });
  } else {
    await createClientService({
      profile_id: profileId,
      service_id: serviceId,
      status: 'active',
      stripe_checkout_session_id: session.id,
    });
  }

  await logActivity({
    profile_id: profileId,
    action: 'purchase_completed',
    resource_type: 'checkout',
    resource_id: session.id,
  });
}

export async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = typeof subscription.customer === 'string'
    ? subscription.customer : subscription.customer.id;
  const status = subscription.status;

  const statusMap: Record<string, string> = {
    active: 'active', trialing: 'active',
    canceled: 'cancelled', unpaid: 'cancelled',
    paused: 'paused',
  };

  const mappedStatus = statusMap[status];
  if (mappedStatus) {
    const updates: Record<string, string> = { status: mappedStatus };
    if (mappedStatus === 'active') {
      updates.current_period_start = new Date(subscription.current_period_start * 1000).toISOString();
      updates.current_period_end = new Date(subscription.current_period_end * 1000).toISOString();
    }
    await updateClientServiceBySubscription(subscription.id, updates);
  }

  const profile = await getProfileByStripeCustomerId(customerId);
  if (profile) {
    await logActivity({
      profile_id: profile.id,
      action: `subscription_${status}`,
      resource_type: 'subscription',
      resource_id: subscription.id,
    });
  }
}

export async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = typeof invoice.customer === 'string'
    ? invoice.customer : invoice.customer?.id;
  if (!customerId) return;

  const profile = await getProfileByStripeCustomerId(customerId);
  if (profile) {
    await logActivity({
      profile_id: profile.id,
      action: 'payment_failed',
      resource_type: 'invoice',
      resource_id: invoice.id,
    });
  }
}
