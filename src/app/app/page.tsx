'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { CourseCard } from '@/components/ui/CourseCard';
import { Button } from '@/components/ui/Button';
import type { Formation, LearnerProgress } from '@/lib/types/elearning';
import { BookOpen, CheckCircle, Clock, Trophy, ArrowRight } from 'lucide-react';

export default function LearnerDashboardPage() {
  const { user, profile } = useAuth();
  const [formations, setFormations] = useState<Formation[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, LearnerProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: forms } = await supabase
          .from('formations')
          .select('*')
          .eq('status', 'publiee')
          .order('created_at', { ascending: false });

        if (forms) {
          setFormations(forms as Formation[]);
        }

        if (user) {
          const { data: prog } = await supabase
            .from('learner_progress')
            .select('*')
            .eq('user_id', user.uid);

          if (prog) {
            const map: Record<string, LearnerProgress> = {};
            prog.forEach((p) => {
              map[p.formation_id] = p as LearnerProgress;
            });
            setProgressMap(map);
          }
        }
      } catch (err) {
        console.error('Erreur chargement dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const displayName = profile?.display_name || user?.displayName || 'Apprenant';

  const inProgressCount = Object.values(progressMap).filter((p) => !p.is_completed).length;
  const completedCount = Object.values(progressMap).filter((p) => p.is_completed).length;

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      {/* Header Accueil */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Bonjour, <span className="text-[#0B4F9C]">{displayName}</span>
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Continuez votre apprentissage sur les modules interactifs Boity Studio.
        </p>
      </div>

      {/* Cartes de Synthèse Apprenant */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#EE9B00] flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">En cours</span>
            <p className="text-2xl font-black text-slate-900">{inProgressCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Validées</span>
            <p className="text-2xl font-black text-slate-900">{completedCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0B4F9C] flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Certifications</span>
            <p className="text-2xl font-black text-slate-900">{completedCount}</p>
          </div>
        </div>
      </div>

      {/* Section "Mes Formations" */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Mes formations assignées</h2>
          <p className="text-xs text-slate-500">Parcours interactifs recommandés pour votre profil</p>
        </div>
        <Link href="/app/formations">
          <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Voir tout
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
          {formations.map((f) => {
            const prog = progressMap[f.id];
            const pct = prog ? Math.round(prog.completion_percentage) : 0;
            return (
              <CourseCard
                key={f.id}
                formation={f}
                progressPercentage={pct}
                isLearnerView={true}
              />
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <p className="text-slate-600 text-sm">
            Aucune formation n&apos;est disponible pour le moment.
          </p>
        </div>
      )}
    </div>
  );
}
