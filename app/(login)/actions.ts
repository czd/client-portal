'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function signIn(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signUp(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName || '' },
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signInWithMagicLink(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.BASE_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: 'Check your email for a magic link!' };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function updateAccount(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const fullName = formData.get('name') as string;
  const companyName = formData.get('companyName') as string;
  const preferredCurrency = formData.get('preferredCurrency') as string;

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      company_name: companyName,
      ...(preferredCurrency && { preferred_currency: preferredCurrency }),
    })
    .eq('id', user.id);

  if (error) return { error: error.message };
  return { success: 'Account updated successfully.' };
}
