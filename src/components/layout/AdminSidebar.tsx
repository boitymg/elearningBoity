'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  LayoutDashboard,
  GraduationCap,
  PlusCircle,
  Film,
  Users,
  Archive,
  Settings,
  ArrowLeft,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

export function AdminSidebar() {
  const pathname = usePathname();
  const { profile, logout } = useAuth();

  const menuItems = [
    { label: 'Tableau de bord', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Formations', href: '/admin/formations', icon: GraduationCap },
    { label: 'Nouvelle formation', href: '/admin/formations/new', icon: PlusCircle },
    { label: 'Médiathèque', href: '/admin/medias', icon: Film },
    { label: 'Utilisateurs & Rôles', href: '/admin/utilisateurs', icon: Users },
    { label: 'Exports HTML5 / SCORM', href: '/admin/exports', icon: Archive },
    { label: 'Paramètres', href: '/admin/parametres', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col border-r border-slate-800 select-none shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 bg-slate-950/40">
        <BrandLogo variant="full" size="md" href="/admin/dashboard" />
        <div className="mt-3 flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0B4F9C]/30 text-[#EE9B00] border border-[#0B4F9C]/50 text-[11px] font-semibold tracking-wide uppercase">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Console Boity Studio</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#EE9B00] text-slate-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile & Back to Learner App */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60 space-y-3">
        <Link
          href="/app/formations"
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-[#EE9B00] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Basculer vers l&apos;App Apprenant</span>
        </Link>

        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div className="truncate pr-2">
            <p className="text-xs font-semibold text-white truncate">
              {profile?.display_name || 'Admin Boity'}
            </p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
              {profile?.role || 'ADMIN'}
            </p>
          </div>
          <button
            onClick={() => logout()}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Déconnexion"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
