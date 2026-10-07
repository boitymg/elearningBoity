'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface BrandLogoProps {
  variant?: 'full' | 'symbol';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  className?: string;
  theme?: 'light' | 'dark';
  inverted?: boolean;
}

export function BrandLogo({
  variant = 'full',
  size = 'md',
  href = '/',
  className = '',
  theme = 'light',
  inverted = false,
}: BrandLogoProps) {
  const isDark = theme === 'dark' || inverted;

  const sizeConfig = {
    sm: { px: 32, boxClass: 'w-8 h-8' },
    md: { px: 40, boxClass: 'w-10 h-10' },
    lg: { px: 56, boxClass: 'w-14 h-14' },
  }[size];

  const content = (
    <div className={`inline-flex items-center gap-2.5 select-none shrink-0 ${className}`}>
      {variant === 'symbol' ? (
        <div className={`${sizeConfig.boxClass} relative shrink-0 flex items-center justify-center`}>
          <Image
            src="/brand/logo-boity.png"
            alt="Boity Studio"
            width={sizeConfig.px}
            height={sizeConfig.px}
            className="w-full h-full object-contain shrink-0"
            priority
          />
        </div>
      ) : (
        <div className="flex items-center gap-2.5 shrink-0">
          <div className={`${sizeConfig.boxClass} relative shrink-0 flex items-center justify-center`}>
            <Image
              src="/brand/logo-boity.png"
              alt="Boity Studio"
              width={sizeConfig.px}
              height={sizeConfig.px}
              className="w-full h-full object-contain shrink-0"
              priority
            />
          </div>
          <div className="flex flex-col leading-tight shrink-0">
            <span
              className={`font-black tracking-tight text-lg ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              elearning<span className="text-[#EE9B00]">.boity</span>
            </span>
            <span
              className={`text-[10px] tracking-widest font-semibold uppercase ${
                isDark ? 'text-blue-300' : 'text-[#0B4F9C]'
              }`}
            >
              Boity Studio
            </span>
          </div>
        </div>
      )}
    </div>
  );

  const targetHref = href && href.trim() !== '' ? href : '/';

  return (
    <Link
      href={targetHref}
      title="Retour à l'accueil"
      className="inline-flex items-center shrink-0 transition-transform hover:opacity-90 active:scale-95"
    >
      {content}
    </Link>
  );
}
