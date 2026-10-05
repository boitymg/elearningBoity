'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { Button } from '@/components/ui/Button';
import { CourseCard } from '@/components/ui/CourseCard';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { supabase } from '@/lib/supabase/client';
import type { Formation } from '@/lib/types/elearning';
import {
  Play,
  Award,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Video,
  FileCode2,
  CheckCircle,
} from 'lucide-react';

export default function HomePage() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFormations() {
      try {
        const { data, error } = await supabase
          .from('formations')
          .select('*')
          .eq('status', 'publiee')
          .order('created_at', { ascending: false });

        if (!error && data) {
          setFormations(data as Formation[]);
        }
      } catch (err) {
        console.error('Erreur chargement formations:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFormations();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <PublicNavbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-white border-b border-slate-200/80 py-20 lg:py-28">
          {/* Subtle Background Glows */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Colonne Texte */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                {/* Badge Marque */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#0B4F9C] text-xs font-bold tracking-wide uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-[#EE9B00]" />
                  <span>Plateforme E-learning • Boity Studio</span>
                </div>

                {/* Titre Principal */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
                  Des formations{' '}
                  <span className="text-[#EE9B00]">interactives</span> pour{' '}
                  <span className="text-[#0B4F9C]">apprendre autrement</span>.
                </h1>

                {/* Sous-titre */}
                <p className="text-lg sm:text-xl text-slate-600 max-w-2xl leading-relaxed">
                  Une expérience e-learning conçue par Boity Studio. Alliez la puissance de la vidéo professionnelle, la précision de la timeline interactive et la certification SCORM 1.2 conforme.
                </p>

                {/* Boutons d'Action (CTAs) */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                  <Link href="/formations">
                    <Button
                      variant="primary"
                      size="lg"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Découvrir les formations
                    </Button>
                  </Link>

                  <Link href="/connexion">
                    <Button
                      variant="secondary"
                      size="lg"
                    >
                      Se connecter
                    </Button>
                  </Link>
                </div>

                {/* Badges de confiance Jovena / SCORM */}
                <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-[#EE9B00]" />
                    <span>Conforme Cahier des Charges Jovena</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-[#0B4F9C]" />
                    <span>SCORM 1.2 &amp; HTML5 Autonome</span>
                  </div>
                </div>
              </div>

              {/* Colonne Aperçu Visuel Player */}
              <div className="lg:col-span-5 relative">
                <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl p-2 bg-gradient-to-tr from-[#0B4F9C] to-[#EE9B00] shadow-2xl">
                  <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-900 group">
                    <Image
                      src="/brand/logo-boity.png"
                      alt="Boity E-learning Player Preview"
                      fill
                      className="object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                      <Link href="/formations">
                        <div className="w-16 h-16 rounded-full bg-[#EE9B00] text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 active:scale-95 transition-all">
                          <Play className="w-7 h-7 fill-current ml-1" />
                        </div>
                      </Link>
                    </div>

                    {/* Badge interactif simulé */}
                    <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-xs text-white text-xs px-3 py-1 rounded-md flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#EE9B00] animate-ping" />
                      <span>Timeline synchronisée • video.currentTime</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION CARACTÉRISTIQUES CLÉS DU MOTEUR BOITY */}
        <section className="py-16 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#0B4F9C] mb-2">
                Le Moteur E-learning Boity
              </h2>
              <p className="text-3xl font-extrabold text-slate-900">
                Deux modes d&apos;apprentissage sur mesure
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Carte Type 2 */}
              <div className="bg-white rounded-2xl p-8 border border-slate-200/90 shadow-xs hover:border-[#0B4F9C] transition-all">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0B4F9C] flex items-center justify-center mb-6">
                  <Video className="w-6 h-6" />
                </div>
                <div className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0B4F9C] text-white uppercase tracking-wider mb-3">
                  Type 2 • Vidéo Interactive
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Parcours libre sans évaluation
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Exploration active grâce à des chapitres, boutons cliquables, zones sensibles (hotspots) et sauts conditionnels. Idéal pour les démonstrations de process et guides techniques sur serveur interne.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-700 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#EE9B00]" />
                    <span>Navigation libre et accès direct aux séquences</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#EE9B00]" />
                    <span>Export en package HTML5 autonome sans dépendance</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#EE9B00]" />
                    <span>Déploiement direct sur serveur interne (Jovena)</span>
                  </li>
                </ul>
              </div>

              {/* Carte Type 3 */}
              <div className="bg-white rounded-2xl p-8 border border-slate-200/90 shadow-xs hover:border-[#EE9B00] transition-all">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#EE9B00] flex items-center justify-center mb-6">
                  <Award className="w-6 h-6" />
                </div>
                <div className="inline-block px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#EE9B00] text-slate-950 uppercase tracking-wider mb-3">
                  Type 3 • Vidéo avec Évaluation
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Certification &amp; Traçabilité Complète
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Intègre des quiz interactifs synchronisés, calcul automatique de score, gestion du seuil de réussite (ex: 70%) et export certifié SCORM 1.2 pour LMS d&apos;entreprise.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-700 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#0B4F9C]" />
                    <span>Quiz QCM, choix multiples et vrai/faux avec explications</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#0B4F9C]" />
                    <span>Export SCORM 1.2 complet avec imsmanifest.xml valide</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#0B4F9C]" />
                    <span>Traçabilité cmi (lesson_status, score.raw, session_time)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION CATALOGUE EN VEDETTE */}
        <section className="py-16 bg-white border-t border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#0B4F9C] mb-1">
                  Catalogue officiel
                </h2>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  Formations disponibles
                </p>
              </div>
              <Link href="/formations">
                <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Toutes les formations
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-80 bg-slate-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : formations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {formations.map((f) => (
                  <CourseCard key={f.id} formation={f} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-slate-600 font-medium">
                  Aucune formation n&apos;est actuellement publiée.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* FOOTER OFFICIEL BOITY STUDIO */}
      <footer className="bg-slate-900 text-white border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
            <BrandLogo variant="full" size="md" href="/" />
            <p className="text-xs text-slate-400 text-center md:text-right">
              BOITY STUDIO • Solutions E-learning, Audiovisuel &amp; Ingénierie Pédagogique
            </p>
          </div>
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} Boity Studio. Tous droits réservés.</p>
            <div className="flex items-center gap-6">
              <Link href="/a-propos" className="hover:text-white transition-colors">
                À propos
              </Link>
              <Link href="/contact" className="hover:text-white transition-colors">
                Contact
              </Link>
              <Link href="/admin/dashboard" className="text-[#EE9B00] hover:underline">
                Administration Studio
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
