'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { UserProfile, UserRole, UserStatus } from '@/lib/types/elearning';
import { Users, Shield, CheckCircle2, UserX, Search } from 'lucide-react';

export default function AdminUsersPage() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadUsers() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        setProfiles(data as UserProfile[]);
      } else {
        setProfiles([
          {
            id: 'admin-boity-1',
            email: 'contact@boity.mg',
            display_name: 'Superviseur Boity Studio',
            avatar_url: null,
            role: 'ADMIN',
            status: 'actif',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);
      }
      setLoading(false);
    }
    loadUsers();
  }, []);

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === userId ? { ...p, role: newRole } : p))
    );
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
  };

  const handleToggleStatus = async (userId: string, currentStatus: UserStatus) => {
    const nextStatus: UserStatus = currentStatus === 'actif' ? 'suspendu' : 'actif';
    setProfiles((prev) =>
      prev.map((p) => (p.id === userId ? { ...p, status: nextStatus } : p))
    );
    await supabase.from('profiles').update({ status: nextStatus }).eq('id', userId);
  };

  const filtered = profiles.filter((p) =>
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    (p.display_name && p.display_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#0B4F9C]">
            BOITY STUDIO • GOUVERNANCE
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Utilisateurs &amp; Permissions
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gérez les rôles administratifs, formateurs / producteurs et les accès apprenants
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#EE9B00]"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-xs divide-y divide-slate-100">
          <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="px-6 py-3.5">Utilisateur</th>
              <th className="px-6 py-3.5">Email</th>
              <th className="px-6 py-3.5">Rôle</th>
              <th className="px-6 py-3.5">Statut</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {filtered.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-900">
                  {user.display_name || 'Utilisateur'}
                </td>
                <td className="px-6 py-4 text-slate-600 font-mono">{user.email}</td>
                <td className="px-6 py-4">
                  <select
                    value={user.role}
                    onChange={(e) => handleUpdateRole(user.id, e.target.value as UserRole)}
                    className="px-2 py-1 rounded bg-slate-50 border border-slate-200 font-bold text-xs focus:ring-[#EE9B00]"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="PRODUCTEUR">PRODUCTEUR</option>
                    <option value="APPRENANT">APPRENANT</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      user.status === 'actif'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {user.status === 'actif' ? 'Actif' : 'Suspendu'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleToggleStatus(user.id, user.status)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-900 underline"
                  >
                    {user.status === 'actif' ? 'Suspendre' : 'Réactiver'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
