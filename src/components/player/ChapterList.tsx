'use client';

import React from 'react';
import type { Chapitre, Sequence, Quiz } from '@/lib/types/elearning';
import { PlayCircle, CheckCircle2, ChevronDown, ChevronRight, Award, GraduationCap } from 'lucide-react';

interface ChapterListProps {
  chapters: Chapitre[];
  activeSequenceId?: string;
  completedSequenceIds?: string[];
  quizList?: Quiz[];
  onSelectSequence: (sequence: Sequence) => void;
  onSelectQuiz?: (quizId: string) => void;
  onClose?: () => void;
}

export function ChapterList({
  chapters,
  activeSequenceId,
  completedSequenceIds = [],
  quizList = [],
  onSelectSequence,
  onSelectQuiz,
  onClose,
}: ChapterListProps) {
  const [openChapterIds, setOpenChapterIds] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    chapters.forEach((ch, idx) => {
      initial[ch.id] = idx === 0 || ch.sequences?.some((s) => s.id === activeSequenceId) || false;
    });
    return initial;
  });

  const toggleChapter = (chapterId: string) => {
    setOpenChapterIds((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));

    // Quand l'apprenant clique sur le module, activer directement sa première séquence pour lancer la vidéo
    const chapter = chapters.find((ch) => ch.id === chapterId);
    if (chapter && chapter.sequences && chapter.sequences.length > 0) {
      onSelectSequence(chapter.sequences[0]);
    }
  };

  // Trouver le quiz final certifiant (16 questions ou order_index = 6)
  const finalQuiz =
    quizList.find((q) => q.questions && q.questions.length >= 10) || quizList[quizList.length - 1];

  return (
    <div className="bg-white rounded-none lg:rounded-2xl border-0 lg:border border-slate-200 overflow-hidden shadow-xs flex flex-col h-full select-none">
      {/* Header Sommaire */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#EE9B00] animate-pulse" />
            <h3 className="text-xs font-bold text-[#0B4F9C] uppercase tracking-wider">
              Plan du cours
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 font-light mt-0.5">
            {chapters.length} modules • Vidéo interactive &amp; Évaluations
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
            aria-label="Fermer le sommaire"
            title="Fermer le sommaire"
          >
            <span className="text-xl leading-none font-bold">&times;</span>
          </button>
        )}
      </div>

      {/* Arborescence des chapitres et séquences */}
      <div className="divide-y divide-slate-100 overflow-y-auto flex-1 p-2 space-y-1.5">
        {chapters.map((chapter, chIdx) => {
          const isOpen = openChapterIds[chapter.id];
          const sequences = chapter.sequences || [];
          // Trouver le quiz rattaché à ce chapitre
          const seqIds = sequences.map((s) => s.id);
          const chapterQuiz = quizList.find(
            (q) => (q.sequence_id && seqIds.includes(q.sequence_id)) || q.order_index === chIdx + 1
          );

          // Nettoyer le titre du module pour la hiérarchie visuelle
          const matchModule = chapter.title.match(/^(Module\s+\d+)\s*[:\-]\s*(.*)$/i);
          const moduleTag = matchModule ? matchModule[1] : `Module ${chIdx + 1}`;
          const moduleCleanTitle = matchModule ? matchModule[2] : chapter.title;

          return (
            <div
              key={chapter.id}
              className="bg-white rounded-xl border border-slate-200/80 overflow-hidden transition-all shadow-2xs"
            >
              {/* Entête du chapitre cliquable */}
              <button
                onClick={() => toggleChapter(chapter.id)}
                className={`w-full px-3.5 py-3 flex items-center justify-between text-left transition-colors group ${
                  isOpen ? 'bg-slate-50/90' : 'hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-blue-50 text-[#0B4F9C] text-xs font-bold shrink-0 mt-0.5 border border-blue-100">
                    {chIdx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-[#0B4F9C]">
                        {moduleTag}
                      </span>
                      <span className="text-[10px] text-slate-300 font-light">•</span>
                      <span className="text-[10px] text-slate-400 font-light">
                        {sequences.length} séquence{sequences.length > 1 ? 's' : ''}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-[13px] font-semibold text-slate-900 leading-snug mt-0.5 break-words group-hover:text-[#0B4F9C] transition-colors">
                      {moduleCleanTitle}
                    </h4>
                  </div>
                </div>
                <div className="text-slate-400 ml-2 shrink-0">
                  {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </div>
              </button>

              {/* Séquences & Quiz du chapitre */}
              {isOpen && sequences.length > 0 && (
                <div className="bg-slate-50/60 p-2.5 space-y-2 border-t border-slate-100">
                  {sequences.map((seq, seqIdx) => {
                    const isActive = seq.id === activeSequenceId;
                    const isCompleted = completedSequenceIds.includes(seq.id);

                    // Nettoyer un éventuel préfixe numérique redondant (ex: '1.1 1.1')
                    const cleanSeqTitle = seq.title.replace(/^\d+(\.\d+)*\s*[:-]?\s*/, '');
                    const seqNumber = `${chIdx + 1}.${seqIdx + 1}`;

                    return (
                      <button
                        key={seq.id}
                        onClick={() => onSelectSequence(seq)}
                        className={`w-full p-2.5 rounded-xl text-left transition-all flex items-start gap-2.5 ${
                          isActive
                            ? 'bg-gradient-to-r from-[#0B4F9C] to-[#0A2540] text-white shadow-md ring-1 ring-blue-900/30'
                            : 'bg-white hover:bg-slate-100/80 text-slate-800 border border-slate-200/80 shadow-2xs'
                        }`}
                      >
                        {/* Statut / Icône */}
                        <div className="mt-0.5 shrink-0">
                          {isCompleted ? (
                            <CheckCircle2
                              className={`w-4 h-4 ${
                                isActive ? 'text-[#EE9B00]' : 'text-emerald-500'
                              }`}
                            />
                          ) : (
                            <PlayCircle
                              className={`w-4 h-4 ${
                                isActive ? 'text-[#EE9B00]' : 'text-slate-400'
                              }`}
                            />
                          )}
                        </div>

                        {/* Contenu textuel */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span
                              className={`text-[9.5px] font-mono px-1.5 py-0.5 rounded font-medium ${
                                isActive
                                  ? 'bg-[#EE9B00] text-slate-950 font-bold'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              SEQ {seqNumber}
                            </span>
                            <span
                              className={`text-[10px] font-light ${
                                isActive ? 'text-blue-100' : 'text-slate-400'
                              }`}
                            >
                              Vidéo interactive
                            </span>
                            {isActive && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#EE9B00] ml-auto animate-pulse" />
                            )}
                          </div>

                          <p
                            className={`text-xs leading-snug break-words ${
                              isActive
                                ? 'text-white font-semibold'
                                : 'text-slate-800 font-normal hover:text-slate-950'
                            }`}
                          >
                            {cleanSeqTitle}
                          </p>
                        </div>
                      </button>
                    );
                  })}

                  {/* Bouton Quiz modulaire si disponible */}
                  {chapterQuiz && onSelectQuiz && (
                    <button
                      onClick={() => onSelectQuiz(chapterQuiz.id)}
                      className="w-full p-2.5 rounded-xl bg-amber-50/90 hover:bg-amber-100 text-left border border-amber-200/90 transition-all flex items-center justify-between gap-2.5 shadow-2xs group"
                    >
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <div className="w-6 h-6 rounded-lg bg-[#EE9B00]/20 text-[#EE9B00] flex items-center justify-center shrink-0 mt-0.5">
                          <Award className="w-3.5 h-3.5 text-[#EE9B00]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9.5px] font-semibold uppercase tracking-wider text-amber-800">
                              Évaluation Module {chIdx + 1}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-amber-950 leading-snug mt-0.5 break-words">
                            {chapterQuiz.title.replace(/^Quiz\s*Module\s*\d+\s*[:\-]\s*/i, '') || chapterQuiz.title}
                          </p>
                          <span className="text-[10px] text-amber-700/80 font-light block mt-0.5">
                            Validation des acquis théoriques
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-white font-medium text-amber-900 border border-amber-200 shrink-0">
                        {chapterQuiz.questions?.length || 5} Q
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* BOUTON EXAMEN CERTIFIANT TYPE 3 */}
      {finalQuiz && onSelectQuiz ? (
        <div className="p-3 sm:p-4 bg-[#0A2540] border-t border-slate-800 shrink-0">
          <button
            onClick={() => onSelectQuiz(finalQuiz.id)}
            className="w-full p-3 rounded-xl bg-gradient-to-r from-[#EE9B00] to-amber-600 hover:from-[#D97706] hover:to-amber-700 text-slate-950 flex items-center justify-between gap-3 shadow-lg transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-lg bg-slate-950/20 flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4 text-slate-950" />
              </div>
              <div className="text-left min-w-0">
                <div className="text-xs font-bold uppercase tracking-tight text-slate-950 leading-tight">
                  Examen Certifiant Type 3
                </div>
                <div className="text-[11px] text-slate-950/80 font-light mt-0.5">
                  {finalQuiz.questions?.length || 16} questions • Seuil {finalQuiz.passing_score || 70}%
                </div>
              </div>
            </div>
            <span className="px-3 py-1.5 rounded-lg bg-slate-950 text-white text-xs font-semibold tracking-wide shrink-0 shadow-xs">
              Lancer
            </span>
          </button>
        </div>
      ) : (
        <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 shrink-0 text-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
              <PlayCircle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300 block">
                Type 2 • Vidéo Interactive
              </span>
              <p className="text-[10px] text-slate-400 font-light truncate">
                Consultation libre &amp; fiches repères
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-medium shrink-0">
            100% Autonome
          </span>
        </div>
      )}
    </div>
  );
}
