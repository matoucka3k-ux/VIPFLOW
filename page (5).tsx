import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getUserWithRole } from '@/lib/auth';
import { getUserSubscriptions } from '@/lib/subscriptions';
import type { Abonne } from '@/types';
import AbonneDashboardClient from './client';

export default async function AbonneDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const authUser = await getUserWithRole(supabase);
  if (!authUser) redirect('/auth/login');
  if (authUser.role !== 'abonne') redirect('/dashboard/tipster');

  const abonne = authUser.profile as Abonne;
  const subscriptions = await getUserSubscriptions(supabase, abonne.id);

  return <AbonneDashboardClient abonne={abonne} subscriptions={subscriptions} />;
}
