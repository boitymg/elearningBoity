'use client';

import React, { useState } from 'react';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <PublicNavbar />

      <main className="flex-1 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0B4F9C]">
              Boity Studio • Support &amp; Projets
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
              Contactez Boity Studio
            </h1>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Une question sur nos modules interactifs ou un projet e-learning sur-mesure ? Nos équipes vous répondent.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Coordonnées */}
            <div className="md:col-span-5 bg-white rounded-3xl p-8 border border-slate-200 shadow-xs space-y-6">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Coordonnées officielles
              </h2>

              <div className="space-y-4 text-xs text-slate-700">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0B4F9C] flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-semibold text-slate-400">Email</span>
                    <a href="mailto:contact@boity.mg" className="font-bold text-slate-900 hover:text-[#0B4F9C]">
                      contact@boity.mg
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#EE9B00] flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-semibold text-slate-400">Siège</span>
                    <span className="font-bold text-slate-900">
                      BOITY STUDIO • Antananarivo, Madagascar
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulaire */}
            <div className="md:col-span-7 bg-white rounded-3xl p-8 border border-slate-200 shadow-xs">
              {submitted ? (
                <div className="text-center py-8 space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                  <h3 className="text-lg font-bold text-slate-900">Message envoyé !</h3>
                  <p className="text-xs text-slate-600">
                    Merci pour votre message. Notre équipe pédagogique vous recontactera sous 24h ouvrées.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input label="Votre Nom complet" placeholder="Andrianina Boity" required />
                  <Input label="Adresse email" type="email" placeholder="votre.email@entreprise.com" required />
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                      Votre Message
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Décrivez votre besoin e-learning ou votre demande d'accompagnement..."
                      className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#EE9B00] focus:border-[#EE9B00]"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    rightIcon={<Send className="w-4 h-4" />}
                  >
                    Envoyer ma demande
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
