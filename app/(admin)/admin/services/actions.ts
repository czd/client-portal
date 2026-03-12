'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
  createService,
  updateService,
  deleteService,
  createServicePrice,
  updateServicePrice,
  deleteServicePrice,
  getUser,
} from '@/lib/supabase/queries';
import type { ServiceCategory, PricingType, Currency, PriceInterval } from '@/lib/types';

type ActionState = { error?: string; success?: string };

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function createServiceAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const profile = await getUser();
  if (!profile || profile.role !== 'admin') {
    return { error: 'Unauthorized' };
  }

  const name = (formData.get('name') as string)?.trim();
  const description = (formData.get('description') as string)?.trim() ?? '';
  const category = formData.get('category') as ServiceCategory;
  const pricingType = formData.get('pricing_type') as PricingType;
  const stripeProductId = (formData.get('stripe_product_id') as string)?.trim() || null;
  const isActive = formData.get('is_active') === 'on';
  const displayOrder = parseInt(formData.get('display_order') as string) || 0;

  if (!name) return { error: 'Service name is required.' };
  if (!category) return { error: 'Category is required.' };
  if (!pricingType) return { error: 'Pricing type is required.' };

  const slug = generateSlug(name);
  if (!slug) return { error: 'Could not generate a valid slug from the name.' };

  try {
    await createService({
      name,
      slug,
      description,
      category,
      pricing_type: pricingType,
      stripe_product_id: stripeProductId,
      is_active: isActive,
      display_order: displayOrder,
      metadata: {},
    });
  } catch (err: any) {
    if (err?.code === '23505') {
      return { error: 'A service with this name (slug) already exists.' };
    }
    return { error: err?.message ?? 'Failed to create service.' };
  }

  revalidatePath('/admin/services');
  redirect('/admin/services');
}

export async function updateServiceAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const profile = await getUser();
  if (!profile || profile.role !== 'admin') {
    return { error: 'Unauthorized' };
  }

  const id = formData.get('id') as string;
  if (!id) return { error: 'Service ID is missing.' };

  const name = (formData.get('name') as string)?.trim();
  const description = (formData.get('description') as string)?.trim() ?? '';
  const category = formData.get('category') as ServiceCategory;
  const pricingType = formData.get('pricing_type') as PricingType;
  const stripeProductId = (formData.get('stripe_product_id') as string)?.trim() || null;
  const isActive = formData.get('is_active') === 'on';
  const displayOrder = parseInt(formData.get('display_order') as string) || 0;

  if (!name) return { error: 'Service name is required.' };
  if (!category) return { error: 'Category is required.' };
  if (!pricingType) return { error: 'Pricing type is required.' };

  const slug = generateSlug(name);
  if (!slug) return { error: 'Could not generate a valid slug from the name.' };

  try {
    await updateService(id, {
      name,
      slug,
      description,
      category,
      pricing_type: pricingType,
      stripe_product_id: stripeProductId,
      is_active: isActive,
      display_order: displayOrder,
    });
  } catch (err: any) {
    if (err?.code === '23505') {
      return { error: 'A service with this name (slug) already exists.' };
    }
    return { error: err?.message ?? 'Failed to update service.' };
  }

  revalidatePath('/admin/services');
  revalidatePath(`/admin/services/${id}/edit`);
  return { success: 'Service updated successfully.' };
}

export async function deleteServiceAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const profile = await getUser();
  if (!profile || profile.role !== 'admin') {
    return { error: 'Unauthorized' };
  }

  const id = formData.get('id') as string;
  if (!id) return { error: 'Service ID is missing.' };

  try {
    await deleteService(id);
  } catch (err: any) {
    return { error: err?.message ?? 'Failed to delete service.' };
  }

  revalidatePath('/admin/services');
  redirect('/admin/services');
}

export async function createPriceAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const profile = await getUser();
  if (!profile || profile.role !== 'admin') {
    return { error: 'Unauthorized' };
  }

  const serviceId = formData.get('service_id') as string;
  const currency = formData.get('currency') as Currency;
  const amountStr = formData.get('amount') as string;
  const interval = (formData.get('interval') as string) || null;
  const stripePriceId = (formData.get('stripe_price_id') as string)?.trim();

  if (!serviceId) return { error: 'Service ID is missing.' };
  if (!currency) return { error: 'Currency is required.' };
  if (!amountStr) return { error: 'Amount is required.' };
  if (!stripePriceId) return { error: 'Stripe Price ID is required.' };

  const amount = parseInt(amountStr);
  if (isNaN(amount) || amount < 0) return { error: 'Amount must be a non-negative number.' };

  try {
    await createServicePrice({
      service_id: serviceId,
      currency,
      amount,
      interval: interval as PriceInterval | null,
      stripe_price_id: stripePriceId,
      is_active: true,
    });
  } catch (err: any) {
    return { error: err?.message ?? 'Failed to create price.' };
  }

  revalidatePath(`/admin/services/${serviceId}/edit`);
  return { success: 'Price added successfully.' };
}

export async function updatePriceAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const profile = await getUser();
  if (!profile || profile.role !== 'admin') {
    return { error: 'Unauthorized' };
  }

  const priceId = formData.get('price_id') as string;
  const serviceId = formData.get('service_id') as string;
  const stripePriceId = (formData.get('stripe_price_id') as string)?.trim();
  const isActive = formData.get('is_active') === 'on';

  if (!priceId) return { error: 'Price ID is missing.' };
  if (!stripePriceId) return { error: 'Stripe Price ID is required.' };

  try {
    await updateServicePrice(priceId, {
      stripe_price_id: stripePriceId,
      is_active: isActive,
    });
  } catch (err: any) {
    return { error: err?.message ?? 'Failed to update price.' };
  }

  revalidatePath(`/admin/services/${serviceId}/edit`);
  return { success: 'Price updated.' };
}

export async function deletePriceAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const profile = await getUser();
  if (!profile || profile.role !== 'admin') {
    return { error: 'Unauthorized' };
  }

  const priceId = formData.get('price_id') as string;
  const serviceId = formData.get('service_id') as string;

  if (!priceId) return { error: 'Price ID is missing.' };

  try {
    await deleteServicePrice(priceId);
  } catch (err: any) {
    return { error: err?.message ?? 'Failed to delete price.' };
  }

  revalidatePath(`/admin/services/${serviceId}/edit`);
  return { success: 'Price deleted.' };
}
