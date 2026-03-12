'use server';

import { redirect } from 'next/navigation';
import { createCheckoutSession, createCustomerPortalSession } from './stripe';
import { getUser } from '@/lib/supabase/queries';

export async function checkoutAction(formData: FormData) {
  const profile = await getUser();
  if (!profile) redirect('/sign-in');

  const priceId = formData.get('priceId') as string;
  const serviceId = formData.get('serviceId') as string;
  const mode = formData.get('mode') as 'subscription' | 'payment';

  const session = await createCheckoutSession({
    profile,
    priceId,
    serviceId,
    mode: mode || 'subscription',
  });

  redirect(session.url!);
}

export async function customerPortalAction() {
  const profile = await getUser();
  if (!profile) redirect('/sign-in');

  const session = await createCustomerPortalSession(profile);
  redirect(session.url);
}
