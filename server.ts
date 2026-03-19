import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Tipster } from '@/types';

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();
  const { data: tipsters } = await supabase
    .from('tipsters')
    .select('*')
    .eq('is_suspended', false)
    .eq('onboarding_completed', true)
    .order('created_at', { ascending: false })
    .limit(6);

  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            <span className="text-primary">Tip</span>Hub
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/explore" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Explorer</Link>
            <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Connexion</Link>
            <Link href="/auth/register/tipster" className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium">
              Créer mon espace
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            100% gratuit pour les tipsters
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
            Monétise ton expertise<br />
            <span className="text-primary">de tipster</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl">
            Crée ton espace, publie tes pronostics VIP, partage ton QR code et gère tes abonnés. Stats vérifiées, transparence totale.
          </p>
          <div className="flex gap-3">
            <Link href="/auth/register/tipster" className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium">
              Créer mon espace — gratuit
            </Link>
            <Link href="/explore" className="border border-border px-6 py-3 rounded-lg hover:bg-secondary transition-colors font-medium">
              Voir les tipsters
            </Link>
          </div>
        </div>
      </section>

      {/* Comment ça marche — 3 étapes */}
      <section className="border-y border-border bg-secondary/30">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-12">Comment ça marche</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', icon: '👤', title: 'Crée ton espace', desc: 'Inscris-toi en 30 secondes. Remplis ton profil, choisis ton sport et fixe ton prix.' },
              { step: '2', icon: '📱', title: 'Partage ton QR code', desc: 'Génère ton QR code unique. Partage-le sur tes réseaux et tes groupes.' },
              { step: '3', icon: '✅', title: 'Active tes abonnés', desc: 'Tes abonnés scannent le QR, s\'inscrivent et tu les actives depuis ton dashboard.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-3xl flex items-center justify-center mx-auto mb-4">
                  {item.icon}
                </div>
                <div className="text-xs font-bold text-primary mb-2">ÉTAPE {item.step}</div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tipsters en vedette */}
      {tipsters && tipsters.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold tracking-tight mb-10">Tipsters en vedette</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(tipsters as Tipster[]).map((t) => (
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
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{t.description || 'Aucune description.'}</p>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-sm font-semibold text-primary">{t.prix_abonnement}€/mois</span>
                  <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors">Voir le profil →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="bg-primary rounded-2xl p-12 text-center text-primary-foreground">
          <h2 className="text-3xl font-bold mb-4">Prêt à lancer ton espace tipster ?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">
            Inscription gratuite. Pas de carte bancaire. Commence à publier tes picks aujourd'hui.
          </p>
          <Link href="/auth/register/tipster"
            className="inline-block bg-white text-primary px-8 py-3 rounded-lg font-medium hover:bg-white/90 transition-colors">
            Créer mon espace — gratuit
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-muted-foreground">
          <span>© 2026 TipHub</span>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-foreground transition-colors">CGU</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Mentions légales</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
