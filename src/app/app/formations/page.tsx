'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { CourseCard } from '@/components/ui/CourseCard';
import type { Formation, LearnerProgress } from '@/lib/types/elearning';
import { BookOpen } from 'lucide-react';

export default function LearnerFormationsListPage() {
  const { user } = useAuth();
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

        if (forms) setFormations(forms as Formation[]);

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
        console.error('Erreur chargement formations:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Catalogue des formations
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Tous les modules interactifs disponibles pour votre montée en compétences
        </p>
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
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">Aucune formation disponible actuellement.</p>
        </div>
      )}
    </div>
  );
}
