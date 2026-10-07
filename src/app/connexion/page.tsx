'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/auth/AuthContext';
import { Lock, Mail, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';

function ConnexionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/app/formations';

  const { signInWithEmail, signInWithGoogle, user, isAdmin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirection automatique si déjà connecté
  React.useEffect(() => {
    if (user) {
      router.push(isAdmin ? '/admin/dashboard' : redirectUrl);
    }
  }, [user, isAdmin, redirectUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Veuillez renseigner votre email et mot de passe.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await signInWithEmail(email, password);
      router.push(redirectUrl);
    } catch (err: unknown) {
      console.error(err);
      setError('Identifiants incorrects ou compte introuvable.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      router.push(redirectUrl);
    } catch (err: unknown) {
      console.error(err);
      setError('Erreur lors de la connexion Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white py-8 px-6 sm:px-10 shadow-xl border border-slate-200 rounded-3xl">
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Adresse email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="votre.email@boity.mg"
          leftIcon={<Mail className="w-4 h-4" />}
          required
        />

        <Input
          label="Mot de passe"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
          required
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          isLoading={loading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Se connecter
        </Button>
      </form>

      {/* Séparateur */}
      <div className="mt-6 relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-slate-400 font-semibold">ou continuer avec</span>
        </div>
      </div>

      <div className="mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full text-slate-700 font-medium"
          leftIcon={
            <svg className="w-4 h-4 shrink-0 mr-1" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
          }
        >
          Connexion avec Google
        </Button>
      </div>

      <div className="mt-6 text-center text-xs text-slate-500">
        <span>{"Vous n'avez pas de compte ? "}</span>
        <Link href="/inscription" className="font-bold text-[#0B4F9C] hover:underline">
          Créer un compte
        </Link>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0B4F9C] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#EE9B00]" />
          <span>Retour à la page d&apos;accueil</span>
        </Link>
      </div>
    </div>
  );
}

export default function ConnexionPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* BOUTON RETOUR HAUT GAUCHE */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-[#0B4F9C] text-xs sm:text-sm font-semibold transition-all border border-slate-200/80 shadow-xs hover:shadow-sm group"
          title="Retour à l'accueil"
        >
          <ArrowLeft className="w-4 h-4 text-[#EE9B00] group-hover:-translate-x-0.5 transition-transform" />
          <span>Retour à l&apos;accueil</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <BrandLogo variant="full" size="lg" href="/" />
        <h2 className="mt-6 text-2xl font-black text-slate-900 tracking-tight">
          Connexion à votre espace
        </h2>
        <p className="mt-2 text-xs text-slate-600">
          Plateforme e-learning officielle de Boity Studio
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Suspense fallback={<div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-xs text-slate-500">Chargement...</div>}>
          <ConnexionForm />
        </Suspense>
      </div>
    </div>
  );
}
