'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { CURRENCY_CONFIG, formatPrice } from '@/lib/types';
import type { ServicePrice, Currency, PriceInterval } from '@/lib/types';
import { createPriceAction, deletePriceAction } from './actions';

type ActionState = { error?: string; success?: string };

const currencies = Object.entries(CURRENCY_CONFIG) as [Currency, { symbol: string; name: string }][];
const intervals: { value: string; label: string }[] = [
  { value: '', label: 'One-time' },
  { value: 'month', label: 'Monthly' },
  { value: 'year', label: 'Yearly' },
];

function DeletePriceButton({ priceId, serviceId }: { priceId: string; serviceId: string }) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    deletePriceAction,
    {}
  );

  return (
    <form action={formAction} className="inline">
      <input type="hidden" name="price_id" value={priceId} />
      <input type="hidden" name="service_id" value={serviceId} />
      <button
        type="submit"
        disabled={isPending}
        className="text-red-500 hover:text-red-700 p-1 disabled:opacity-50"
        title="Delete price"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </button>
      {state?.error && <span className="text-red-500 text-xs ml-1">{state.error}</span>}
    </form>
  );
}

export default function PriceManager({
  serviceId,
  prices,
}: {
  serviceId: string;
  prices: ServicePrice[];
}) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    createPriceAction,
    {}
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prices</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Existing prices */}
        {prices.length > 0 ? (
          <div className="space-y-2 mb-6">
            {prices.map((price) => (
              <div
                key={price.id}
                className="flex items-center justify-between border rounded-md px-4 py-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {formatPrice(price.amount, price.currency as Currency)}
                    </span>
                    <span className="text-xs text-gray-500 uppercase">{price.currency}</span>
                    {price.interval && (
                      <span className="text-xs text-gray-500">/ {price.interval}</span>
                    )}
                    {!price.interval && (
                      <span className="text-xs text-gray-500">one-time</span>
                    )}
                    {!price.is_active && (
                      <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 font-mono">
                    {price.stripe_price_id}
                  </p>
                </div>
                <DeletePriceButton priceId={price.id} serviceId={serviceId} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 mb-6">
            No prices yet. Add a price below.
          </p>
        )}

        {/* Add new price form */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Add Price
          </h4>
          <form action={formAction} className="space-y-3">
            <input type="hidden" name="service_id" value={serviceId} />

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="currency" className="mb-1 text-xs">Currency</Label>
                <select
                  id="currency"
                  name="currency"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  {currencies.map(([code, config]) => (
                    <option key={code} value={code}>
                      {code.toUpperCase()} - {config.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="amount" className="mb-1 text-xs">Amount (smallest unit)</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  min={0}
                  required
                  placeholder="e.g. 50000 for 500 NOK"
                />
              </div>

              <div>
                <Label htmlFor="interval" className="mb-1 text-xs">Interval</Label>
                <select
                  id="interval"
                  name="interval"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  {intervals.map((i) => (
                    <option key={i.value} value={i.value}>{i.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="stripe_price_id" className="mb-1 text-xs">Stripe Price ID</Label>
              <Input
                id="stripe_price_id"
                name="stripe_price_id"
                required
                placeholder="price_..."
              />
            </div>

            {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}
            {state?.success && <p className="text-green-600 text-sm">{state.success}</p>}

            <Button
              type="submit"
              disabled={isPending}
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Price'
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
