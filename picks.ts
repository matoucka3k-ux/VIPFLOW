'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const SPORTS = ['Football', 'Tennis', 'Basketball', 'MMA', 'Rugby', 'E-sport', 'Autre'];

export default function RegisterTipsterPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    email: '', password: '', username: '', nom: '', sport: 'Football',
    prix_abonnement: '29.99', description: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }
    if (step === 2) { setStep(3); return; }

    setError('');
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email, password: form.password,
      options: { data: { role: 'tipster' } },
    });

    if (authError || !authData.user) {
      setError(authError?.message || 'Erreur inscription.');
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from('tipsters').insert({
      id: authData.user.id,
      username: form.username.toLowerCase().replace(/[^a-z0-9_]/g, ''),
      nom: form.nom,
      sport: form.sport,
      prix_abonnement: parseFloat(form.prix_abonnement),
      description: form.description,
      photo: '',
      payment_connected: false,
      onboarding_completed: true,
    });

    if (profileError) { setError(profileError.message); setLoading(false); return; }
    router.push('/dashboard/tipster?onboarding=complete');
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="block text-2xl font-bold tracking-tight text-center mb-8">
          <span className="text-primary">Tip</span>Hub
        </Link>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8 px-4">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
              }`}>{s}</div>
              {s < 3 && <div className={`flex-1 h-0.5 ${step > s ? 'bg-primary' : 'bg-border'}`} />}
            </div>
          ))}
        </div>

        <div className="border border-border rounded-xl p-8">
          {error && <div className="bg-destructive/10 text-destructive text-sm rounded-lg p-3 mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <>
                <h2 className="text-xl font-semibold mb-1">Ton profil</h2>
                <p className="text-sm text-muted-foreground mb-4">Les infos de base de ton espace tipster.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Nom</label>
                    <input name="nom" value={form.nom} onChange={handleChange} required
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Username</label>
                    <input name="username" value={form.username} onChange={handleChange} required placeholder="king_tips"
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Email</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} required
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Mot de passe</label>
                  <input name="password" type="password" value={form.password} onChange={handleChange} required minLength={6}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="text-xl font-semibold mb-1">Ton expertise</h2>
                <p className="text-sm text-muted-foreground mb-4">Sport et prix d'abonnement mensuel.</p>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Sport principal</label>
                  <select name="sport" value={form.sport} onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Prix abonnement (€/mois)</label>
                  <input name="prix_abonnement" type="number" step="0.01" min="0" value={form.prix_abonnement} onChange={handleChange} required
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Bio</label>
                  <textarea name="description" value={form.description} onChange={handleChange} rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    placeholder="Décris ton expertise..." />
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="text-xl font-semibold mb-1">Récap</h2>
                <p className="text-sm text-muted-foreground mb-4">Vérifie et lance ton espace.</p>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Nom</span><span className="font-medium">{form.nom}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Username</span><span className="font-medium">@{form.username}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Sport</span><span className="font-medium">{form.sport}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Prix</span><span className="font-medium">{form.prix_abonnement}€/mois</span>
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-3 pt-2">
              {step > 1 && (
                <button type="button" onClick={() => setStep(step - 1)}
                  className="flex-1 border border-border py-2.5 rounded-lg font-medium hover:bg-secondary transition-colors">
                  Retour
                </button>
              )}
              <button type="submit" disabled={loading}
                className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                {step < 3 ? 'Suivant' : loading ? 'Création...' : 'Lancer mon espace'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
