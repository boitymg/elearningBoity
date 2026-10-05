'use client';

import React from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { useAuth } from '@/lib/auth/AuthContext';
import { ShieldAlert } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading, isAdmin, isProducteur } = useAuth();

  return (
    <div className="min-h-screen flex bg-slate-900">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
