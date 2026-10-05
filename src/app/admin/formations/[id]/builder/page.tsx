'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { BrandLogo } from '@/components/ui/BrandLogo';
import type { Formation, Chapitre, Sequence, Video, Interaction, InteractionType } from '@/lib/types/elearning';
import {
  ArrowLeft,
  Play,
  Pause,
  Plus,
  Trash2,
  Save,
  UploadCloud,
  Layers,
  Settings2,
  Clock,
  HelpCircle,
  CheckCircle2,
  ExternalLink,
  Archive,
  Eye,
  Sliders,
  Sparkles,
} from 'lucide-react';

export default function CourseBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const formationId = params?.id as string;

  const videoRef = useRef<HTMLVideoElement>(null);

  // Données de la formation
  const [formation, setFormation] = useState<Formation | null>(null);
  const [chapters, setChapters] = useState<Chapitre[]>([]);
  const [selectedSequence, setSelectedSequence] = useState<Sequence | null>(null);
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [selectedInteraction, setSelectedInteraction] = useState<Interaction | null>(null);

  // État du lecteur / timeline dans le builder
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Charger la formation et ses composants
  useEffect(() => {
    async function loadData() {
      if (!formationId) return;

      const { data: form } = await supabase
        .from('formations')
        .select('*')
        .eq('id', formationId)
        .single();

      if (form) setFormation(form as Formation);

      const { data: chaps } = await supabase
        .from('chapitres')
        .select(`
          *,
          sequences (
            *,
            videos (*)
          )
        `)
        .eq('formation_id', formationId)
        .order('order_index', { ascending: true });

      if (chaps && chaps.length > 0) {
        const typedChaps = chaps as Chapitre[];
        setChapters(typedChaps);
        const firstSeq = typedChaps[0]?.sequences?.[0];
        if (firstSeq) {
          setSelectedSequence(firstSeq);
          const firstVid = firstSeq.videos?.[0];
          if (firstVid) {
            setActiveVideo(firstVid);
            const { data: inters } = await supabase
              .from('interactions')
              .select('*')
              .eq('video_id', firstVid.id)
              .order('start_time', { ascending: true });
            if (inters) setInteractions(inters as Interaction[]);
          }
        }
      }
    }
    loadData();
  }, [formationId]);

  // Synchronisation temporelle sur video.currentTime
  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const seekTo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Ajout d'un chapitre
  const handleAddChapter = async () => {
    if (!formation) return;
    const newOrder = chapters.length + 1;
    const { data: newChap } = await supabase
      .from('chapitres')
      .insert({
        formation_id: formation.id,
        title: `Chapitre ${newOrder} : Nouveau Chapitre`,
        order_index: newOrder,
      })
      .select()
      .single();

    if (newChap) {
      setChapters((prev) => [...prev, { ...(newChap as Chapitre), sequences: [] }]);
    }
  };

  // Ajout d'une séquence
  const handleAddSequence = async (chapterId: string) => {
    const chap = chapters.find((c) => c.id === chapterId);
    const order = (chap?.sequences?.length || 0) + 1;

    const { data: newSeq } = await supabase
      .from('sequences')
      .insert({
        chapitre_id: chapterId,
        title: `Séquence ${order}`,
        order_index: order,
      })
      .select()
      .single();

    if (newSeq) {
      // Créer automatiquement une vidéo par défaut pointant sur l'échantillon
      const { data: newVid } = await supabase
        .from('videos')
        .insert({
          sequence_id: newSeq.id,
          title: `Vidéo ${newSeq.title}`,
          video_url: '/samples/formation-sample.mp4',
          duration_seconds: 180,
        })
        .select()
        .single();

      const seqWithVid = {
        ...(newSeq as Sequence),
        videos: newVid ? [newVid as Video] : [],
      };

      setChapters((prev) =>
        prev.map((c) =>
          c.id === chapterId ? { ...c, sequences: [...(c.sequences || []), seqWithVid] } : c
        )
      );

      setSelectedSequence(seqWithVid);
      if (newVid) {
        setActiveVideo(newVid as Video);
        setInteractions([]);
      }
    }
  };

  // Sélection d'une séquence
  const handleSelectSeq = async (seq: Sequence) => {
    setSelectedSequence(seq);
    let vid = seq.videos?.[0];
    if (!vid) {
      // Créer une vidéo par défaut si vide
      const { data: createdVid } = await supabase
        .from('videos')
        .insert({
          sequence_id: seq.id,
          title: seq.title,
          video_url: '/samples/formation-sample.mp4',
          duration_seconds: 180,
        })
        .select()
        .single();
      vid = createdVid as Video;
    }

    if (vid) {
      setActiveVideo(vid);
      const { data: inters } = await supabase
        .from('interactions')
        .select('*')
        .eq('video_id', vid.id)
        .order('start_time', { ascending: true });
      setInteractions((inters as Interaction[]) || []);
      setSelectedInteraction(null);
    }
  };

  // Ajout d'une interaction au timestamp courant
  const handleAddInteraction = async (type: InteractionType = 'HOTSPOT') => {
    if (!activeVideo) return;

    const start = Math.round(currentTime);
    const end = Math.min(Math.round(duration), start + 8);

    const newInter: Partial<Interaction> = {
      video_id: activeVideo.id,
      type,
      start_time: start,
      end_time: end,
      position_x: 50,
      position_y: 50,
      title: `Interaction ${type}`,
      content_json: { label: 'Découvrir', text: 'Point clé interactif Boity Studio' },
      action_json: { type: 'open_modal', modal_body: 'Information pédagogique interactive.' },
      is_pause_required: type === 'QUIZ',
      order_index: interactions.length + 1,
    };

    const { data: created } = await supabase
      .from('interactions')
      .insert(newInter)
      .select()
      .single();

    if (created) {
      const typed = created as Interaction;
      setInteractions((prev) => [...prev, typed]);
      setSelectedInteraction(typed);
    }
  };

  // Mise à jour de l'interaction sélectionnée
  const handleUpdateSelected = async (updates: Partial<Interaction>) => {
    if (!selectedInteraction) return;
    const updated = { ...selectedInteraction, ...updates };
    setSelectedInteraction(updated);
    setInteractions((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));

    await supabase
      .from('interactions')
      .update(updates)
      .eq('id', updated.id);
  };

  // Suppression de l'interaction
  const handleDeleteSelected = async () => {
    if (!selectedInteraction) return;
    await supabase.from('interactions').delete().eq('id', selectedInteraction.id);
    setInteractions((prev) => prev.filter((i) => i.id !== selectedInteraction.id));
    setSelectedInteraction(null);
  };

  // Sauvegarde globale de la formation
  const handleSave = async () => {
    if (!formation) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await supabase
        .from('formations')
        .update({
          title: formation.title,
          description: formation.description,
          passing_score: formation.passing_score,
          updated_at: new Date().toISOString(),
        })
        .eq('id', formation.id);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Publication de la formation
  const handlePublish = async () => {
    if (!formation) return;
    await supabase
      .from('formations')
      .update({
        status: 'publiee',
        published_at: new Date().toISOString(),
      })
      .eq('id', formation.id);

    setFormation((prev) => (prev ? { ...prev, status: 'publiee' } : null));
  };

  const formatSecs = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Interactions actives à l'instant t
  const activeAtTime = interactions.filter(
    (i) => currentTime >= i.start_time && currentTime <= i.end_time
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col select-none text-slate-900">
      {/* BARRE SUPÉRIEURE DU BUILDER */}
      <header className="h-16 px-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 z-30 shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/formations"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Formations</span>
          </Link>
          <div className="h-4 w-px bg-slate-800" />
          <BrandLogo variant="symbol" size="sm" href="" />
          <div>
            <h1 className="text-sm font-bold text-white line-clamp-1">
              {formation?.title || 'Éditeur de formation'}
            </h1>
            <p className="text-[11px] text-[#EE9B00] font-semibold">
              Mode Studio Builder • v{formation?.current_version || '1.0'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={formation?.status === 'publiee' ? 'publiee' : 'brouillon'} size="sm">
            {formation?.status || 'Brouillon'}
          </Badge>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            isLoading={isSaving}
            leftIcon={<Save className="w-3.5 h-3.5 text-[#EE9B00]" />}
          >
            {saveSuccess ? 'Enregistré !' : 'Enregistrer'}
          </Button>

          {formation?.status !== 'publiee' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePublish}
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
            >
              Publier
            </Button>
          )}

          <Link href={`/app/formation/${formationId}/player`} target="_blank">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Eye className="w-3.5 h-3.5" />}
            >
              Prévisualiser
            </Button>
          </Link>
        </div>
      </header>

      {/* ZONE CENTRALE DU BUILDER (3 COLONNES) */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* COLONNE GAUCHE : ARBORESCENCE (Section 25) */}
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <span className="text-xs font-bold uppercase text-[#0B4F9C] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Chapitres &amp; Séquences</span>
            </span>
            <button
              onClick={handleAddChapter}
              className="p-1 rounded bg-[#0B4F9C] text-white hover:bg-[#093E7B] transition-colors"
              title="Ajouter un chapitre"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {chapters.map((chap, cIdx) => (
              <div key={chap.id} className="border border-slate-200 rounded-xl p-3 bg-slate-50/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 line-clamp-1">
                    {cIdx + 1}. {chap.title}
                  </span>
                  <button
                    onClick={() => handleAddSequence(chap.id)}
                    className="p-1 text-slate-400 hover:text-[#0B4F9C]"
                    title="Ajouter une séquence"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-1">
                  {chap.sequences?.map((seq, sIdx) => {
                    const isSelected = seq.id === selectedSequence?.id;
                    return (
                      <button
                        key={seq.id}
                        onClick={() => handleSelectSeq(seq)}
                        className={`w-full text-left p-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-[#0B4F9C] text-white font-bold shadow-xs'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate">
                          {cIdx + 1}.{sIdx + 1} {seq.title}
                        </span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#EE9B00]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ZONE CENTRALE : CANVAS PRÉVISUALISATION VIDÉO (Section 25) */}
        <main className="flex-1 bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
            {activeVideo ? (
              <video
                ref={videoRef}
                src={activeVideo.video_url}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={() => {
                  if (videoRef.current) setDuration(videoRef.current.duration);
                }}
                className="w-full h-full object-contain cursor-pointer"
                onClick={togglePlay}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                Aucune vidéo assignée à cette séquence.
              </div>
            )}

            {/* OVERLAY DES INTERACTIONS SUR LE CANVAS */}
            <div className="absolute inset-0 pointer-events-none">
              {activeAtTime.map((inter) => {
                const isSel = selectedInteraction?.id === inter.id;
                const x = inter.position_x ?? 50;
                const y = inter.position_y ?? 50;

                return (
                  <div
                    key={inter.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedInteraction(inter);
                    }}
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    className={`absolute pointer-events-auto cursor-pointer transition-all ${
                      isSel ? 'ring-4 ring-[#EE9B00] scale-110' : 'hover:scale-105'
                    }`}
                  >
                    {inter.type === 'HOTSPOT' && (
                      <div className="w-10 h-10 rounded-full bg-[#EE9B00] text-slate-950 font-bold flex items-center justify-center shadow-lg">
                        <HelpCircle className="w-5 h-5" />
                      </div>
                    )}

                    {inter.type === 'BUTTON' && (
                      <div className="px-4 py-2 bg-[#EE9B00] text-slate-950 font-bold rounded-lg shadow-lg text-xs">
                        {inter.title || 'Bouton'}
                      </div>
                    )}

                    {inter.type === 'QUIZ' && (
                      <div className="px-4 py-2 bg-[#0B4F9C] text-white font-bold rounded-lg shadow-lg text-xs flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#EE9B00]" />
                        <span>{inter.title || 'Quiz'}</span>
                      </div>
                    )}

                    {inter.type === 'CTA' && (
                      <div className="px-4 py-2 bg-white text-[#0B4F9C] border-2 border-[#0B4F9C] font-bold rounded-lg shadow-lg text-xs">
                        {inter.title || 'CTA'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        {/* COLONNE DROITE : INSPECTEUR DE PROPRIÉTÉS (Section 25) */}
        <aside className="w-80 bg-white border-l border-slate-200 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <span className="text-xs font-bold uppercase text-[#0B4F9C] flex items-center gap-1.5">
              <Settings2 className="w-3.5 h-3.5" />
              <span>Propriétés</span>
            </span>
            {selectedInteraction && (
              <button
                onClick={handleDeleteSelected}
                className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                title="Supprimer l'interaction"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {selectedInteraction ? (
              <>
                <Input
                  label="Titre / Identifiant"
                  value={selectedInteraction.title || ''}
                  onChange={(e) => handleUpdateSelected({ title: e.target.value })}
                />

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Type d&apos;interaction
                  </label>
                  <select
                    value={selectedInteraction.type}
                    onChange={(e) =>
                      handleUpdateSelected({ type: e.target.value as InteractionType })
                    }
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:ring-[#EE9B00]"
                  >
                    <option value="HOTSPOT">HOTSPOT (Point d&apos;intérêt)</option>
                    <option value="BUTTON">BUTTON (Bouton interactif)</option>
                    <option value="QUIZ">QUIZ (Évaluation synchronisée)</option>
                    <option value="CTA">CTA (Appel à l&apos;action)</option>
                    <option value="INFO">INFO (Fenêtre pédagogique)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Début (sec)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={selectedInteraction.start_time}
                      onChange={(e) =>
                        handleUpdateSelected({ start_time: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Fin (sec)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={selectedInteraction.end_time}
                      onChange={(e) =>
                        handleUpdateSelected({ end_time: parseFloat(e.target.value) || 5 })
                      }
                      className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Position X (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={selectedInteraction.position_x || 50}
                      onChange={(e) =>
                        handleUpdateSelected({ position_x: parseFloat(e.target.value) || 50 })
                      }
                      className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Position Y (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={selectedInteraction.position_y || 50}
                      onChange={(e) =>
                        handleUpdateSelected({ position_y: parseFloat(e.target.value) || 50 })
                      }
                      className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="block text-xs font-semibold text-slate-800">
                      Pause obligatoire
                    </span>
                    <span className="text-[10px] text-slate-400">Met la vidéo en pause</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedInteraction.is_pause_required}
                    onChange={(e) =>
                      handleUpdateSelected({ is_pause_required: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-[#EE9B00] focus:ring-[#EE9B00]"
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-10 text-slate-400 text-xs">
                <Sliders className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p>Cliquez sur une interaction pour modifier ses propriétés.</p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ZONE BASSE : TIMELINE INTERACTIVE (Section 15) */}
      <footer className="h-44 bg-slate-900 border-t border-slate-800 p-4 flex flex-col shrink-0 select-none text-white">
        {/* Barre d'outils Timeline */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-1.5 rounded-full bg-[#EE9B00] text-slate-950 font-bold hover:bg-[#D97706] transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>
            <span className="font-mono text-xs text-[#EE9B00]">
              {formatSecs(currentTime)} / {formatSecs(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Ajouter au timestamp :</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddInteraction('HOTSPOT')}
              className="text-xs py-1 px-2.5 text-white border-slate-700 hover:bg-slate-800"
            >
              + Hotspot
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddInteraction('BUTTON')}
              className="text-xs py-1 px-2.5 text-white border-slate-700 hover:bg-slate-800"
            >
              + Bouton
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddInteraction('QUIZ')}
              className="text-xs py-1 px-2.5 text-white border-slate-700 hover:bg-slate-800"
            >
              + Quiz
            </Button>
          </div>
        </div>

        {/* PISTE TIMELINE AVEC MARQUEURS D'INTERACTIONS */}
        <div className="flex-1 relative mt-3 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col justify-center px-4">
          {/* Graticule des temps */}
          <div className="absolute top-1 inset-x-4 flex justify-between text-[9px] font-mono text-slate-600 pointer-events-none">
            <span>00:00</span>
            <span>{formatSecs(duration * 0.25)}</span>
            <span>{formatSecs(duration * 0.5)}</span>
            <span>{formatSecs(duration * 0.75)}</span>
            <span>{formatSecs(duration)}</span>
          </div>

          {/* Curseur de lecture vertical */}
          <div
            style={{ left: `${(currentTime / (duration || 1)) * 100}%` }}
            className="absolute top-0 bottom-0 w-0.5 bg-[#EE9B00] shadow-[0_0_8px_#EE9B00] pointer-events-none z-20"
          />

          {/* Piste des blocs d'interaction */}
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = Math.max(0, Math.min(1, clickX / rect.width));
              seekTo(ratio * duration);
            }}
            className="relative h-10 w-full bg-slate-900/80 rounded-lg cursor-pointer flex items-center"
          >
            {interactions.map((inter) => {
              const leftPct = (inter.start_time / (duration || 1)) * 100;
              const widthPct = Math.max(
                2,
                ((inter.end_time - inter.start_time) / (duration || 1)) * 100
              );
              const isSel = selectedInteraction?.id === inter.id;

              return (
                <div
                  key={inter.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedInteraction(inter);
                    seekTo(inter.start_time);
                  }}
                  style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                  className={`absolute h-7 rounded-md px-2 flex items-center text-[10px] font-bold truncate transition-all ${
                    isSel
                      ? 'bg-[#EE9B00] text-slate-950 ring-2 ring-white shadow-md z-10'
                      : 'bg-[#0B4F9C] text-white hover:bg-[#093E7B]'
                  }`}
                  title={`${inter.title || inter.type} (${formatSecs(inter.start_time)} - ${formatSecs(inter.end_time)})`}
                >
                  <span className="truncate">{inter.title || inter.type}</span>
                </div>
              );
            })}
          </div>
        </div>
      </footer>
    </div>
  );
}
