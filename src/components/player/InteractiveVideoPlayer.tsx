'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  ArrowLeft,
} from 'lucide-react';

interface InteractiveVideoPlayerProps {
  formation: Formation;
  video: Video;
  chapters?: Chapitre[];
  currentSequence?: Sequence;
  seekTarget?: { time: number; shouldPlay: boolean; id: string | number } | null;
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
  seekTarget,
  interactions = [],
  initialTime = 0,
  isQuizActive = false,
  onProgressUpdate,
  onQuizTrigger,
  onNextSequence,
}: InteractiveVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // États du lecteur et source résiliente
  const [videoSrc, setVideoSrc] = useState(video.video_url || '/samples/formation-sample.mp4');
  const [isBuffering, setIsBuffering] = useState(false);
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

  // Synchronisation de l'URL vidéo
  useEffect(() => {
    if (video.video_url) {
      setVideoSrc(video.video_url);
    }
  }, [video.video_url]);

  // Fallback résilient en cas d'erreur de lecture vidéo
  const handleVideoError = () => {
    console.warn('Erreur chargement source vidéo:', videoSrc);
    if (videoSrc !== '/videos/VIDEOtype2.mp4') {
      setVideoSrc('/videos/VIDEOtype2.mp4');
    } else {
      setVideoSrc('/samples/formation-sample.mp4');
    }
  };

  // Dès que le questionnaire se montre, la vidéo se met en pause
  // Dès qu'on ferme ou valide le test, la vidéo reprend automatiquement
  useEffect(() => {
    if (isQuizActive) {
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
      setIsBuffering(false);
    } else if (prevQuizActive.current && !isQuizActive) {
      setIsBuffering(false);
      if (videoRef.current) {
        videoRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {});
      }
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

  // Avance immédiate et lecture de la vidéo quand un module de droite est cliqué
  useEffect(() => {
    if (!seekTarget || !videoRef.current) return;

    const targetTime = Math.max(0, Math.min(duration || 523, seekTarget.time));
    videoRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);

    if (seekTarget.shouldPlay) {
      setIsBuffering(false);
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Lecture auto en attente d’interaction:', err);
        });
    }
  }, [seekTarget, duration]);

  // Pause intelligente uniquement si l'utilisateur quitte totalement la vidéo ou change d'onglet
  useEffect(() => {
    const handleScroll = () => {
      // Détecte uniquement un défilement profond hors du champ de vision
      if (typeof window !== 'undefined' && window.scrollY > 400) {
        if (videoRef.current && !videoRef.current.paused) {
          videoRef.current.pause();
          setIsPlaying(false);
          setIsBuffering(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Détecter si le lecteur vidéo quitte totalement le champ de vision (0% visible)
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined' && containerRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.intersectionRatio === 0) {
              if (videoRef.current && !videoRef.current.paused) {
                videoRef.current.pause();
                setIsPlaying(false);
                setIsBuffering(false);
              }
            }
          }
        },
        { threshold: [0] }
      );
      observer.observe(containerRef.current);
    }

    // Détecter si l'utilisateur change d'onglet
    const handleVisibility = () => {
      if (document.hidden && videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
        setIsPlaying(false);
        setIsBuffering(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (observer) observer.disconnect();
    };
  }, []);

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

  // Play / Pause synchronisé avec l'état physique du lecteur
  const togglePlay = () => {
    if (!videoRef.current) return;
    setIsBuffering(false);
    if (videoRef.current.paused) {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Erreur lecture vidéo:', err);
        });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
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
      {/* BOUTON RETOUR DIRECT DU LECTEUR VIDÉO */}
      <Link
        href="/app/formations"
        className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-white text-xs sm:text-sm font-bold border border-white/20 backdrop-blur-md shadow-xl transition-all hover:scale-105 active:scale-95"
        title="Retour aux formations"
      >
        <ArrowLeft className="w-4 h-4 text-[#EE9B00]" />
        <span>Retour</span>
      </Link>

      {/* AFFICHE INITIALE AVEC LOGO BOITY RÉDUIT ET PROPORTIONNÉ */}
      {currentTime === 0 && !isPlaying && (
        <div className="absolute inset-0 bg-slate-950 flex items-center justify-center pointer-events-none z-5">
          <div className="relative w-28 h-28 sm:w-36 sm:h-36">
            <Image
              src="/brand/logo-boity.png"
              alt={formation.title}
              fill
              className="object-contain drop-shadow-2xl opacity-90"
            />
          </div>
        </div>
      )}

      {/* Balise HTML5 Video optimisée streaming CDN et 1000+ utilisateurs */}
      <video
        ref={videoRef}
        src={videoSrc}
        poster={video.thumbnail_url && !video.thumbnail_url.includes('logo-boity') ? video.thumbnail_url : undefined}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            const d = videoRef.current.duration;
            if (d && !isNaN(d) && isFinite(d)) {
              setDuration(d);
            } else if (video.duration_seconds) {
              setDuration(video.duration_seconds);
            }
          }
        }}
        onLoadedData={() => setIsBuffering(false)}
        onCanPlay={() => setIsBuffering(false)}
        onCanPlayThrough={() => setIsBuffering(false)}
        onSeeked={() => setIsBuffering(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => {
          setIsBuffering(false);
          setIsPlaying(false);
        }}
        onWaiting={() => {
          // Activer le loader uniquement si la vidéo est censée jouer activement
          if (videoRef.current && !videoRef.current.paused) {
            setIsBuffering(true);
          }
        }}
        onPlaying={() => {
          setIsBuffering(false);
          setIsPlaying(true);
        }}
        onError={handleVideoError}
        onEnded={() => {
          setIsBuffering(false);
          setIsPlaying(false);
          if (onNextSequence) onNextSequence();
        }}
        onClick={togglePlay}
        className="w-full h-full object-contain cursor-pointer"
        playsInline
        preload="metadata"
        crossOrigin="anonymous"
      />

      {/* BOUTON PLAY CENTRAL QUAND EN PAUSE (TOUJOURS DISPONIBLE) */}
      {!isPlaying && (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#EE9B00]/95 hover:bg-[#EE9B00] text-slate-950 flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 z-20 cursor-pointer"
          aria-label="Lancer la vidéo"
        >
          <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current ml-1" />
        </button>
      )}

      {/* SPINNER DE BUFFERING (UNIQUEMENT PENDANT LA LECTURE SI ÇA RAME) */}
      {isBuffering && isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs z-15 pointer-events-none">
          <div className="flex flex-col items-center gap-2 bg-slate-900/80 px-4 py-3 rounded-2xl border border-slate-700 shadow-2xl">
            <div className="w-8 h-8 border-3 border-[#EE9B00] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-slate-200">Chargement...</span>
          </div>
        </div>
      )}

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

              {/* Les Quiz s'ouvrent directement en modal sans bouton encombrant au milieu de l'écran */}

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
            onPointerDown={() => {
              if (videoRef.current && !videoRef.current.paused) {
                videoRef.current.pause();
                setIsPlaying(false);
              }
            }}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setCurrentTime(val);
              if (videoRef.current) videoRef.current.currentTime = val;
            }}
            onPointerUp={() => {
              if (videoRef.current) {
                videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
              }
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
        <div className="flex items-center justify-between text-white text-xs gap-2">
          {/* Gauche : Play, Recul, Avance, Volume, Horloge */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={togglePlay}
              className="p-1 sm:p-1.5 rounded-full hover:bg-white/20 transition-colors text-white"
              aria-label={isPlaying ? 'Pause' : 'Lecture'}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            <button
              onClick={() => seekDelta(-10)}
              className="hidden sm:inline-flex p-1 text-slate-300 hover:text-white transition-colors"
              title="Reculer de 10s"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => seekDelta(10)}
              className="hidden sm:inline-flex p-1 text-slate-300 hover:text-white transition-colors"
              title="Avancer de 10s"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1 sm:gap-1.5 group/vol">
              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.muted = !isMuted;
                    setIsMuted(!isMuted);
                  }
                }}
                className="p-1 text-slate-300 hover:text-white"
                title={isMuted ? 'Activer le son' : 'Couper le son'}
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
                className="hidden sm:inline-block w-14 sm:w-16 h-1 bg-slate-600 rounded appearance-none cursor-pointer accent-[#EE9B00]"
              />
            </div>

            {/* Temps */}
            <span className="font-mono text-slate-300 text-[11px] sm:text-xs select-none">
              <span className="text-white font-semibold">{formatTime(currentTime)}</span> /{' '}
              <span>{formatTime(duration)}</span>
            </span>
          </div>

          {/* Droite : Vitesse, Type badge, Fullscreen */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Type badge */}
            <span className="hidden md:inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#0B4F9C] text-white">
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
              className="bg-slate-800 text-[11px] sm:text-xs text-white rounded px-1.5 py-0.5 sm:px-2 sm:py-1 border border-slate-700 focus:outline-none focus:border-[#EE9B00]"
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
              className="p-1 sm:p-1.5 rounded-full hover:bg-white/20 transition-colors text-white"
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
