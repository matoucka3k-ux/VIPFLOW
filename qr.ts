'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function RegisterAbonnePage() {
  const [form, setForm] = useState({ email: '', password: '', nom: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email, password: form.password,
      options: { data: { role: 'abonne' } },
    });

    if (authError || !data.user) { setError(authError?.message || 'Erreur.'); setLoading(false); return; }

    const { error: profileError } = await supabase.from('abonnes').insert({
      id: data.user.id, email: form.email, nom: form.nom,
    });

    if (profileError) { setError(profileError.message); setLoading(false); return; }
    router.push('/dashboard/abonne');
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="block text-2xl font-bold tracking-tight text-center mb-8">
          <span className="text-primary">Tip</span>Hub
        </Link>
        <div className="border border-border rounded-xl p-8">
          <h1 className="text-xl font-semibold mb-1">Créer un compte</h1>
          <p className="text-sm text-muted-foreground mb-6">Gratuit. Abonnez-vous aux tipsters de votre choix.</p>
          {error && <div className="bg-destructive/10 text-destructive text-sm rounded-lg p-3 mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Nom</label>
              <input name="nom" value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} required
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Mot de passe</label>
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={6}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50">
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-6">
          Déjà inscrit ? <Link href="/auth/login" className="text-primary hover:underline font-medium">Se connecter</Link>
        </p>
      </div>
    </main>
  );
}
