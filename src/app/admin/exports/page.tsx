'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { buildHtml5PackageZip } from '@/lib/export/Html5Exporter';
import { buildScormPackageZip } from '@/lib/export/ScormExporter';
import type { Formation, ExportRecord } from '@/lib/types/elearning';
import {
  Archive,
  Download,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
} from 'lucide-react';

export default function AdminExportsPage() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [exportHistory, setExportHistory] = useState<ExportRecord[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const [formsRes, expRes] = await Promise.all([
        supabase.from('formations').select('*').order('created_at', { ascending: false }),
        supabase.from('exports').select('*').order('created_at', { ascending: false }),
      ]);

      if (formsRes.data) setFormations(formsRes.data as Formation[]);
      if (expRes.data) setExportHistory(expRes.data as ExportRecord[]);
    }
    loadData();
  }, []);

  // Déclencher un export réel
  const handleExport = async (formation: Formation, type: 'HTML5' | 'SCORM_1_2') => {
    setProcessingId(`${formation.id}-${type}`);
    setSuccessMessage(null);

    try {
      // 1. Récupérer l'arbre complet du cours (Chapitres + Séquences + Vidéos + Interactions + Quiz complets)
      const [{ data: chapters }, { data: quizzes }] = await Promise.all([
        supabase
          .from('chapitres')
          .select(`
            *,
            sequences (
              *,
              videos (
                *,
                interactions (*)
              )
            )
          `)
          .eq('formation_id', formation.id)
          .order('order_index', { ascending: true }),
        supabase
          .from('quiz')
          .select(`
            *,
            questions (
              *,
              answers (*)
            )
          `)
          .eq('formation_id', formation.id)
          .order('order_index', { ascending: true }),
      ]);

      const coursePayload = {
        formation,
        chapters: chapters || [],
        quizzes: quizzes || [],
        exported_at: new Date().toISOString(),
      };

      // 2. Générer le ZIP correspondant
      let zipBlob: Blob;
      let filename = '';

      if (type === 'HTML5') {
        zipBlob = await buildHtml5PackageZip(formation, coursePayload);
        filename = `${formation.slug}-html5-v${formation.current_version}.zip`;
      } else {
        zipBlob = await buildScormPackageZip(formation, coursePayload);
        filename = `${formation.slug}-scorm-1.2-v${formation.current_version}.zip`;
      }

      // 3. Déclencher le téléchargement dans le navigateur
      const downloadUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      // 4. Enregistrer dans la table d'audit des exports
      const { data: newRecord } = await supabase
        .from('exports')
        .insert({
          formation_id: formation.id,
          version: formation.current_version,
          type,
          status: 'completed',
          file_path: filename,
          file_size_bytes: zipBlob.size,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (newRecord) {
        setExportHistory((prev) => [newRecord as ExportRecord, ...prev]);
      }

      setSuccessMessage(
        `Package ${type === 'HTML5' ? 'HTML5 autonome' : 'SCORM 1.2'} généré et téléchargé avec succès !`
      );
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Erreur export:', err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#0B4F9C]">
          BOITY STUDIO • PACKAGES &amp; EXPORTS
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
          Centre d&apos;Exportation E-learning
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Générez des archives autonomes prêtes pour le serveur interne Jovena (HTML5) ou pour les LMS d&apos;entreprise (SCORM 1.2)
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Formations prêtes à l'export */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Formations disponibles</h2>
          <span className="text-xs text-slate-500 font-medium">
            {formations.length} module(s)
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {formations.map((f) => (
            <div
              key={f.id}
              className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={f.type === 'TYPE_3' ? 'type3' : 'type2'} size="sm">
                    {f.type}
                  </Badge>
                  <span className="text-xs font-mono font-bold text-slate-600">
                    v{f.current_version}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{f.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-1">{f.description}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport(f, 'HTML5')}
                  isLoading={processingId === `${f.id}-HTML5`}
                  leftIcon={<FileCode className="w-3.5 h-3.5 text-[#0B4F9C]" />}
                >
                  Exporter HTML5 (Type 2)
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleExport(f, 'SCORM_1_2')}
                  isLoading={processingId === `${f.id}-SCORM_1_2`}
                  leftIcon={<Archive className="w-3.5 h-3.5" />}
                >
                  Exporter SCORM 1.2 (Type 3)
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historique des exports */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">Historique des générations</h2>
        </div>

        {exportHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-xs divide-y divide-slate-100">
              <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-3.5">Fichier généré</th>
                  <th className="px-6 py-3.5">Type de package</th>
                  <th className="px-6 py-3.5">Version</th>
                  <th className="px-6 py-3.5">Statut</th>
                  <th className="px-6 py-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {exportHistory.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      {rec.file_path || 'package.zip'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={rec.type === 'SCORM_1_2' ? 'type3' : 'type2'} size="sm">
                        {rec.type}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-mono">v{rec.version}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Prêt
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(rec.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">
            Aucun package n&apos;a encore été généré.
          </div>
        )}
      </div>
    </div>
  );
}
