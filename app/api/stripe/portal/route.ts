import { NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase/queries';
import { createCustomerPortalSession } from '@/lib/payments/stripe';

export async function POST() {
  try {
    const profile = await getUser();
    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!profile.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No billing account found. Please make a purchase first.' },
        { status: 400 }
      );
    }

    const session = await createCustomerPortalSession(profile);
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Portal error:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
