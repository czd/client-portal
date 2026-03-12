'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, ExternalLink, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function BillingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openBillingPortal() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to open billing portal');
        setLoading(false);
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Billing & Invoices</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-orange-500" />
            Manage Billing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">
            View your invoices, update payment methods, and manage your subscriptions
            through our secure billing portal powered by Stripe.
          </p>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <Button
            onClick={openBillingPortal}
            disabled={loading}
            className="rounded-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Opening...
              </>
            ) : (
              <>
                Open Billing Portal
                <ExternalLink className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
