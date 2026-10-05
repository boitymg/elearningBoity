'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  Home,
  BookOpen,
  BarChart3,
  User,
  LogOut,
  Shield,
  Menu,
  X,
} from 'lucide-react';

export function LearnerSidebar() {
  const pathname = usePathname();
  const { profile, isAdmin, isProducteur, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { label: 'Accueil', href: '/app', icon: Home },
    { label: 'Mes formations', href: '/app/formations', icon: BookOpen },
    { label: 'Ma progression', href: '/app/progression', icon: BarChart3 },
    { label: 'Mon profil', href: '/app/profil', icon: User },
  ];

  const sidebarContent = (
    <>
      {/* Brand Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <BrandLogo variant="full" size="md" href="/app" />
          <div className="mt-2.5 inline-block text-[11px] font-bold text-[#0B4F9C] uppercase tracking-wider bg-blue-50 px-2.5 py-0.5 rounded-full">
            Espace Apprenant
          </div>
        </div>
        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          aria-label="Fermer le menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/app' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-[#EE9B00] text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-[#0B4F9C] hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-500'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {isAdmin || isProducteur ? (
          <div className="pt-4 mt-4 border-t border-slate-100">
            <Link
              href="/admin/dashboard"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#0B4F9C] bg-blue-50/60 hover:bg-blue-50 transition-all border border-blue-100"
            >
              <Shield className="w-4 h-4 text-[#0B4F9C]" />
              <span>Console Studio</span>
            </Link>
          </div>
        ) : null}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
        <div className="truncate pr-2">
          <p className="text-xs font-bold text-slate-900 truncate">
            {profile?.display_name || 'Apprenant Boity'}
          </p>
          <p className="text-[11px] text-slate-500 truncate">
            {profile?.email || ''}
          </p>
        </div>
        <button
          onClick={() => logout()}
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
          title="Déconnexion"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* BARRE MOBILE SUPÉRIEURE */}
      <div className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0 shadow-xs">
        <BrandLogo variant="symbol" size="sm" href="/app" />

        <div className="text-center">
          <span className="text-xs font-bold text-slate-800">Espace Apprenant</span>
        </div>

        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* BACKDROP MOBILE */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* DRAWER MOBILE */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col md:hidden transform transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>

      {/* SIDEBAR DESKTOP */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 min-h-screen flex-col select-none shrink-0 shadow-xs">
        {sidebarContent}
      </aside>
    </>
  );
}
