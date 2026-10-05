'use client';

import React, { useEffect, useState } from 'react';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { CourseCard } from '@/components/ui/CourseCard';
import { supabase } from '@/lib/supabase/client';
import type { Formation, FormationType } from '@/lib/types/elearning';
import { Search, Filter, BookOpen } from 'lucide-react';

export default function FormationsPage() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  useEffect(() => {
    async function fetchFormations() {
      try {
        const { data, error } = await supabase
          .from('formations')
          .select('*')
          .eq('status', 'publiee')
          .order('created_at', { ascending: false });

        if (!error && data) {
          setFormations(data as Formation[]);
        }
      } catch (err) {
        console.error('Erreur chargement formations:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchFormations();
  }, []);

  const filtered = formations.filter((f) => {
    const matchesSearch =
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.description && f.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === 'ALL' || f.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <PublicNavbar />

      <main className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-10 text-center sm:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0B4F9C]">
              Boity Studio • Catalogue
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">
              Modules et formations interactives
            </h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">
              Découvrez nos parcours audiovisuels certifiés, avec vidéos interactives, évaluations chronométrées et compatibilité SCORM 1.2.
            </p>
          </div>

          {/* Filtres et Recherche */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher une formation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#EE9B00] focus:border-[#EE9B00]"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <button
                onClick={() => setSelectedType('ALL')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  selectedType === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Toutes ({formations.length})
              </button>
              <button
                onClick={() => setSelectedType('TYPE_2')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  selectedType === 'TYPE_2'
                    ? 'bg-[#0B4F9C] text-white'
                    : 'bg-blue-50 text-[#0B4F9C] hover:bg-blue-100'
                }`}
              >
                Type 2 • Vidéo Interactive
              </button>
              <button
                onClick={() => setSelectedType('TYPE_3')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  selectedType === 'TYPE_3'
                    ? 'bg-[#EE9B00] text-slate-950 font-bold'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                Type 3 • Avec Évaluation
              </button>
            </div>
          </div>

          {/* Formations Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-80 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((f) => (
                <CourseCard key={f.id} formation={f} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 mb-1">
                Aucun module ne correspond à vos critères
              </h3>
              <p className="text-xs text-slate-500">
                Essayez d&apos;ajuster vos filtres de recherche.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
