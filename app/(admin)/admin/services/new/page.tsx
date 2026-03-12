import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ServiceForm from '../service-form';
import { createServiceAction } from '../actions';

export default function NewServicePage() {
  return (
    <div>
      <Link
        href="/admin/services"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to services
      </Link>

      <ServiceForm action={createServiceAction} submitLabel="Create Service" />
    </div>
  );
}
