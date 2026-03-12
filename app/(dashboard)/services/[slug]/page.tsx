import { notFound } from 'next/navigation';
import { getServiceBySlug } from '@/lib/supabase/queries';
import {
  CATEGORY_LABELS,
  PRICING_TYPE_LABELS,
  formatPrice,
  type ServiceCategory,
  type Currency,
} from '@/lib/types';
import { checkoutAction } from '@/lib/payments/actions';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) notFound();

  const currencies: Currency[] = ['nok', 'eur', 'isk'];
  const metadata = service.metadata as Record<string, any>;
  const includes = (metadata?.includes as string[]) || [];

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <span className="text-sm font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
          {CATEGORY_LABELS[service.category as ServiceCategory]}
        </span>
      </div>

      <h1 className="text-4xl font-bold text-gray-900 mb-4">{service.name}</h1>
      <p className="text-lg text-gray-600 mb-8">{service.description}</p>

      {/* Features */}
      {includes.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">What&apos;s included</h2>
          <ul className="space-y-3">
            {includes.map((item, i) => (
              <li key={i} className="flex items-start">
                <Check className="h-5 w-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pricing cards per currency */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing</h2>
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {currencies.map((currency) => {
          const price = service.service_prices.find(
            (p) => p.currency === currency && p.is_active
          );
          if (!price) return null;

          const mode = price.interval ? 'subscription' : 'payment';

          return (
            <Card key={currency}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500 uppercase">
                  {currency.toUpperCase()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {formatPrice(price.amount, currency)}
                </p>
                {price.interval && (
                  <p className="text-sm text-gray-500 mb-4">per {price.interval}</p>
                )}
                {!price.interval && (
                  <p className="text-sm text-gray-500 mb-4">one-time</p>
                )}
                <form action={checkoutAction}>
                  <input type="hidden" name="priceId" value={price.stripe_price_id} />
                  <input type="hidden" name="serviceId" value={service.id} />
                  <input type="hidden" name="mode" value={mode} />
                  <Button type="submit" className="w-full rounded-full bg-orange-500 hover:bg-orange-600 text-white">
                    {mode === 'subscription' ? 'Subscribe' : 'Purchase'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {service.pricing_type === 'custom' && service.service_prices.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-lg text-gray-700 mb-4">
              This service is priced based on your specific requirements.
            </p>
            <Button className="rounded-full bg-orange-500 hover:bg-orange-600 text-white">
              Contact for a quote
            </Button>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
