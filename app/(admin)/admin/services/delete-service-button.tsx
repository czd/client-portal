'use client';

import { useActionState, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Trash2 } from 'lucide-react';
import { deleteServiceAction } from './actions';

type ActionState = { error?: string; success?: string };

export default function DeleteServiceButton({
  serviceId,
  serviceName,
}: {
  serviceId: string;
  serviceName: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    deleteServiceAction,
    {}
  );

  return (
    <Card className="border-red-200">
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-red-600">Delete Service</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              This will permanently delete this service and all its prices.
            </p>
          </div>
          {!confirming ? (
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 border-red-300 hover:bg-red-50"
              onClick={() => setConfirming(true)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          ) : (
            <form action={formAction} className="flex items-center gap-2">
              <input type="hidden" name="id" value={serviceId} />
              <span className="text-xs text-red-600">Delete &quot;{serviceName}&quot;?</span>
              <Button
                type="submit"
                size="sm"
                disabled={isPending}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Confirm'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setConfirming(false)}
              >
                Cancel
              </Button>
            </form>
          )}
        </div>
        {state?.error && <p className="text-red-500 text-sm mt-2">{state.error}</p>}
      </CardContent>
    </Card>
  );
}
