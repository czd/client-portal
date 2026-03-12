import { redirect } from 'next/navigation';
import { getUser, getClientServices } from '@/lib/supabase/queries';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';
import Link from 'next/link';
import { CATEGORY_LABELS, type ServiceCategory } from '@/lib/types';

export default async function MyServicesPage() {
  const profile = await getUser();
  if (!profile) redirect('/sign-in');

  const clientServices = await getClientServices(profile.id);

  const statusColors: Record<string, string> = {
    active: 'text-green-700 bg-green-50',
    cancelled: 'text-red-700 bg-red-50',
    paused: 'text-yellow-700 bg-yellow-50',
    completed: 'text-blue-700 bg-blue-50',
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Services</h1>
        <Link href="/services">
          <Button variant="outline" className="rounded-full" size="sm">
            Browse more services
          </Button>
        </Link>
      </div>

      {clientServices.length > 0 ? (
        <div className="space-y-4">
          {clientServices.map((cs) => (
            <Card key={cs.id}>
              <CardContent className="py-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{cs.service.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {CATEGORY_LABELS[cs.service.category as ServiceCategory]}
                    </p>
                    {cs.stripe_subscription_id && cs.current_period_end && (
                      <p className="text-sm text-gray-500 mt-1">
                        {cs.status === 'active'
                          ? `Renews ${new Date(cs.current_period_end).toLocaleDateString()}`
                          : `Ended ${new Date(cs.current_period_end).toLocaleDateString()}`}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      Purchased {new Date(cs.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      statusColors[cs.status] || 'text-gray-700 bg-gray-50'
                    }`}
                  >
                    {cs.status}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No services yet</h3>
            <p className="text-gray-500 mb-6">
              Browse our catalog to find the right service for your needs.
            </p>
            <Link href="/services">
              <Button className="rounded-full bg-orange-500 hover:bg-orange-600 text-white">
                Browse Services
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
