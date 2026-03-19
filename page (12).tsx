import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// Called by Vercel Cron or external cron service
// vercel.json: { "crons": [{ "path": "/api/cron/expire", "schedule": "*/15 * * * *" }] }
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc('expire_subscriptions');

  return NextResponse.json({ expired: data, error: error?.message });
}
