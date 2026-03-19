'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Abonne, Tipster, Subscription, Pick as PickType, PickStatut } from '@/types';

const STATUT_STYLES: Record<PickStatut, string> = {
  en_cours: 'bg-blue-50 text-blue-700', win: 'bg-emerald-50 text-emerald-700',
  loss: 'bg-red-50 text-red-700', nul: 'bg-gray-50 text-gray-600',
};
const STATUT_LABELS: Record<PickStatut, string> = {
  en_cours: 'En cours', win: 'Win ✓', loss: 'Loss ✗', nul: 'Nul',
};

interface Props {
  abonne: Abonne;
  subscriptions: Subscription[];
}

export default function AbonneDashboardClient({ abonne, subscriptions }: Props) {
  const [picks, setPicks] = useState<(PickType & { tipster?: Tipster })[]>([]);
  const [loadingPicks, setLoadingPicks] = useState(true);
  const [filterSport, setFilterSport] = useState('all');
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [newPickIds, setNewPickIds] = useState<Set<string>>(new Set());
  const router = useRouter();
  const supabase = createClient();

  const activeSubs = subscriptions.filter(
    s => s.statut === 'active' && (!s.date_expiration || new Date(s.date_expiration) > new Date())
  );
  const tipsterIds = activeSubs.map(s => s.tipster_id);

  const fetchPicks = useCallback(async () => {
    if (tipsterIds.length === 0) { setPicks([]); setLoadingPicks(false); return; }
    const { data } = await supabase
      .from('picks').select('*, tipster:tipsters(*)')
      .in('tipster_id', tipsterIds)
      .order('created_at', { ascending: false }).limit(100);
    if (data) setPicks(data as (PickType & { tipster?: Tipster })[]);
    setLoadingPicks(false);
  }, [tipsterIds.join(',')]);

  useEffect(() => { fetchPicks(); }, [fetchPicks]);

  // Realtime
  useEffect(() => {
    if (tipsterIds.length === 0) return;
    const channel = supabase.channel('picks-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'picks' }, async (payload) => {
        const newPick = payload.new as PickType;
        if (tipsterIds.includes(newPick.tipster_id)) {
          const { data: tipster } = await supabase.from('tipsters').select('*').eq('id', newPick.tipster_id).single();
          setPicks(prev => [{ ...newPick, tipster: tipster as Tipster } as any, ...prev]);
          setNewPickIds(prev => new Set(prev).add(newPick.id));
          setTimeout(() => setNewPickIds(prev => { const s = new Set(prev); s.delete(newPick.id); return s; }), 10000);
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'picks' }, (payload) => {
        const updated = payload.new as PickType;
        setPicks(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated } : p));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [tipsterIds.join(',')]);

  const sports = [...new Set(picks.map(p => p.sport))];
  const filtered = picks.filter(p => {
    if (filterSport !== 'all' && p.sport !== filterSport) return false;
    if (filterStatut !== 'all' && p.statut !== filterStatut) return false;
    return true;
  });

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/'); };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-bold tracking-tight"><span className="text-primary">Tip</span>Hub</Link>
            <span className="px-2 py-0.5 rounded-md bg-secondary text-muted-foreground text-xs font-medium">Abonné</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/explore" className="text-sm text-muted-foreground hover:text-foreground">Explorer</Link>
            <span className="text-sm text-muted-foreground">{abonne.nom}</span>
            <button onClick={handleLogout} className="text-sm text-muted-foreground hover:text-foreground">Déconnexion</button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Mon Feed</h2>
          <div className="flex items-center gap-2">
            <select value={filterSport} onChange={e => setFilterSport(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-input bg-background text-xs">
              <option value="all">Tous les sports</option>
              {sports.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-input bg-background text-xs">
              <option value="all">Tous les statuts</option>
              <option value="en_cours">En cours</option>
              <option value="win">Win</option>
              <option value="loss">Loss</option>
              <option value="nul">Nul</option>
            </select>
          </div>
        </div>

        {/* Subscriptions summary */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {activeSubs.map(sub => (
            <Link key={sub.id} href={`/${sub.tipster?.username}`}
              className="shrink-0 flex items-center gap-2 px-3 py-2 border border-border rounded-lg hover:border-primary/30 transition-colors">
              <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                {sub.tipster?.nom?.charAt(0) || '?'}
              </div>
              <span className="text-xs font-medium">{sub.tipster?.nom}</span>
            </Link>
          ))}
          {activeSubs.length === 0 && (
            <Link href="/explore" className="text-sm text-primary hover:underline">Découvrir des tipsters →</Link>
          )}
        </div>

        {/* Feed */}
        {loadingPicks ? (
          <div className="text-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-xl">
            <p className="text-muted-foreground">
              {activeSubs.length === 0 ? 'Abonnez-vous à des tipsters pour voir leurs picks.' : 'Aucun pick ne correspond aux filtres.'}
            </p>
            {activeSubs.length === 0 && (
              <Link href="/explore" className="inline-block mt-3 text-primary font-medium text-sm hover:underline">Découvrir les tipsters →</Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(pick => (
              <div key={pick.id} className={`border rounded-xl p-5 transition-all ${
                newPickIds.has(pick.id) ? 'border-primary/50 bg-primary/[0.02] ring-1 ring-primary/20' : 'border-border hover:border-primary/20'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <Link href={`/${pick.tipster?.username}`} className="flex items-center gap-2 hover:opacity-80">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
                      {pick.tipster?.nom?.charAt(0) || '?'}
                    </div>
                    <div>
                      <span className="text-sm font-medium">{pick.tipster?.nom}</span>
                      <span className="text-xs text-muted-foreground ml-1.5">@{pick.tipster?.username}</span>
                    </div>
                  </Link>
                  {newPickIds.has(pick.id) && (
                    <span className="ml-2 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">NOUVEAU</span>
                  )}
                  <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded ${STATUT_STYLES[pick.statut]}`}>{STATUT_LABELS[pick.statut]}</span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-secondary">{pick.sport}</span>
                    </div>
                    <h3 className="font-semibold mt-1">{pick.match}</h3>
                    {pick.analyse && <p className="text-sm text-muted-foreground mt-2">{pick.analyse}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-lg font-bold">{pick.cote}</div>
                    <div className="flex gap-0.5 justify-end mt-1">
                      {Array.from({length: pick.mise}).map((_, i) => <span key={i} className="text-xs">⭐</span>)}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                  {new Date(pick.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
