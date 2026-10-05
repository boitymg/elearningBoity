'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { Formation } from '@/lib/types/elearning';
import {
  GraduationCap,
  CheckCircle,
  FileEdit,
  Users,
  Film,
  Award,
  TrendingUp,
  PlusCircle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [stats, setStats] = useState({
    totalFormations: 0,
    publishedFormations: 0,
    draftFormations: 0,
    type2Count: 0,
    type3Count: 0,
    totalLearners: 0,
    totalAttempts: 0,
    successRate: 85,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [formsRes, profilesRes, attemptsRes] = await Promise.all([
          supabase.from('formations').select('*').order('created_at', { ascending: false }),
          supabase.from('profiles').select('id, role', { count: 'exact' }),
          supabase.from('quiz_attempts').select('id, is_passed', { count: 'exact' }),
        ]);

        const forms = (formsRes.data as Formation[]) || [];
        setFormations(forms);

        const published = forms.filter((f) => f.status === 'publiee').length;
        const drafts = forms.filter((f) => f.status === 'brouillon').length;
        const t2 = forms.filter((f) => f.type === 'TYPE_2').length;
        const t3 = forms.filter((f) => f.type === 'TYPE_3').length;

        const learnersCount = profilesRes.count || 1;
        const attempts = attemptsRes.data || [];
        const attemptsCount = attempts.length;
        const passedAttempts = attempts.filter((a) => a.is_passed).length;
        const successRate =
          attemptsCount > 0 ? Math.round((passedAttempts / attemptsCount) * 100) : 100;

        setStats({
          totalFormations: forms.length,
          publishedFormations: published,
          draftFormations: drafts,
          type2Count: t2,
          type3Count: t3,
          totalLearners: learnersCount,
          totalAttempts: attemptsCount,
          successRate,
        });
      } catch (err) {
        console.error('Erreur chargement admin stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8">
      {/* Entête Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#0B4F9C]">
            BOITY STUDIO • Tableau de Bord
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Console de Pilotage E-learning
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestion du moteur, suivi des apprenants et statut des packages HTML5 &amp; SCORM
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/formations/new">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              Créer une formation
            </Button>
          </Link>
        </div>
      </div>

      {/* Grille d'indicateurs clés (Section 29) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase">Formations</span>
            <GraduationCap className="w-4 h-4 text-[#0B4F9C]" />
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.totalFormations}</p>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-2">
            <span className="text-emerald-600 font-bold">{stats.publishedFormations} publiées</span>
            <span>•</span>
            <span className="text-slate-400">{stats.draftFormations} brouillons</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase">Répartition Types</span>
            <Film className="w-4 h-4 text-[#EE9B00]" />
          </div>
          <div className="flex items-baseline gap-3">
            <div>
              <span className="text-xl font-black text-[#0B4F9C]">{stats.type2Count}</span>
              <span className="text-[10px] text-slate-500 font-bold ml-1">Type 2</span>
            </div>
            <span>•</span>
            <div>
              <span className="text-xl font-black text-[#EE9B00]">{stats.type3Count}</span>
              <span className="text-[10px] text-slate-500 font-bold ml-1">Type 3</span>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">Moteur interactif actif</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase">Apprenants</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.totalLearners}</p>
          <p className="mt-2 text-[11px] text-slate-500">{stats.totalAttempts} tentatives de quiz</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase">Taux de réussite</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600">{stats.successRate}%</p>
          <p className="mt-2 text-[11px] text-slate-500">Seuil moyen : 70%</p>
        </div>
      </div>

      {/* Tableau des formations récentes */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Formations du Studio Boity</h2>
          <Link href="/admin/formations" className="text-xs font-bold text-[#0B4F9C] hover:underline">
            Gérer toutes les formations
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-100">
            <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-3.5">Titre</th>
                <th className="px-6 py-3.5">Type</th>
                <th className="px-6 py-3.5">Version</th>
                <th className="px-6 py-3.5">Statut</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {formations.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{f.title}</p>
                    <p className="text-[11px] text-slate-400 font-mono">/{f.slug}</p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={f.type === 'TYPE_3' ? 'type3' : 'type2'} size="sm">
                      {f.type}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 font-mono">v{f.current_version}</td>
                  <td className="px-6 py-4">
                    <Badge variant={f.status === 'publiee' ? 'publiee' : 'brouillon'} size="sm">
                      {f.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Link href={`/admin/formations/${f.id}/builder`}>
                      <button className="px-2.5 py-1 rounded bg-[#EE9B00] text-slate-950 font-bold hover:bg-[#D97706] transition-colors text-xs">
                        Builder
                      </button>
                    </Link>
                    <Link href={`/app/formation/${f.id}/player`} target="_blank">
                      <button className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-100 transition-colors text-xs">
                        Player
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
