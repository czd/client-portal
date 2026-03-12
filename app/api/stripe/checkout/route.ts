import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/supabase/queries';
import { createCheckoutSession } from '@/lib/payments/stripe';

export async function POST(request: NextRequest) {
  try {
    const profile = await getUser();
    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId, serviceId, mode } = await request.json();

    if (!priceId || !serviceId) {
      return NextResponse.json(
        { error: 'Missing priceId or serviceId' },
        { status: 400 }
      );
    }

    const session = await createCheckoutSession({
      profile,
      priceId,
      serviceId,
      mode: mode || 'payment',
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
