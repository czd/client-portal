'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CircleIcon, Loader2, Mail } from 'lucide-react';
import { signIn, signUp, signInWithMagicLink } from './actions';

type ActionState = { error?: string; success?: string };

export function Login({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const [useMagicLink, setUseMagicLink] = useState(false);

  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    useMagicLink ? signInWithMagicLink : mode === 'signin' ? signIn : signUp,
    {}
  );

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <CircleIcon className="h-12 w-12 text-orange-500" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {useMagicLink
            ? 'Sign in with magic link'
            : mode === 'signin'
              ? 'Sign in to your account'
              : 'Create your account'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <form className="space-y-6" action={formAction}>
          <input type="hidden" name="redirect" value={redirect || ''} />

          <div>
            <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 rounded-full"
              placeholder="Enter your email"
            />
          </div>

          {!useMagicLink && (
            <>
              {mode === 'signup' && (
                <div>
                  <Label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    className="mt-1 rounded-full"
                    placeholder="Enter your name"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  required
                  minLength={8}
                  className="mt-1 rounded-full"
                  placeholder="Enter your password"
                />
              </div>
            </>
          )}

          {state?.error && (
            <div className="text-red-500 text-sm">{state.error}</div>
          )}
          {state?.success && (
            <div className="text-green-600 text-sm">{state.success}</div>
          )}

          <Button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-orange-600 hover:bg-orange-700 text-white"
          >
            {pending ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Loading...
              </>
            ) : useMagicLink ? (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send magic link
              </>
            ) : mode === 'signin' ? (
              'Sign in'
            ) : (
              'Sign up'
            )}
          </Button>
        </form>

        {mode === 'signin' && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setUseMagicLink(!useMagicLink)}
              className="text-sm text-orange-600 hover:text-orange-700"
            >
              {useMagicLink
                ? 'Use password instead'
                : 'Sign in with magic link'}
            </button>
          </div>
        )}

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">
                {mode === 'signin' ? 'New here?' : 'Already have an account?'}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <Link
              href={mode === 'signin' ? '/sign-up' : '/sign-in'}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              {mode === 'signin' ? 'Create an account' : 'Sign in to existing account'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
