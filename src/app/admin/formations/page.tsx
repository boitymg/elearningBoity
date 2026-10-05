'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { Formation } from '@/lib/types/elearning';
import {
  PlusCircle,
  Play,
  Wrench,
  Download,
  Archive,
  FileCode,
  ExternalLink,
  Trash2,
} from 'lucide-react';

export default function AdminFormationsPage() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFormations() {
      try {
        const { data, error } = await supabase
          .from('formations')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) setFormations(data as Formation[]);
      } catch (err) {
        console.error('Erreur chargement formations:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFormations();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#0B4F9C]">
            BOITY STUDIO • FORMATIONS
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Gestion des Formations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Créez, éditez sur la timeline et exportez vers HTML5 autonome ou SCORM 1.2
          </p>
        </div>

        <Link href="/admin/formations/new">
          <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Nouvelle formation
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-xs divide-y divide-slate-100">
            <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-3.5">Formation</th>
                <th className="px-6 py-3.5">Type</th>
                <th className="px-6 py-3.5">Version</th>
                <th className="px-6 py-3.5">Seuil</th>
                <th className="px-6 py-3.5">Statut</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {formations.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 text-sm">{f.title}</p>
                    <p className="text-[11px] text-slate-400 font-mono">/{f.slug}</p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={f.type === 'TYPE_3' ? 'type3' : 'type2'} size="sm">
                      {f.type}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-800">
                    v{f.current_version}
                  </td>
                  <td className="px-6 py-4">
                    {f.type === 'TYPE_3' ? (
                      <span className="font-bold text-[#EE9B00]">{f.passing_score}%</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={f.status === 'publiee' ? 'publiee' : 'brouillon'} size="sm">
                      {f.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/formations/${f.id}/builder`}>
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<Wrench className="w-3.5 h-3.5" />}
                        >
                          Éditeur Timeline
                        </Button>
                      </Link>

                      <Link href={`/app/formation/${f.id}/player`} target="_blank">
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Play className="w-3.5 h-3.5" />}
                        >
                          Aperçu
                        </Button>
                      </Link>
                    </div>
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
