'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  Film,
  UploadCloud,
  FileVideo,
  FileImage,
  FileAudio,
  FileText,
  Clock,
  HardDrive,
  CheckCircle,
} from 'lucide-react';

interface MediaAsset {
  id: string;
  file_name: string;
  file_path: string;
  file_url: string;
  mime_type: string;
  file_size_bytes: number;
  duration_seconds?: number | null;
  created_at: string;
}

export default function AdminMediasPage() {
  const [medias, setMedias] = useState<MediaAsset[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    async function loadMedias() {
      const { data } = await supabase
        .from('media_assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        setMedias(data as MediaAsset[]);
      } else {
        // Fallback avec les assets locaux pré-enregistrés
        setMedias([
          {
            id: 'sample-1',
            file_name: 'formation-sample.mp4',
            file_path: 'videos/formation-sample.mp4',
            file_url: '/samples/formation-sample.mp4',
            mime_type: 'video/mp4',
            file_size_bytes: 137117451,
            duration_seconds: 420,
            created_at: new Date().toISOString(),
          },
          {
            id: 'sample-2',
            file_name: 'logo-boity.png',
            file_path: 'images/logo-boity.png',
            file_url: '/brand/logo-boity.png',
            mime_type: 'image/png',
            file_size_bytes: 412961,
            created_at: new Date().toISOString(),
          },
        ]);
      }
    }
    loadMedias();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadSuccess(false);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `uploads/${Date.now()}-${file.name}`;

      // Upload Supabase Storage
      const { data, error } = await supabase.storage
        .from('videos')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (!error) {
        const { data: publicUrlData } = supabase.storage
          .from('videos')
          .getPublicUrl(filePath);

        // Enregistrement dans media_assets
        const { data: assetData } = await supabase
          .from('media_assets')
          .insert({
            file_name: file.name,
            file_path: filePath,
            file_url: publicUrlData.publicUrl,
            mime_type: file.type || 'application/octet-stream',
            file_size_bytes: file.size,
          })
          .select()
          .single();

        if (assetData) {
          setMedias((prev) => [assetData as MediaAsset, ...prev]);
        }
        setUploadSuccess(true);
      }
    } catch (err) {
      console.error('Erreur upload média:', err);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
    return `${(bytes / 1024).toFixed(1)} Ko`;
  };

  const getMediaIcon = (mime: string) => {
    if (mime.startsWith('video/')) return <FileVideo className="w-5 h-5 text-[#EE9B00]" />;
    if (mime.startsWith('image/')) return <FileImage className="w-5 h-5 text-[#0B4F9C]" />;
    if (mime.startsWith('audio/')) return <FileAudio className="w-5 h-5 text-indigo-500" />;
    return <FileText className="w-5 h-5 text-slate-500" />;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#0B4F9C]">
            BOITY STUDIO • MÉDIATHÈQUE
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Gestion des Médias &amp; Vidéos
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Formats pris en charge : MP4, WebM, JPG, PNG, WEBP, MP3, WAV, PDF
          </p>
        </div>

        <div>
          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#EE9B00] text-slate-950 font-bold hover:bg-[#D97706] text-sm shadow-sm transition-colors">
            <UploadCloud className="w-4 h-4" />
            <span>{uploading ? 'Téléversement en cours...' : 'Importer un média'}</span>
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              accept="video/*,image/*,audio/*,application/pdf"
            />
          </label>
        </div>
      </div>

      {uploadSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Fichier téléversé avec succès dans le stockage sécurisé Boity Studio !</span>
        </div>
      )}

      {/* Grille des Médias */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-xs divide-y divide-slate-100">
            <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-3.5">Fichier</th>
                <th className="px-6 py-3.5">Type MIME</th>
                <th className="px-6 py-3.5">Taille</th>
                <th className="px-6 py-3.5">Durée</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5 text-right">Lien</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {medias.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      {getMediaIcon(m.mime_type)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{m.file_name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{m.file_path}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-[11px] text-slate-600">
                    {m.mime_type}
                  </td>
                  <td className="px-6 py-4 font-mono">
                    {formatFileSize(m.file_size_bytes)}
                  </td>
                  <td className="px-6 py-4">
                    {m.duration_seconds ? `${Math.round(m.duration_seconds)}s` : '—'}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(m.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <a
                      href={m.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-[#0B4F9C] hover:underline"
                    >
                      Ouvrir
                    </a>
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
