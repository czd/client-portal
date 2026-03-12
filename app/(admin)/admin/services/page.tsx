import { getAllServices } from '@/lib/supabase/queries';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { CATEGORY_LABELS, PRICING_TYPE_LABELS, type ServiceCategory, type PricingType } from '@/lib/types';

export default async function AdminServicesPage() {
  const services = await getAllServices();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Service Catalog</h1>
        <Link href="/admin/services/new">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {services.map((service) => (
          <Card key={service.id}>
            <CardContent className="py-4 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-gray-900">{service.name}</h3>
                  {!service.is_active && (
                    <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {CATEGORY_LABELS[service.category as ServiceCategory]} ·{' '}
                  {PRICING_TYPE_LABELS[service.pricing_type as PricingType]} ·{' '}
                  {service.service_prices.length} price(s)
                </p>
              </div>
              <Link href={`/admin/services/${service.id}/edit`}>
                <Button variant="outline" size="sm">Edit</Button>
              </Link>
            </CardContent>
          </Card>
        ))}

        {services.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No services yet. Create your first service to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
