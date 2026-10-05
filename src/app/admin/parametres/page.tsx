'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Save, CheckCircle2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const [platformName, setPlatformName] = useState('elearning.boity');
  const [company, setCompany] = useState('BOITY STUDIO');
  const [supportEmail, setSupportEmail] = useState('contact@boity.mg');
  const [defaultPassingScore, setDefaultPassingScore] = useState(70);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto w-full space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#0B4F9C]">
          BOITY STUDIO • CONFIGURATION
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
          Paramètres du Système
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configuration générale de la plateforme elearning.boity et conformité SCORM 1.2
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Paramètres enregistrés avec succès !</span>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase text-[#0B4F9C]">
              Identité de Marque
            </h2>

            <Input
              label="Nom de la plateforme"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              required
            />

            <Input
              label="Entreprise propriétaire"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
            />

            <Input
              label="Email support & technique"
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              required
            />
          </div>

          <div className="pt-6 border-t border-slate-100 space-y-4">
            <h2 className="text-sm font-bold uppercase text-[#EE9B00]">
              Moteur Pédagogique &amp; SCORM
            </h2>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Seuil de réussite par défaut (%)
              </label>
              <input
                type="number"
                min="10"
                max="100"
                value={defaultPassingScore}
                onChange={(e) => setDefaultPassingScore(parseInt(e.target.value) || 70)}
                className="w-32 p-2.5 rounded-lg border border-slate-300 text-sm font-bold"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              rightIcon={<Save className="w-4 h-4" />}
            >
              Enregistrer les modifications
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
