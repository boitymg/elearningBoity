'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import type { Formation, Chapitre, Sequence, Video, Interaction } from '@/lib/types/elearning';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Settings,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Info,
  CheckCircle,
} from 'lucide-react';

interface InteractiveVideoPlayerProps {
  formation: Formation;
  video: Video;
  chapters?: Chapitre[];
  currentSequence?: Sequence;
  interactions?: Interaction[];
  initialTime?: number;
  isQuizActive?: boolean;
  onProgressUpdate?: (currentTime: number, percentage: number) => void;
  onQuizTrigger?: (quizId?: string) => void;
  onNextSequence?: () => void;
}

export function InteractiveVideoPlayer({
  formation,
  video,
  chapters = [],
  currentSequence,
  interactions = [],
  initialTime = 0,
  isQuizActive = false,
  onProgressUpdate,
  onQuizTrigger,
  onNextSequence,
}: InteractiveVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // États du lecteur
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [activeModalInteraction, setActiveModalInteraction] = useState<Interaction | null>(null);

  // Historique des interactions déjà déclenchées pour pause automatique
  const triggeredPausesRef = useRef<Set<string>>(new Set());
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevQuizActive = useRef(false);

  // Reprendre la vidéo automatiquement quand le quiz est fermé ou validé
  useEffect(() => {
    if (prevQuizActive.current && !isQuizActive && videoRef.current) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
    prevQuizActive.current = isQuizActive;
  }, [isQuizActive]);

  // Initialisation du temps de reprise
  useEffect(() => {
    if (videoRef.current && initialTime > 0) {
      videoRef.current.currentTime = initialTime;
      setCurrentTime(initialTime);
    }
  }, [initialTime]);

  // Masquage auto des contrôles
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  // Play / Pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  // Saut de temps (+10s / -10s)
  const seekDelta = (delta: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + delta));
  };

  // Formatage mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Boucle de mise à jour basée sur video.currentTime
  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);

    // Calcul de progression
    if (duration > 0 && onProgressUpdate) {
      const percentage = Math.min(100, Math.round((time / duration) * 100));
      onProgressUpdate(time, percentage);
    }

    // Gestion des interactions actives
    interactions.forEach((interaction) => {
      const isWithinWindow = time >= interaction.start_time && time <= interaction.end_time;

      // Pause obligatoire si non encore déclenchée
      if (
        isWithinWindow &&
        interaction.is_pause_required &&
        !triggeredPausesRef.current.has(interaction.id)
      ) {
        triggeredPausesRef.current.add(interaction.id);
        videoRef.current?.pause();
        setIsPlaying(false);
        if (interaction.type === 'QUIZ' && onQuizTrigger) {
          onQuizTrigger(interaction.action_json?.quiz_id);
        } else if (['INFO', 'CHOICE', 'TEXT', 'CTA'].includes(interaction.type)) {
          setActiveModalInteraction(interaction);
        }
      }
    });
  }, [duration, interactions, onProgressUpdate, onQuizTrigger]);

  // Clic sur l'interaction
  const handleInteractionClick = (interaction: Interaction) => {
    const action = interaction.action_json;
    if (!action) return;

    if (action.type === 'jump_to_time' && action.target_time !== undefined) {
      if (videoRef.current) {
        videoRef.current.currentTime = action.target_time;
      }
    } else if (action.type === 'open_url' && action.target_url) {
      window.open(action.target_url, '_blank');
    } else if (action.type === 'open_modal') {
      setActiveModalInteraction(interaction);
    } else if (action.type === 'open_quiz' && onQuizTrigger) {
      onQuizTrigger(action.quiz_id);
    } else if (action.type === 'next_sequence' && onNextSequence) {
      onNextSequence();
    }
  };

  // Changement volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  // Toggle Plein écran
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
      setIsFullscreen(false);
    }
  };

  // Liste des interactions actuellement visibles à l'écran
  const activeInteractions = interactions.filter(
    (inter) => currentTime >= inter.start_time && currentTime <= inter.end_time
  );

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl select-none group focus:outline-none"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'k') {
          e.preventDefault();
          togglePlay();
        } else if (e.key === 'ArrowRight') {
          seekDelta(5);
        } else if (e.key === 'ArrowLeft') {
          seekDelta(-5);
        } else if (e.key === 'f') {
          toggleFullscreen();
        }
      }}
    >
      {/* Balise HTML5 Video */}
      <video
        ref={videoRef}
        src={video.video_url}
        poster={video.thumbnail_url || undefined}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            setDuration(videoRef.current.duration);
          }
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          if (onNextSequence) onNextSequence();
        }}
        onClick={togglePlay}
        className="w-full h-full object-contain cursor-pointer"
        playsInline
      />

      {/* OVERLAY D'INTERACTIONS SUR LA TIMELINE VIDÉO */}
      <div className="absolute inset-0 pointer-events-none">
        {activeInteractions.map((inter) => {
          const posX = inter.position_x ?? 50;
          const posY = inter.position_y ?? 50;

          return (
            <div
              key={inter.id}
              style={{
                left: `${posX}%`,
                top: `${posY}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className="absolute pointer-events-auto transition-all duration-200 animate-in fade-in zoom-in-95"
            >
              {inter.type === 'HOTSPOT' && (
                <button
                  onClick={() => handleInteractionClick(inter)}
                  className="relative group/hotspot flex items-center justify-center w-10 h-10 rounded-full bg-[#EE9B00] text-slate-950 shadow-lg ring-4 ring-[#EE9B00]/40 animate-pulse hover:scale-110 active:scale-95 transition-transform"
                >
                  <HelpCircle className="w-5 h-5 font-bold" />
                  {inter.title && (
                    <span className="absolute bottom-full mb-2 hidden group-hover/hotspot:block px-2.5 py-1 text-xs font-bold text-white bg-slate-900 rounded-md whitespace-nowrap shadow-md">
                      {inter.title}
                    </span>
                  )}
                </button>
              )}

              {inter.type === 'BUTTON' && (
                <button
                  onClick={() => handleInteractionClick(inter)}
                  className="px-4 py-2 bg-[#EE9B00] hover:bg-[#D97706] text-slate-950 font-bold rounded-lg shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 transition-all text-sm"
                >
                  <span>{inter.content_json?.label || inter.title || 'Découvrir'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {inter.type === 'QUIZ' && (
                <button
                  onClick={() => handleInteractionClick(inter)}
                  className="px-5 py-2.5 bg-[#0B4F9C] hover:bg-[#093E7B] text-white font-bold rounded-xl shadow-xl flex items-center gap-2.5 ring-2 ring-white/80 animate-bounce"
                >
                  <CheckCircle className="w-5 h-5 text-[#EE9B00]" />
                  <span>{inter.title || 'Lancer l&apos;Évaluation'}</span>
                </button>
              )}

              {inter.type === 'CTA' && (
                <button
                  onClick={() => handleInteractionClick(inter)}
                  className="px-4 py-2 bg-white text-[#0B4F9C] border-2 border-[#0B4F9C] hover:bg-blue-50 font-bold rounded-lg shadow-md flex items-center gap-2 text-sm"
                >
                  <span>{inter.content_json?.label || inter.title || 'En savoir plus'}</span>
                  <ExternalLink className="w-4 h-4 text-[#EE9B00]" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL POPUP POUR INTERACTIONS (INFO, CHOIX, TEXTE) */}
      {activeModalInteraction && (
        <div className="absolute inset-0 z-30 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2 text-[#0B4F9C] font-bold">
                <Info className="w-5 h-5 text-[#EE9B00]" />
                <h3 className="text-base">
                  {activeModalInteraction.title || 'Information Pédagogique'}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalInteraction(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-semibold px-2 py-1 rounded"
              >
                Fermer
              </button>
            </div>

            <div className="text-sm text-slate-700 leading-relaxed mb-6">
              {activeModalInteraction.content_json?.text ||
                activeModalInteraction.action_json?.modal_body ||
                'Contenu interactif conçu pour approfondir ce chapitre.'}
            </div>

            {/* Choix multiples interactifs s'il y a des branches */}
            {activeModalInteraction.content_json?.choices && (
              <div className="space-y-2 mb-6">
                {activeModalInteraction.content_json.choices.map((choice) => (
                  <button
                    key={choice.id}
                    onClick={() => {
                      if (choice.action.type === 'jump_to_time' && choice.action.target_time !== undefined) {
                        if (videoRef.current) videoRef.current.currentTime = choice.action.target_time;
                      }
                      setActiveModalInteraction(null);
                      if (videoRef.current) videoRef.current.play();
                    }}
                    className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-[#EE9B00] hover:bg-amber-50/50 transition-colors font-medium text-sm flex items-center justify-between"
                  >
                    <span>{choice.label}</span>
                    <ChevronRight className="w-4 h-4 text-[#EE9B00]" />
                  </button>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setActiveModalInteraction(null);
                  if (videoRef.current) videoRef.current.play();
                }}
                className="px-4 py-2 bg-[#EE9B00] hover:bg-[#D97706] text-slate-950 font-bold text-sm rounded-lg shadow-sm"
              >
                Reprendre la vidéo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BARRE DE CONTRÔLES PROFESSIONNELLE */}
      <div
        className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent px-4 pt-10 pb-3 transition-opacity duration-300 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Barre de timeline scrubber */}
        <div className="relative mb-3 flex items-center group/timeline">
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.1"
            value={currentTime}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setCurrentTime(val);
              if (videoRef.current) videoRef.current.currentTime = val;
            }}
            className="w-full h-1.5 bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-[#EE9B00] hover:h-2.5 transition-all"
            style={{
              background: `linear-gradient(to right, #EE9B00 0%, #EE9B00 ${
                (currentTime / (duration || 1)) * 100
              }%, rgba(51, 65, 85, 0.8) ${(currentTime / (duration || 1)) * 100}%, rgba(51, 65, 85, 0.8) 100%)`,
            }}
          />

          {/* Marqueurs d'interactions sur la timeline */}
          {duration > 0 &&
            interactions.map((inter) => {
              const posPercent = (inter.start_time / duration) * 100;
              const isQuiz = inter.type === 'QUIZ';
              return (
                <button
                  type="button"
                  key={inter.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (videoRef.current) {
                      videoRef.current.currentTime = inter.start_time;
                    }
                  }}
                  style={{ left: `${posPercent}%` }}
                  title={`${inter.title || inter.type} (${formatTime(inter.start_time)})`}
                  className={`absolute -top-1 w-3 h-3 rounded-full shadow-md transform -translate-x-1/2 hover:scale-150 transition-all cursor-pointer z-10 ${
                    isQuiz
                      ? 'bg-[#EE9B00] border-2 border-white ring-2 ring-[#EE9B00]/60'
                      : 'bg-white border-2 border-[#0B4F9C]'
                  }`}
                />
              );
            })}
        </div>

        {/* Ligne des contrôles principaux */}
        <div className="flex items-center justify-between text-white text-xs">
          {/* Gauche : Play, Recul, Avance, Volume, Horloge */}
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white"
              aria-label={isPlaying ? 'Pause' : 'Lecture'}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            <button
              onClick={() => seekDelta(-10)}
              className="p-1 text-slate-300 hover:text-white transition-colors"
              title="Reculer de 10s"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => seekDelta(10)}
              className="p-1 text-slate-300 hover:text-white transition-colors"
              title="Avancer de 10s"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1.5 group/vol ml-1">
              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.muted = !isMuted;
                    setIsMuted(!isMuted);
                  }
                }}
                className="p-1 text-slate-300 hover:text-white"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-red-400" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-slate-600 rounded appearance-none cursor-pointer accent-[#EE9B00]"
              />
            </div>

            {/* Temps */}
            <span className="font-mono text-slate-300 text-xs ml-2 select-none">
              <span className="text-white font-semibold">{formatTime(currentTime)}</span> /{' '}
              <span>{formatTime(duration)}</span>
            </span>
          </div>

          {/* Droite : Vitesse, Type badge, Fullscreen */}
          <div className="flex items-center gap-3">
            {/* Type badge */}
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#0B4F9C] text-white">
              {formation.type}
            </span>

            {/* Sélecteur de vitesse */}
            <select
              value={playbackRate}
              onChange={(e) => {
                const rate = parseFloat(e.target.value);
                setPlaybackRate(rate);
                if (videoRef.current) videoRef.current.playbackRate = rate;
              }}
              className="bg-slate-800 text-xs text-white rounded px-2 py-1 border border-slate-700 focus:outline-none focus:border-[#EE9B00]"
            >
              <option value="0.75">0.75x</option>
              <option value="1">1.0x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2.0x</option>
            </select>

            {/* Plein écran */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white"
              title={isFullscreen ? 'Quitter plein écran' : 'Plein écran'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
