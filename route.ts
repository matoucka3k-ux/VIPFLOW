import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getUserWithRole } from '@/lib/auth';
import { getTipsterPicks, getTipsterStats } from '@/lib/picks';
import { getTipsterSubscribers } from '@/lib/subscriptions';
import type { Tipster } from '@/types';
import TipsterDashboardClient from './client';

export default async function TipsterDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const authUser = await getUserWithRole(supabase);
  if (!authUser) redirect('/auth/login');
  if (authUser.role !== 'tipster') redirect('/dashboard/abonne');

  const tipster = authUser.profile as Tipster;
  const [picks, stats, subscribers] = await Promise.all([
    getTipsterPicks(supabase, tipster.id),
    getTipsterStats(supabase, tipster.id),
    getTipsterSubscribers(supabase, tipster.id),
  ]);

  return (
    <TipsterDashboardClient
      tipster={tipster}
      initialPicks={picks}
      stats={stats}
      subscribers={subscribers}
    />
  );
}
