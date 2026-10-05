'use client';

import React from 'react';
import type { Chapitre, Sequence } from '@/lib/types/elearning';
import { PlayCircle, CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react';

interface ChapterListProps {
  chapters: Chapitre[];
  activeSequenceId?: string;
  completedSequenceIds?: string[];
  onSelectSequence: (sequence: Sequence) => void;
}

export function ChapterList({
  chapters,
  activeSequenceId,
  completedSequenceIds = [],
  onSelectSequence,
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
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col h-full">
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#0B4F9C] uppercase tracking-wider">
          Plan du cours
        </h3>
        <span className="text-xs text-slate-500 font-medium">
          {chapters.length} chapitres
        </span>
      </div>

      <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
        {chapters.map((chapter, chIdx) => {
          const isOpen = openChapterIds[chapter.id];
          const sequences = chapter.sequences || [];

          return (
            <div key={chapter.id} className="bg-white">
              {/* Entête du chapitre */}
              <button
                onClick={() => toggleChapter(chapter.id)}
                className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors select-none"
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-md bg-blue-50 text-[#0B4F9C] text-xs font-bold">
                    {chIdx + 1}
                  </span>
                  <span className="text-sm font-bold text-slate-800 line-clamp-1">
                    {chapter.title}
                  </span>
                </div>
                <div className="text-slate-400">
                  {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </div>
              </button>

              {/* Séquences du chapitre */}
              {isOpen && sequences.length > 0 && (
                <div className="bg-slate-50/40 px-3 py-2 space-y-1">
                  {sequences.map((seq, seqIdx) => {
                    const isActive = seq.id === activeSequenceId;
                    const isCompleted = completedSequenceIds.includes(seq.id);

                    return (
                      <button
                        key={seq.id}
                        onClick={() => onSelectSequence(seq)}
                        className={`w-full px-3 py-2.5 rounded-xl text-left text-xs font-medium flex items-center justify-between transition-all ${
                          isActive
                            ? 'bg-[#0B4F9C] text-white shadow-xs font-bold'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          {isCompleted ? (
                            <CheckCircle2
                              className={`w-4 h-4 shrink-0 ${
                                isActive ? 'text-[#EE9B00]' : 'text-emerald-500'
                              }`}
                            />
                          ) : (
                            <PlayCircle
                              className={`w-4 h-4 shrink-0 ${
                                isActive ? 'text-[#EE9B00]' : 'text-slate-400'
                              }`}
                            />
                          )}
                          <span className="truncate">
                            {chIdx + 1}.{seqIdx + 1} {seq.title}
                          </span>
                        </div>
                        {isActive && (
                          <span className="w-2 h-2 rounded-full bg-[#EE9B00] shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
