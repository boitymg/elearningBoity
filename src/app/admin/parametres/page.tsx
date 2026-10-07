'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Save, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function AdminSettingsPage() {
  const [platformName, setPlatformName] = useState('elearning.boity');
  const [company, setCompany] = useState('BOITY STUDIO');
  const [supportEmail, setSupportEmail] = useState('boity.mg@gmail.com');
  const [defaultPassingScore, setDefaultPassingScore] = useState(70);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Charger les paramètres depuis Supabase en temps réel
  useEffect(() => {
    async function loadSettings() {
      try {
        const { data, error } = await supabase.from('settings').select('*');
        if (error) {
          console.warn('Erreur chargement paramètres:', error);
          return;
        }

        if (data && data.length > 0) {
          const platformSetting = data.find((s) => s.key === 'platform')?.value;
          if (platformSetting) {
            if (platformSetting.name) setPlatformName(platformSetting.name);
            if (platformSetting.company) setCompany(platformSetting.company);
            if (platformSetting.support_email) setSupportEmail(platformSetting.support_email);
          }

          const scormSetting = data.find((s) => s.key === 'scorm_default')?.value;
          if (scormSetting?.mastery_score) {
            setDefaultPassingScore(scormSetting.mastery_score);
          }
        }
      } catch (err) {
        console.error('Erreur chargement paramètres:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  // Enregistrer immédiatement dans Supabase (synchronisation temps réel sans push)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setErrorMessage(null);

    try {
      const now = new Date().toISOString();

      // 1. Sauvegarde des infos de plateforme
      const { error: err1 } = await supabase.from('settings').upsert({
        key: 'platform',
        value: {
          name: platformName.trim(),
          company: company.trim(),
          support_email: supportEmail.trim(),
          version: '1.0.0',
        },
        updated_at: now,
      });

      // 2. Sauvegarde des règles SCORM
      const { error: err2 } = await supabase.from('settings').upsert({
        key: 'scorm_default',
        value: {
          schema_version: '1.2',
          mastery_score: defaultPassingScore,
          allow_review: true,
        },
        updated_at: now,
      });

      if (err1 || err2) {
        throw new Error(err1?.message || err2?.message || 'Erreur lors de la sauvegarde');
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 5000);
    } catch (err: unknown) {
      console.error('Erreur sauvegarde paramètres:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'Une erreur est survenue lors de la synchronisation.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
      <div className="flex items-center justify-between">
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

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <RefreshCw className="w-4 h-4 animate-spin text-[#EE9B00]" />
            <span>Chargement...</span>
          </div>
        )}
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">
            Paramètres enregistrés et synchronisés avec succès en temps réel !
          </span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-5 sm:p-8 shadow-xs">
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
              disabled={loading || saving}
            />

            <Input
              label="Entreprise propriétaire"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
              disabled={loading || saving}
            />

            <Input
              label="Email support & technique"
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              required
              disabled={loading || saving}
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
                disabled={loading || saving}
                className="w-32 p-2.5 rounded-lg border border-slate-300 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#EE9B00]"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              disabled={loading || saving}
              leftIcon={saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : undefined}
              rightIcon={!saving ? <Save className="w-4 h-4" /> : undefined}
            >
              {saving ? 'Enregistrement en direct...' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
