'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  type User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase/client';
import { supabase } from '@/lib/supabase/client';
import type { UserProfile, UserRole } from '@/lib/types/elearning';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  role: UserRole;
  isAdmin: boolean;
  isProducteur: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  role: 'APPRENANT',
  isAdmin: false,
  isProducteur: false,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const syncUserProfile = async (fbUser: User) => {
    try {
      // 1. Chercher le profil existant
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', fbUser.uid)
        .single();

      if (data && !error) {
        setProfile(data as UserProfile);
        // Mettre à jour last_sign_in
        await supabase
          .from('profiles')
          .update({ last_sign_in_at: new Date().toISOString() })
          .eq('id', fbUser.uid);
        return;
      }

      // 2. Si non existant, créer le profil. Si email boity ou premier compte, attribuer ADMIN
      const isBoityAdmin =
        fbUser.email?.toLowerCase().includes('boity') ||
        fbUser.email?.toLowerCase().includes('andrianina') ||
        fbUser.email?.toLowerCase().includes('admin');

      const initialRole: UserRole = isBoityAdmin ? 'ADMIN' : 'APPRENANT';

      const newProfile: Partial<UserProfile> = {
        id: fbUser.uid,
        email: fbUser.email || '',
        display_name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Utilisateur Boity',
        avatar_url: fbUser.photoURL || null,
        role: initialRole,
        status: 'actif',
      };

      const { data: created, error: insertError } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .single();

      if (!insertError && created) {
        setProfile(created as UserProfile);
      }
    } catch (err) {
      console.error('[AuthContext] Erreur synchronisation profil Supabase:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      if (fbUser) {
        await syncUserProfile(fbUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (user) {
      await syncUserProfile(user);
    }
  };

  const signInWithGoogleAction = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmailAction = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmailAction = async (email: string, pass: string, name?: string) => {
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (cred.user) {
        await syncUserProfile(cred.user);
      }
    } finally {
      setLoading(false);
    }
  };

  const logoutAction = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setProfile(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const role: UserRole = profile?.role || 'APPRENANT';
  const isAdmin = role === 'ADMIN';
  const isProducteur = role === 'ADMIN' || role === 'PRODUCTEUR';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        role,
        isAdmin,
        isProducteur,
        signInWithGoogle: signInWithGoogleAction,
        signInWithEmail: signInWithEmailAction,
        signUpWithEmail: signUpWithEmailAction,
        logout: logoutAction,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
