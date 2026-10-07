'use client';

import React from 'react';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Award, Film, CheckCircle, Sparkles, ArrowRight } from 'lucide-react';

export default function AProposPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <PublicNavbar />

      <main className="flex-1 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <BrandLogo variant="symbol" size="lg" />
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
              À propos de <span className="text-[#0B4F9C]">BOITY STUDIO</span>
            </h1>
            <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Créateur de contenus audiovisuels d&apos;exception et développeur de solutions e-learning immersives de nouvelle génération.
            </p>
          </div>

          {/* VIDÉO DE PRÉSENTATION OFFICIELLE BOITY STUDIO */}
          <div className="bg-slate-950 rounded-3xl p-3 sm:p-5 shadow-2xl border-2 border-[#EE9B00]/40 overflow-hidden relative">
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-black shadow-inner">
              <video
                src="/videos/presentation-boity.mp4"
                controls
                playsInline
                poster="/brand/logo-boity.png"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="px-3 sm:px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0 text-xs text-slate-400">
              <span className="font-bold text-[#EE9B00] flex items-center gap-1.5">
                <Film className="w-4 h-4 shrink-0" />
                <span>Présentation Officielle • BOITY STUDIO</span>
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Production audiovisuelle &amp; E-learning</span>
            </div>
          </div>

          {/* Mission Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#EE9B00]" />
              <span>Notre Mission E-learning</span>
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed">
              BOITY STUDIO conçoit, produit et diffuse des parcours e-learning interactifs pour les entreprises exigeantes. Nous croyons que la vidéo pédagogique ne doit pas être un simple flux passif, mais une expérience interactive où chaque seconde permet à l&apos;apprenant d&apos;explorer, d&apos;interagir et de valider ses compétences techniques.
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">
              Conçue pour répondre aux plus hauts standards de traçabilité (SCORM 1.2, HTML5 autonome pour serveurs d&apos;entreprise), la plateforme <strong>elearning.boity</strong> offre une maîtrise technique complète de la création à l&apos;exportation.
            </p>
          </div>

          {/* Piliers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <Film className="w-8 h-8 text-[#0B4F9C] mb-3" />
              <h3 className="font-bold text-slate-900 text-sm mb-2">Excellence Audiovisuelle</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Prise de vue 4K, étalonnage cinéma et ingénierie du son pour une transmission pédagogique percutante.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <Award className="w-8 h-8 text-[#EE9B00] mb-3" />
              <h3 className="font-bold text-slate-900 text-sm mb-2">Pédagogie Interactive</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Points sensibles sur l&apos;image, embranchements scénarisés et quiz minutés pour un ancrage mémoriel optimal.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <CheckCircle className="w-8 h-8 text-emerald-600 mb-3" />
              <h3 className="font-bold text-slate-900 text-sm mb-2">Interopérabilité LMS</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Exports normalisés SCORM 1.2 et archives autonomes prêtes pour tout intranet d&apos;entreprise.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center pt-6">
            <Link href="/formations">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Explorer les modules de formation
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
