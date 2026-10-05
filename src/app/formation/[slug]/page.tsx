'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthContext';
import type { Formation, Chapitre } from '@/lib/types/elearning';
import {
  Clock,
  Play,
  Award,
  CheckCircle,
  FileCode,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { user } = useAuth();

  const [formation, setFormation] = useState<Formation | null>(null);
  const [chapters, setChapters] = useState<Chapitre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourse() {
      if (!slug) return;
      try {
        const { data: form, error: formError } = await supabase
          .from('formations')
          .select('*')
          .eq('slug', slug)
          .single();

        if (form && !formError) {
          setFormation(form as Formation);

          // Charger les chapitres et séquences
          const { data: chaps } = await supabase
            .from('chapitres')
            .select(`
              *,
              sequences (*)
            `)
            .eq('formation_id', form.id)
            .order('order_index', { ascending: true });

          if (chaps) setChapters(chaps as Chapitre[]);
        }
      } catch (err) {
        console.error('Erreur chargement formation:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCourse();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
        <PublicNavbar />
        <div className="max-w-4xl mx-auto p-12 text-center text-slate-500">
          Chargement de la formation...
        </div>
      </div>
    );
  }

  if (!formation) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
        <PublicNavbar />
        <div className="max-w-md mx-auto p-12 text-center">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Formation introuvable</h2>
          <p className="text-sm text-slate-500 mb-6">Le module demandé n&apos;existe pas ou a été déplacé.</p>
          <Link href="/formations">
            <Button variant="primary">Retour au catalogue</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleStartCourse = () => {
    if (user) {
      router.push(`/app/formation/${formation.id}/player`);
    } else {
      router.push(`/connexion?redirect=/app/formation/${formation.id}/player`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <PublicNavbar />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Banner */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-5 sm:p-8 shadow-sm mb-8 grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
            <div className="md:col-span-7 space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant={formation.type === 'TYPE_3' ? 'type3' : 'type2'}>
                  {formation.type === 'TYPE_3' ? 'Type 3 • Avec Évaluation' : 'Type 2 • Vidéo Interactive'}
                </Badge>
                <span className="text-xs font-semibold text-slate-400">
                  Version {formation.current_version}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                {formation.title}
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {formation.description || 'Module interactif développé par Boity Studio.'}
              </p>

              {/* Meta bar */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-6 pt-2 text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5 text-[#0B4F9C]">
                  <Clock className="w-4 h-4" />
                  <span>Durée : {Math.round(formation.duration_seconds / 60)} min</span>
                </span>
                {formation.type === 'TYPE_3' && (
                  <span className="flex items-center gap-1.5 text-[#EE9B00]">
                    <Award className="w-4 h-4" />
                    <span>Seuil : {formation.passing_score}%</span>
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>Compatible SCORM 1.2</span>
                </span>
              </div>

              <div className="pt-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleStartCourse}
                  leftIcon={<Play className="w-4 h-4 fill-current" />}
                  className="w-full sm:w-auto"
                >
                  Accéder au module interactif
                </Button>
              </div>
            </div>

            {/* Thumbnail */}
            <div className="md:col-span-5 relative aspect-video bg-slate-900 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg border border-slate-200">
              <Image
                src={formation.thumbnail_url || '/brand/logo-boity.png'}
                alt={formation.title}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Programme Pédagogique */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-5 sm:p-8 shadow-sm">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#0B4F9C]" />
              <span>Programme &amp; Séquences interactives</span>
            </h2>

            <div className="space-y-4">
              {chapters.map((ch, idx) => (
                <div key={ch.id} className="border border-slate-200/80 rounded-2xl p-4 sm:p-5 bg-slate-50/40">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-[#0B4F9C] text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm">{ch.title}</h3>
                    </div>
                    <span className="text-xs text-slate-400 font-medium shrink-0">
                      {ch.sequences?.length || 0} séquence(s)
                    </span>
                  </div>

                  {ch.description && (
                    <p className="text-xs text-slate-500 mb-3 sm:ml-10">{ch.description}</p>
                  )}

                  {ch.sequences && ch.sequences.length > 0 && (
                    <div className="sm:ml-10 space-y-2 border-t border-slate-200/60 pt-3">
                      {ch.sequences.map((seq, seqIdx) => (
                        <div
                          key={seq.id}
                          className="flex items-center justify-between text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-100"
                        >
                          <div className="flex items-center gap-2">
                            <Play className="w-3 h-3 text-[#EE9B00] fill-current" />
                            <span>
                              {idx + 1}.{seqIdx + 1} {seq.title}
                            </span>
                          </div>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase">
                            Vidéo interactive
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
