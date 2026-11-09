import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { AuthService, type Profile } from '../services/auth.service';
import { OnboardingService, type StudentPreferences } from '../services/onboarding.service';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  preferences: StudentPreferences | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  refreshPreferences: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [preferences, setPreferences] = useState<StudentPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (currentUserId: string) => {
    try {
      const [profileData, prefData] = await Promise.all([
        AuthService.getProfile(currentUserId).catch(() => null),
        OnboardingService.getPreferences().catch(() => null),
      ]);
      setProfile(profileData);
      setPreferences(prefData);
    } catch {
      // Ignore initial load failure if unauthenticated or new user
    }
  };

  useEffect(() => {
    // 1. Initial active session check
    supabase.auth.getSession().then(({ data: { session: activeSession } }) => {
      setSession(activeSession);
      setUser(activeSession?.user ?? null);
      if (activeSession?.user) {
        fetchUserData(activeSession.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // 2. Auth State Change Listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        await fetchUserData(newSession.user.id);
      } else {
        setProfile(null);
        setPreferences(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (user) {
      const p = await AuthService.getProfile(user.id);
      setProfile(p);
    }
  };

  const refreshPreferences = async () => {
    if (user) {
      const pref = await OnboardingService.getPreferences().catch(() => null);
      setPreferences(pref);
    }
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
    setSession(null);
    setProfile(null);
    setPreferences(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        preferences,
        loading,
        refreshProfile,
        refreshPreferences,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
