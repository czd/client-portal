import Link from 'next/link';
import { getActiveServices } from '@/lib/supabase/queries';
import { CATEGORY_LABELS, PRICING_TYPE_LABELS, formatPrice, type ServiceCategory, type Currency } from '@/lib/types';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const revalidate = 3600; // Cache for 1 hour

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; currency?: string }>;
}) {
  const params = await searchParams;
  const services = await getActiveServices();
  const selectedCategory = params.category as ServiceCategory | undefined;
  const currency = (params.currency as Currency) || 'nok';

  const filteredServices = selectedCategory
    ? services.filter((s) => s.category === selectedCategory)
    : services;

  const categories = [...new Set(services.map((s) => s.category))] as ServiceCategory[];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Services</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          From custom websites to strategic consulting, find the right service for your needs.
        </p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        <Link href="/services">
          <Button
            variant={!selectedCategory ? 'default' : 'outline'}
            className="rounded-full"
            size="sm"
          >
            All
          </Button>
        </Link>
        {categories.map((cat) => (
          <Link key={cat} href={`/services?category=${cat}`}>
            <Button
              variant={selectedCategory === cat ? 'default' : 'outline'}
              className="rounded-full"
              size="sm"
            >
              {CATEGORY_LABELS[cat]}
            </Button>
          </Link>
        ))}
      </div>

      {/* Service grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => {
          const price = service.service_prices.find(
            (p) => p.currency === currency && p.is_active
          );

          return (
            <Link key={service.id} href={`/services/${service.slug}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                      {CATEGORY_LABELS[service.category as ServiceCategory]}
                    </span>
                    <span className="text-xs text-gray-500">
                      {PRICING_TYPE_LABELS[service.pricing_type as keyof typeof PRICING_TYPE_LABELS]}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {service.description}
                  </p>
                  {price && (
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPrice(price.amount, currency)}
                      {price.interval && (
                        <span className="text-sm font-normal text-gray-500">
                          /{price.interval}
                        </span>
                      )}
                    </p>
                  )}
                  {!price && service.pricing_type === 'custom' && (
                    <p className="text-lg font-medium text-gray-700">Contact for pricing</p>
                  )}
                  <div className="mt-4 flex items-center text-orange-600 text-sm font-medium">
                    Learn more <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No services found in this category.</p>
        </div>
      )}
    </main>
  );
}
