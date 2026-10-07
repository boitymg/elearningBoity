'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/auth/AuthContext';
import { Lock, Mail, User, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';

export default function InscriptionPage() {
  const router = useRouter();
  const { signUpWithEmail, signInWithGoogle, user } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (user) {
      router.push('/app/formations');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      setError('Veuillez renseigner tous les champs.');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await signUpWithEmail(email, password, name);
      router.push('/app/formations');
    } catch (err: unknown) {
      console.error(err);
      setError("Impossible de créer le compte. L'adresse est peut-être déjà utilisée.");
    } finally {
      setLoading(false);
    }
  };

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
          Créer votre compte apprenant
        </h2>
        <p className="mt-2 text-xs text-slate-600">
          Accédez aux parcours et modules interactifs Boity Studio
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl border border-slate-200 rounded-3xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Nom complet ou prénom"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Andrianina Boity"
              leftIcon={<User className="w-4 h-4" />}
              required
            />

            <Input
              label="Adresse email professionnelle"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nom@entreprise.com"
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Mot de passe sécurisé"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 caractères"
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
              Créer mon compte
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            <span>Vous avez déjà un compte ? </span>
            <Link href="/connexion" className="font-bold text-[#0B4F9C] hover:underline">
              Se connecter
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
      </div>
    </div>
  );
}
