'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { Progress } from '@/components/ui/Progress';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { Formation, LearnerProgress, QuizAttempt } from '@/lib/types/elearning';
import { BarChart3, CheckCircle2, Clock, Play, Award } from 'lucide-react';

export default function LearnerProgressionPage() {
  const { user } = useAuth();
  const [formations, setFormations] = useState<Formation[]>([]);
  const [progressList, setProgressList] = useState<LearnerProgress[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const [formRes, progRes, quizRes] = await Promise.all([
          supabase.from('formations').select('*'),
          supabase.from('learner_progress').select('*').eq('user_id', user.uid),
          supabase.from('quiz_attempts').select('*').eq('user_id', user.uid).order('completed_at', { ascending: false }),
        ]);

        if (formRes.data) setFormations(formRes.data as Formation[]);
        if (progRes.data) setProgressList(progRes.data as LearnerProgress[]);
        if (quizRes.data) setQuizAttempts(quizRes.data as QuizAttempt[]);
      } catch (err) {
        console.error('Erreur chargement progression:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Ma progression &amp; Certifications
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Détail de votre avancement sur les modules interactifs et résultats aux évaluations Boity Studio
        </p>
      </div>

      {/* Cartes de progression par formation */}
      <div className="space-y-6 mb-12">
        <h2 className="text-base font-bold text-[#0B4F9C] uppercase tracking-wider">
          Avancement par formation
        </h2>

        {formations.map((formation) => {
          const prog = progressList.find((p) => p.formation_id === formation.id);
          const pct = prog ? Math.round(prog.completion_percentage) : 0;
          const isDone = prog?.is_completed || pct >= 95;

          return (
            <div
              key={formation.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6"
            >
              <div className="flex-1 w-full space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant={formation.type === 'TYPE_3' ? 'type3' : 'type2'} size="sm">
                    {formation.type}
                  </Badge>
                  {isDone ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Terminé
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-semibold text-[#EE9B00]">
                      <Clock className="w-3.5 h-3.5" />
                      En cours
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900">{formation.title}</h3>

                <Progress value={pct} size="md" color={isDone ? 'emerald' : 'orange'} />
              </div>

              <div className="shrink-0 w-full sm:w-auto">
                <Link href={`/app/formation/${formation.id}/player`}>
                  <Button
                    variant={isDone ? 'outline' : 'primary'}
                    size="sm"
                    className="w-full sm:w-auto"
                    leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
                  >
                    {isDone ? 'Revoir le module' : 'Reprendre la lecture'}
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Historique des Tentatives de Quiz */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-[#0B4F9C] uppercase tracking-wider">
          Historique des évaluations (Type 3)
        </h2>

        {quizAttempts.length > 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-xs">
            <table className="min-w-[550px] w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-left">Version</th>
                  <th className="px-6 py-3 text-left">Score</th>
                  <th className="px-6 py-3 text-left">Résultat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {quizAttempts.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      {new Date(att.completed_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4">v{att.formation_version}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{att.score_percentage}%</td>
                    <td className="px-6 py-4">
                      {att.is_passed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Validé
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 font-bold">
                          Échoué
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
            <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">
              Aucune tentative d&apos;évaluation enregistrée à ce jour.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
