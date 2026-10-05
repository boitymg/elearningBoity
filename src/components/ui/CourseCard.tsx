'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Formation } from '@/lib/types/elearning';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Clock, Play, ArrowRight, Award } from 'lucide-react';

interface CourseCardProps {
  formation: Formation;
  progressPercentage?: number;
  href?: string;
  isLearnerView?: boolean;
}

export function CourseCard({
  formation,
  progressPercentage = 0,
  href,
  isLearnerView = false,
}: CourseCardProps) {
  const targetHref = href || (isLearnerView ? `/app/formation/${formation.id}` : `/formation/${formation.slug}`);

  const formatDuration = (seconds: number) => {
    const mins = Math.round(seconds / 60);
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hours}h ${remMins}m`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col overflow-hidden group">
      {/* Thumbnail Banner */}
      <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
        <Image
          src={formation.thumbnail_url || '/brand/logo-boity.png'}
          alt={formation.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
          <Badge variant={formation.type === 'TYPE_3' ? 'type3' : 'type2'} size="sm">
            {formation.type === 'TYPE_3' ? 'Type 3 • Avec Évaluation' : 'Type 2 • Vidéo Interactive'}
          </Badge>
        </div>

        {formation.passing_score && formation.type === 'TYPE_3' && (
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 z-10">
            <Award className="w-3 h-3 text-[#EE9B00]" />
            <span>Seuil {formation.passing_score}%</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata Bar */}
          <div className="flex items-center gap-3 text-xs text-slate-500 mb-2.5 font-medium">
            <span className="flex items-center gap-1 text-[#0B4F9C]">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatDuration(formation.duration_seconds || 360)}</span>
            </span>
            <span>•</span>
            <span className="uppercase text-[11px] tracking-wider text-slate-400">
              v{formation.current_version}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-slate-900 line-clamp-2 group-hover:text-[#0B4F9C] transition-colors mb-2">
            {formation.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
            {formation.description || 'Module interactif professionnel conçu par Boity Studio.'}
          </p>
        </div>

        {/* Progress or Actions */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          {isLearnerView ? (
            <div>
              <Progress
                value={progressPercentage}
                label="Votre progression"
                size="sm"
                color="orange"
                className="mb-3"
              />
              <Link href={`/app/formation/${formation.id}/player`} className="block w-full">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
                >
                  {progressPercentage > 0 ? 'Continuer le module' : 'Démarrer le module'}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0B4F9C]">Boity Studio</span>
              <Link href={targetHref}>
                <Button
                  variant="secondary"
                  size="sm"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Découvrir
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
