'use client';

import React from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/Button';
import { User, Mail, Shield, Calendar, LogOut } from 'lucide-react';

export default function LearnerProfilePage() {
  const { user, profile, logout } = useAuth();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Mon profil apprenant
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Informations de votre compte sur la plateforme Boity Studio
        </p>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-5 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-5 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-[#0B4F9C] flex items-center justify-center font-extrabold text-xl">
            {profile?.display_name?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {profile?.display_name || user?.displayName || 'Utilisateur'}
            </h2>
            <p className="text-xs text-slate-500">{profile?.email || user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-semibold uppercase flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              Email
            </span>
            <p className="font-bold text-slate-800 text-sm">{profile?.email || user?.email}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-semibold uppercase flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#0B4F9C]" />
              Rôle
            </span>
            <p className="font-bold text-[#0B4F9C] text-sm uppercase">{profile?.role || 'APPRENANT'}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-semibold uppercase flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Statut du compte
            </span>
            <p className="font-bold text-emerald-600 text-sm capitalize">{profile?.status || 'actif'}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-semibold uppercase flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#EE9B00]" />
              Organisation
            </span>
            <p className="font-bold text-slate-800 text-sm">BOITY STUDIO</p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end">
          <Button
            variant="outline"
            onClick={() => logout()}
            leftIcon={<LogOut className="w-4 h-4 text-red-500" />}
          >
            Se déconnecter
          </Button>
        </div>
      </div>
    </div>
  );
}
