import { getAllClients } from '@/lib/supabase/queries';
import { Card, CardContent } from '@/components/ui/card';
import { CURRENCY_CONFIG, type Currency } from '@/lib/types';

export default async function AdminClientsPage() {
  const clients = await getAllClients();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Clients</h1>

      <div className="space-y-3">
        {clients.map((client) => (
          <Card key={client.id}>
            <CardContent className="py-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {client.full_name || 'Unnamed client'}
                </h3>
                <p className="text-sm text-gray-500">
                  {client.company_name && `${client.company_name} · `}
                  {CURRENCY_CONFIG[client.preferred_currency as Currency]?.name || client.preferred_currency}
                  {client.stripe_customer_id && ' · Stripe linked'}
                </p>
              </div>
              <p className="text-xs text-gray-400">
                Joined {new Date(client.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}

        {clients.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No clients yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
