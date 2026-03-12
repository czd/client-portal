import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getServiceById } from '@/lib/supabase/queries';
import ServiceForm from '../../service-form';
import PriceManager from '../../price-manager';
import DeleteServiceButton from '../../delete-service-button';
import { updateServiceAction } from '../../actions';

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = await getServiceById(id);

  if (!service) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/admin/services"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to services
      </Link>

      <div className="space-y-6">
        <ServiceForm
          service={service}
          action={updateServiceAction}
          submitLabel="Save Changes"
        />

        <PriceManager
          serviceId={service.id}
          prices={service.service_prices}
        />

        <DeleteServiceButton serviceId={service.id} serviceName={service.name} />
      </div>
    </div>
  );
}
