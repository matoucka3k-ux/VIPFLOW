import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getTipsterStats } from '@/lib/picks';
import type { Tipster, TipsterStats } from '@/types';

export const metadata = {
  title: 'Explorer les tipsters — TipHub',
  description: 'Trouvez les meilleurs tipsters sur TipHub. Filtrez par sport, triez par ROI et taux de réussite.',
};

export default async function ExplorePage() {
  const supabase = await createServerSupabaseClient();
  const { data: tipsters } = await supabase
    .from('tipsters')
    .select('*')
    .eq('is_suspended', false)
    .eq('onboarding_completed', true)
    .order('created_at', { ascending: false });

  // Get stats for each tipster
  const tipstersWithStats: (Tipster & { stats: TipsterStats })[] = [];
  for (const t of (tipsters as Tipster[]) || []) {
    const stats = await getTipsterStats(supabase, t.id);
    tipstersWithStats.push({ ...t, stats });
  }

  // Sort by ROI (default)
  tipstersWithStats.sort((a, b) => b.stats.roi - a.stats.roi);

  const sports = [...new Set(tipstersWithStats.map(t => t.sport))];

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight"><span className="text-primary">Tip</span>Hub</Link>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground">Connexion</Link>
            <Link href="/auth/register/tipster" className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 font-medium">
              Devenir tipster
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Explorer les tipsters</h1>
          <p className="text-muted-foreground mt-2">Trouvez les pronostiqueurs les plus performants.</p>
        </div>

        {/* Sport filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <span className="shrink-0 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium">Tous</span>
          {sports.map(s => (
            <span key={s} className="shrink-0 px-3 py-1.5 rounded-lg bg-secondary text-sm font-medium cursor-pointer hover:bg-secondary/80">{s}</span>
          ))}
        </div>

        {tipstersWithStats.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-xl">
            <p className="text-muted-foreground">Aucun tipster disponible.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tipstersWithStats.map(t => (
              <Link key={t.id} href={`/${t.username}`}
                className="group border border-border rounded-xl p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-lg">
                    {t.nom.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{t.nom}</h3>
                    <p className="text-sm text-muted-foreground">@{t.username}</p>
                  </div>
                  <span className="px-2 py-1 rounded-md bg-secondary text-xs font-medium">{t.sport}</span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center p-2 rounded-lg bg-secondary/50">
                    <div className="text-sm font-bold">{t.stats.winrate}%</div>
                    <div className="text-[10px] text-muted-foreground">Win</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-secondary/50">
                    <div className={`text-sm font-bold ${t.stats.roi >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {t.stats.roi > 0 ? '+' : ''}{t.stats.roi}%
                    </div>
                    <div className="text-[10px] text-muted-foreground">ROI</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-secondary/50">
                    <div className="text-sm font-bold">{t.stats.total_picks}</div>
                    <div className="text-[10px] text-muted-foreground">Picks</div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{t.description || 'Aucune description.'}</p>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-sm font-semibold text-primary">{t.prix_abonnement}€/mois</span>
                  <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors">Voir →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
