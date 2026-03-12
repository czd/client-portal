'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { CATEGORY_LABELS, PRICING_TYPE_LABELS } from '@/lib/types';
import type { Service, ServiceCategory, PricingType } from '@/lib/types';

type ActionState = { error?: string; success?: string };

interface ServiceFormProps {
  service?: Service;
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
}

const categories = Object.entries(CATEGORY_LABELS) as [ServiceCategory, string][];
const pricingTypes = Object.entries(PRICING_TYPE_LABELS) as [PricingType, string][];

export default function ServiceForm({ service, action, submitLabel }: ServiceFormProps) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(action, {});

  return (
    <Card>
      <CardHeader>
        <CardTitle>{service ? 'Edit Service' : 'New Service'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-5 max-w-lg" action={formAction}>
          {service && <input type="hidden" name="id" value={service.id} />}

          <div>
            <Label htmlFor="name" className="mb-2">Service Name</Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="e.g. Business Website"
              defaultValue={service?.name ?? ''}
            />
          </div>

          <div>
            <Label htmlFor="description" className="mb-2">Description</Label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Describe what this service includes..."
              defaultValue={service?.description ?? ''}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category" className="mb-2">Category</Label>
              <select
                id="category"
                name="category"
                required
                defaultValue={service?.category ?? ''}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="" disabled>Select category</option>
                {categories.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="pricing_type" className="mb-2">Pricing Type</Label>
              <select
                id="pricing_type"
                name="pricing_type"
                required
                defaultValue={service?.pricing_type ?? ''}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="" disabled>Select pricing type</option>
                {pricingTypes.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="stripe_product_id" className="mb-2">Stripe Product ID</Label>
            <Input
              id="stripe_product_id"
              name="stripe_product_id"
              placeholder="prod_..."
              defaultValue={service?.stripe_product_id ?? ''}
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional. Link this to a Stripe Product for syncing.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="display_order" className="mb-2">Display Order</Label>
              <Input
                id="display_order"
                name="display_order"
                type="number"
                min={0}
                defaultValue={service?.display_order ?? 0}
              />
            </div>

            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  defaultChecked={service?.is_active ?? true}
                  className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm font-medium">Active</span>
              </label>
            </div>
          </div>

          {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}
          {state?.success && <p className="text-green-600 text-sm">{state.success}</p>}

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={isPending}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                submitLabel
              )}
            </Button>
            <a href="/admin/services">
              <Button type="button" variant="outline">Cancel</Button>
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
