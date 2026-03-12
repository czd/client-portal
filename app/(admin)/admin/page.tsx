import { getAdminDashboardStats } from '@/lib/supabase/queries';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Package, CreditCard } from 'lucide-react';

export default async function AdminPage() {
  const stats = await getAdminDashboardStats();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid sm:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-10 w-10 text-orange-500 mr-4" />
              <div>
                <p className="text-3xl font-bold">{stats.totalClients}</p>
                <p className="text-sm text-gray-500">Total clients</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Package className="h-10 w-10 text-orange-500 mr-4" />
              <div>
                <p className="text-3xl font-bold">{stats.activeServices}</p>
                <p className="text-sm text-gray-500">Active client services</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CreditCard className="h-10 w-10 text-orange-500 mr-4" />
              <div>
                <p className="text-3xl font-bold">{stats.activeSubscriptions}</p>
                <p className="text-sm text-gray-500">Active subscriptions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
