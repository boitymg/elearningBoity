'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminLockScreen } from '@/components/admin/AdminLockScreen';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isBuilder = pathname?.includes('/builder');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(true);

  useEffect(() => {
    async function verifyAdminAccess() {
      // 1. Vérification rapide en mémoire session pour navigation fluide
      const sessionUnlocked =
        typeof window !== 'undefined' &&
        sessionStorage.getItem('boity_admin_unlocked') === 'true';

      if (sessionUnlocked) {
        setIsAuthenticated(true);
        setChecking(false);
        return;
      }

      // 2. Vérification côté serveur via cookie sécurisé
      try {
        const res = await fetch('/api/admin/auth', { method: 'GET' });
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setIsAuthenticated(true);
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('boity_admin_unlocked', 'true');
            }
          } else {
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      } finally {
        setChecking(false);
      }
    }

    verifyAdminAccess();
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-3 select-none">
        <Loader2 className="w-8 h-8 text-[#EE9B00] animate-spin" />
        <p className="text-xs text-slate-400 font-medium">
          Vérification des autorisations Studio...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLockScreen onSuccess={() => setIsAuthenticated(true)} />;
  }

  if (isBuilder) {
    return (
      <div className="min-h-screen bg-slate-900 overflow-y-auto">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-900">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
