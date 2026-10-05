'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface BrandLogoProps {
  variant?: 'full' | 'symbol';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  className?: string;
}

export function BrandLogo({
  variant = 'full',
  size = 'md',
  href = '/',
  className = '',
}: BrandLogoProps) {
  const dimensions = {
    sm: { symbol: 32, fullHeight: 36, fullWidth: 120 },
    md: { symbol: 42, fullHeight: 48, fullWidth: 160 },
    lg: { symbol: 56, fullHeight: 64, fullWidth: 210 },
  }[size];

  const content = (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {variant === 'symbol' ? (
        <Image
          src="/brand/logo-boity.png"
          alt="Boity Studio"
          width={dimensions.symbol}
          height={dimensions.symbol}
          className="object-contain"
          priority
        />
      ) : (
        <div className="flex items-center gap-2.5">
          <Image
            src="/brand/logo-boity.png"
            alt="Boity Studio"
            width={dimensions.symbol}
            height={dimensions.symbol}
            style={{ width: 'auto', height: 'auto' }}
            className="object-contain"
            priority
          />
          <div className="flex flex-col leading-tight">
            <span className="font-extrabold tracking-tight text-slate-900 text-lg">
              elearning<span className="text-[#EE9B00]">.boity</span>
            </span>
            <span className="text-[10px] tracking-wider font-semibold uppercase text-[#0B4F9C]">
              Boity Studio
            </span>
          </div>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block transition-transform hover:opacity-90 active:scale-95">
        {content}
      </Link>
    );
  }

  return content;
}
