import { redirect } from 'next/navigation';
import { getUser, getClientServices } from '@/lib/supabase/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, CreditCard, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { CATEGORY_LABELS, type ServiceCategory } from '@/lib/types';

export default async function DashboardPage() {
  const profile = await getUser();
  if (!profile) redirect('/sign-in');

  const clientServices = await getClientServices(profile.id);
  const activeServices = clientServices.filter((cs) => cs.status === 'active');

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Welcome{profile.full_name ? `, ${profile.full_name}` : ''}
      </h1>
      <p className="text-gray-500 mb-8">
        Manage your services and billing from your dashboard.
      </p>

      {/* Quick stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-orange-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{activeServices.length}</p>
                <p className="text-sm text-gray-500">Active services</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-orange-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">
                  {activeServices.filter((s) => s.stripe_subscription_id).length}
                </p>
                <p className="text-sm text-gray-500">Active subscriptions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active services list */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Your Services</h2>
          <Link href="/services">
            <Button variant="outline" size="sm" className="rounded-full">
              Browse catalog <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {activeServices.length > 0 ? (
          <div className="space-y-3">
            {activeServices.map((cs) => (
              <Card key={cs.id}>
                <CardContent className="py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{cs.service.name}</p>
                    <p className="text-sm text-gray-500">
                      {CATEGORY_LABELS[cs.service.category as ServiceCategory]}
                      {cs.stripe_subscription_id && ' · Subscription'}
                      {cs.current_period_end && (
                        <> · Renews {new Date(cs.current_period_end).toLocaleDateString()}</>
                      )}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full">
                    {cs.status}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">You haven&apos;t purchased any services yet.</p>
              <Link href="/services">
                <Button className="rounded-full bg-orange-500 hover:bg-orange-600 text-white">
                  Browse Services
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/dashboard/billing">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="py-6 flex items-center">
              <CreditCard className="h-6 w-6 text-orange-500 mr-3" />
              <div>
                <p className="font-medium">Billing & Invoices</p>
                <p className="text-sm text-gray-500">Manage payments and view invoice history</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/settings">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="py-6 flex items-center">
              <Package className="h-6 w-6 text-orange-500 mr-3" />
              <div>
                <p className="font-medium">Account Settings</p>
                <p className="text-sm text-gray-500">Update your profile and preferences</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </section>
  );
}
