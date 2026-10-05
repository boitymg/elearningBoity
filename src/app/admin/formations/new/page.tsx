'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Save, Sparkles } from 'lucide-react';

export default function NewFormationPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'TYPE_2' | 'TYPE_3'>('TYPE_3');
  const [passingScore, setPassingScore] = useState(70);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-génération du slug
  const handleTitleChange = (val: string) => {
    setTitle(val);
    const generated = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlug(generated);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug) {
      setError('Veuillez renseigner le titre et le slug de la formation.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Créer la formation
      const { data: newForm, error: formErr } = await supabase
        .from('formations')
        .insert({
          title,
          slug,
          description,
          type,
          passing_score: type === 'TYPE_3' ? passingScore : 0,
          status: 'brouillon',
          current_version: '1.0',
          created_by: user?.uid || null,
        })
        .select()
        .single();

      if (formErr || !newForm) {
        throw new Error(formErr?.message || 'Erreur lors de la création');
      }

      // 2. Créer automatiquement un premier chapitre et une séquence
      const { data: chap } = await supabase
        .from('chapitres')
        .insert({
          formation_id: newForm.id,
          title: 'Chapitre 1 : Introduction & Objectifs',
          order_index: 1,
        })
        .select()
        .single();

      if (chap) {
        await supabase.from('sequences').insert({
          chapitre_id: chap.id,
          title: '1.1 Vue d&apos;ensemble et fondamentaux',
          order_index: 1,
        });
      }

      // Rediriger vers l'éditeur de formation (Builder)
      router.push(`/admin/formations/${newForm.id}/builder`);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Erreur de création de formation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto w-full space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/formations"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux formations</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
        <div className="mb-6 pb-6 border-b border-slate-100">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#0B4F9C] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#EE9B00]" />
            <span>Création • Boity Studio</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Nouvelle formation interactive</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configurez les métadonnées de base avant de structurer la timeline et les séquences
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-6">
          <Input
            label="Titre officiel de la formation"
            placeholder="Ex : Gestion de l'exposition en vidéo haute définition"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
          />

          <Input
            label="Identifiant URL (Slug)"
            placeholder="gestion-exposition-video-hd"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            helperText="Sera utilisé dans l'URL publique de la formation."
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Description pédagogique
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Présentez les objectifs clés de ce module interactif..."
              className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#EE9B00] focus:border-[#EE9B00]"
            />
          </div>

          {/* Choix du Type (Section 7 et 8) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setType('TYPE_2')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                type === 'TYPE_2'
                  ? 'border-[#0B4F9C] bg-blue-50/50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0B4F9C] text-white uppercase mb-2">
                Type 2
              </span>
              <h3 className="font-bold text-slate-900 text-sm">Vidéo interactive sans évaluation</h3>
              <p className="text-xs text-slate-600 mt-1">
                Navigation libre, chapitres, boutons, parcours conditionnels. Export HTML5 autonome.
              </p>
            </div>

            <div
              onClick={() => setType('TYPE_3')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                type === 'TYPE_3'
                  ? 'border-[#EE9B00] bg-amber-50/40 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EE9B00] text-slate-950 uppercase mb-2">
                Type 3
              </span>
              <h3 className="font-bold text-slate-900 text-sm">Vidéo interactive avec évaluation</h3>
              <p className="text-xs text-slate-600 mt-1">
                Intègre des quiz, calcul de score, seuil de réussite et export SCORM 1.2 conforme.
              </p>
            </div>
          </div>

          {type === 'TYPE_3' && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="block text-xs font-bold text-slate-800">Seuil de réussite (%)</span>
                <span className="text-[11px] text-slate-500">
                  Pourcentage minimum requis pour valider le module SCORM 1.2
                </span>
              </div>
              <input
                type="number"
                min="1"
                max="100"
                value={passingScore}
                onChange={(e) => setPassingScore(parseInt(e.target.value) || 70)}
                className="w-20 px-3 py-1.5 rounded-lg border border-slate-300 text-center font-bold text-sm"
              />
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              rightIcon={<Save className="w-4 h-4" />}
            >
              Créer et ouvrir l&apos;Éditeur Timeline
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
