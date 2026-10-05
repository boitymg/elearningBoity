import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth/AuthContext';

export const metadata: Metadata = {
  title: 'elearning.boity — Plateforme E-learning Interactive de BOITY STUDIO',
  description:
    'Moteur de modules e-learning interactifs professionnels par Boity Studio. Vidéo interactive Type 2 et Type 3, HTML5 & export SCORM 1.2 conforme.',
  icons: {
    icon: '/brand/logo-boity.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#F8FAFC] text-slate-900 font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
