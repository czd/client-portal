'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { updateAccount } from '@/app/(login)/actions';
import useSWR from 'swr';
import type { Profile } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type ActionState = { error?: string; success?: string };

export default function SettingsPage() {
  const { data: user } = useSWR<Profile>('/api/user', fetcher);
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    updateAccount,
    {}
  );

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4 max-w-md" action={formAction}>
            <div>
              <Label htmlFor="name" className="mb-2">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Your name"
                defaultValue={user?.full_name ?? ''}
              />
            </div>
            <div>
              <Label htmlFor="companyName" className="mb-2">Company</Label>
              <Input
                id="companyName"
                name="companyName"
                placeholder="Company name"
                defaultValue={user?.company_name ?? ''}
              />
            </div>
            <div>
              <Label htmlFor="preferredCurrency" className="mb-2">Preferred Currency</Label>
              <select
                id="preferredCurrency"
                name="preferredCurrency"
                defaultValue={user?.preferred_currency ?? 'nok'}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="nok">NOK - Norwegian Krone</option>
                <option value="eur">EUR - Euro</option>
                <option value="isk">ISK - Icelandic Króna</option>
              </select>
            </div>

            {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}
            {state?.success && <p className="text-green-500 text-sm">{state.success}</p>}

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
                'Save Changes'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
