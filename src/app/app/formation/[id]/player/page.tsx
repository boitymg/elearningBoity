'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { InteractiveVideoPlayer } from '@/components/player/InteractiveVideoPlayer';
import { ChapterList } from '@/components/player/ChapterList';
import { QuizRenderer } from '@/components/quiz/QuizRenderer';
import { Modal } from '@/components/ui/Modal';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { Formation, Chapitre, Sequence, Video, Interaction, Quiz } from '@/lib/types/elearning';
import { ArrowLeft, Award, CheckCircle2, ListTree, RefreshCw } from 'lucide-react';

export default function PlayerPage() {
  const params = useParams();
  const router = useRouter();
  const formationId = params?.id as string;
  const { user, profile } = useAuth();
  const learnerName = profile?.display_name || user?.displayName || (user?.email ? user.email.split('@')[0] : 'Apprenant');

  const [formation, setFormation] = useState<Formation | null>(null);
  const [chapters, setChapters] = useState<Chapitre[]>([]);
  const [activeSequence, setActiveSequence] = useState<Sequence | null>(null);
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [quizList, setQuizList] = useState<Quiz[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [completedSequences, setCompletedSequences] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChaptersSidebar, setShowChaptersSidebar] = useState(true);
  const [seekCommand, setSeekCommand] = useState<{ time: number; shouldPlay: boolean; id: number } | null>(null);

  // Charger la formation et toute son arborescence
  useEffect(() => {
    async function loadFullCourse() {
      if (!formationId) return;

      try {
        // 1. Formation
        const { data: form } = await supabase
          .from('formations')
          .select('*')
          .eq('id', formationId)
          .single();

        if (form) setFormation(form as Formation);

        // 2. Chapitres + Séquences + Vidéos
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

          // Sélectionner la première séquence et première vidéo par défaut
          const firstSeq = typedChaps[0]?.sequences?.[0];
          if (firstSeq) {
            setActiveSequence(firstSeq);
            const firstVid = firstSeq.videos?.[0];
            if (firstVid) {
              setActiveVideo(firstVid);
              // Charger les interactions de la première vidéo
              const { data: inters } = await supabase
                .from('interactions')
                .select('*')
                .eq('video_id', firstVid.id)
                .order('start_time', { ascending: true });

              if (inters) setInteractions(inters as Interaction[]);
            }
          }
        }

        // 3. Quiz rattachés
        const { data: quizzes } = await supabase
          .from('quiz')
          .select(`
            *,
            questions (
              *,
              answers (*)
            )
          `)
          .eq('formation_id', formationId);

        if (quizzes) setQuizList(quizzes as Quiz[]);

        // 4. Progression existante de l'apprenant
        if (user) {
          const { data: prog } = await supabase
            .from('learner_progress')
            .select('*')
            .eq('user_id', user.uid)
            .eq('formation_id', formationId)
            .single();

          if (prog && prog.current_sequence_id) {
            // Optionnel : reprendre la dernière séquence
          }
        }
      } catch (err) {
        console.error('Erreur chargement du player:', err);
      } finally {
        setLoading(false);
      }
    }

    loadFullCourse();
  }, [formationId, user]);

  // Changement de séquence active avec avance immédiate de la vidéo
  const handleSelectSequence = async (seq: Sequence) => {
    setActiveSequence(seq);

    // Calculer le timestamp correspondant à ce module dans la vidéo
    const chIdx = chapters.findIndex((ch) => ch.sequences?.some((s) => s.id === seq.id));
    const totalDuration = activeVideo?.duration_seconds || formation?.duration_seconds || 523;
    const targetTime = chIdx > 0 ? Math.floor((chIdx / Math.max(1, chapters.length)) * totalDuration) : 0;

    // Déclencher le saut immédiat et la lecture automatique
    setSeekCommand({
      time: targetTime,
      shouldPlay: true,
      id: Date.now(),
    });

    const vid = seq.videos?.[0];
    if (vid) {
      setActiveVideo(vid);
      const { data: inters } = await supabase
        .from('interactions')
        .select('*')
        .eq('video_id', vid.id)
        .order('start_time', { ascending: true });

      if (inters) setInteractions(inters as Interaction[]);
    } else {
      // Séquence d'évaluation : déclencher directement le quiz associé
      const matchedQuiz = quizList.find((q) => q.sequence_id === seq.id);
      if (matchedQuiz) {
        setActiveQuiz(matchedQuiz);
      }
    }
  };

  // Mise à jour de la progression
  const handleProgressUpdate = useCallback(
    async (currentTime: number, percentage: number) => {
      if (!user || !formation || !activeSequence) return;

      try {
        await supabase
          .from('learner_progress')
          .upsert(
            {
              user_id: user.uid,
              formation_id: formation.id,
              current_sequence_id: activeSequence.id,
              current_video_time: currentTime,
              completion_percentage: percentage,
              is_completed: percentage >= 95,
              last_accessed_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,formation_id' }
          );

        if (percentage >= 90 && !completedSequences.includes(activeSequence.id)) {
          setCompletedSequences((prev) => [...prev, activeSequence.id]);
        }
      } catch (err) {
        console.error('Erreur sauvegarde progression:', err);
      }
    },
    [user, formation, activeSequence, completedSequences]
  );

  // Déclenchement d'un quiz
  const handleQuizTrigger = (quizId?: string) => {
    const q = quizId ? quizList.find((item) => item.id === quizId) : quizList[0];
    if (q) {
      setActiveQuiz(q);
    }
  };

  // Enregistrement d'une tentative de quiz
  const handleQuizComplete = async (
    score: number,
    passed: boolean,
    answers: Record<string, string[]>
  ) => {
    if (!user || !formation || !activeQuiz) return;

    try {
      await supabase.from('quiz_attempts').insert({
        user_id: user.uid,
        quiz_id: activeQuiz.id,
        formation_id: formation.id,
        formation_version: formation.current_version || '1.0',
        score_percentage: score,
        is_passed: passed,
        answers_json: answers,
      });

      // Mettre à jour la progression globale
      if (passed) {
        await supabase
          .from('learner_progress')
          .update({
            completion_percentage: 100,
            is_completed: true,
            completed_at: new Date().toISOString(),
          })
          .eq('user_id', user.uid)
          .eq('formation_id', formation.id);
      }
    } catch (err) {
      console.error('Erreur enregistrement quiz attempt:', err);
    }
  };

  // Passer à la séquence suivante
  const handleNextSequence = () => {
    if (!chapters.length || !activeSequence) return;
    const allSeqs = chapters.flatMap((c) => c.sequences || []);
    const currentIndex = allSeqs.findIndex((s) => s.id === activeSequence.id);
    if (currentIndex >= 0 && currentIndex + 1 < allSeqs.length) {
      handleSelectSequence(allSeqs[currentIndex + 1]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-[#EE9B00] animate-spin" />
          <p className="text-sm font-semibold tracking-wider uppercase text-slate-400">
            Initialisation du player interactif...
          </p>
        </div>
      </div>
    );
  }

  if (!formation || !activeVideo) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold mb-2">Contenu vidéo non configuré</h2>
        <p className="text-sm text-slate-400 mb-6">
          Cette formation ne comporte aucune vidéo active pour le moment.
        </p>
        <Link href="/app/formations">
          <Button variant="primary">Retour aux formations</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col select-none overflow-x-hidden">
      {/* BARRE SUPÉRIEURE DU PLAYER */}
      <header className="h-14 sm:h-16 px-3 sm:px-6 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
          <Link
            href="/app/formations"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold transition-colors border border-slate-700 shadow-sm shrink-0"
            title="Retour à la liste des formations"
          >
            <ArrowLeft className="w-4 h-4 text-[#EE9B00]" />
            <span>Retour</span>
          </Link>

          <div className="h-4 w-px bg-slate-800 shrink-0" />

          <BrandLogo variant="symbol" size="sm" href="" className="shrink-0" />

          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-bold text-white truncate max-w-[150px] sm:max-w-xs md:max-w-md">
              {formation.title}
            </h1>
            <p className="text-[10px] sm:text-[11px] text-[#EE9B00] font-semibold truncate max-w-[150px] sm:max-w-xs">
              {activeSequence?.title || 'Séquence active'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <span className="hidden md:inline-block">
            <Badge variant={formation.type === 'TYPE_3' ? 'type3' : 'type2'} size="sm">
              {formation.type}
            </Badge>
          </span>

          {quizList.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleQuizTrigger()}
              leftIcon={<Award className="w-3.5 h-3.5 text-[#EE9B00]" />}
              className="text-xs px-2.5 py-1 sm:px-3 sm:py-1.5"
            >
              <span className="hidden sm:inline">Évaluation </span>({quizList.length})
            </Button>
          )}

          <button
            onClick={() => setShowChaptersSidebar(!showChaptersSidebar)}
            className={`p-2 rounded-lg transition-colors border ${
              showChaptersSidebar
                ? 'bg-[#EE9B00] text-slate-950 border-[#EE9B00]'
                : 'text-slate-400 hover:text-white border-slate-800 hover:bg-slate-800'
            }`}
            title="Afficher/masquer le sommaire"
            aria-label="Sommaire du cours"
          >
            <ListTree className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ZONE CENTRALE : PLAYER & SOMMAIRE */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* PLAYER VIDÉO PRINCIPAL */}
        <div className="flex-1 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black overflow-hidden relative">
          <div className="w-full max-w-5xl">
            <InteractiveVideoPlayer
              formation={formation}
              video={activeVideo}
              chapters={chapters}
              currentSequence={activeSequence || undefined}
              seekTarget={seekCommand}
              interactions={interactions}
              isQuizActive={!!activeQuiz}
              onProgressUpdate={handleProgressUpdate}
              onQuizTrigger={handleQuizTrigger}
              onNextSequence={handleNextSequence}
            />
          </div>
        </div>

        {/* BACKDROP POUR MOBILE/TABLETTE QUAND LE SOMMAIRE EST OUVERT */}
        {showChaptersSidebar && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
            onClick={() => setShowChaptersSidebar(false)}
          />
        )}

        {/* SIDEBAR PLAN DU COURS (DESKTOP ET MOBILE DRAWER) */}
        {showChaptersSidebar && (
          <aside className="fixed inset-y-0 right-0 z-50 w-[340px] sm:w-[390px] lg:w-[380px] xl:w-[410px] max-w-[92vw] bg-white text-slate-900 shadow-2xl flex flex-col lg:relative lg:inset-auto lg:z-10 lg:border-l lg:border-slate-800 lg:shadow-none animate-in slide-in-from-right-4 duration-200">
            <ChapterList
              chapters={chapters}
              activeSequenceId={activeSequence?.id}
              completedSequenceIds={completedSequences}
              quizList={quizList}
              onSelectSequence={(seq) => {
                handleSelectSequence(seq);
                if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                  setShowChaptersSidebar(false);
                }
              }}
              onSelectQuiz={handleQuizTrigger}
              onClose={() => setShowChaptersSidebar(false)}
            />
          </aside>
        )}
      </div>

      {/* MODAL QUIZ INTERACTIF OVERLAY */}
      {activeQuiz && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-2xl my-auto animate-in zoom-in-95">
            <QuizRenderer
              quiz={activeQuiz}
              userName={learnerName}
              onComplete={handleQuizComplete}
              onClose={() => setActiveQuiz(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
