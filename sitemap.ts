import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';

export const metadata: Metadata = {
  title: 'TipHub — La plateforme des tipsters pros',
  description: 'Créez votre espace tipster, partagez vos pronostics et gérez vos abonnés. Stats vérifiées, accès par QR code.',
  openGraph: {
    title: 'TipHub — La plateforme des tipsters pros',
    description: 'Créez votre espace tipster, partagez vos pronostics et gérez vos abonnés.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
