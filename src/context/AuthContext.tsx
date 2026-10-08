import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types/finance';
import { financeService } from '../services/financeService';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  user: UserProfile | null;
  supabaseUser: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string; needsConfirmation?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (email: string, token: string) => Promise<{ success: boolean; error?: string }>;
  resendConfirmationEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfileAndSetUser = useCallback(async (currentSession: Session) => {
    try {
      const u = currentSession.user;
      setSupabaseUser(u);
      setSession(currentSession);

      // Fetch profile from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', u.id)
        .maybeSingle();

      const fullName = profile?.full_name || u.user_metadata?.full_name || u.email?.split('@')[0] || 'Người dùng';

      // Ensure profile and default seed categories & payment methods are present
      await financeService.initUserData(u.id, u.email || '', fullName);

      setUser({
        id: u.id,
        email: u.email || '',
        full_name: fullName,
        currency: profile?.currency || 'VND',
        created_at: profile?.created_at || u.created_at,
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession?.user) {
        await fetchProfileAndSetUser(currentSession);
      } else {
        setUser(null);
        setSupabaseUser(null);
        setSession(null);
      }
    } catch (err) {
      console.error('Error in refreshSession:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchProfileAndSetUser]);

  useEffect(() => {
    refreshSession();

    // Listen for auth state changes (sign in, sign out, token refresh, password recovery)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (newSession?.user) {
        await fetchProfileAndSetUser(newSession);
      } else {
        setUser(null);
        setSupabaseUser(null);
        setSession(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshSession, fetchProfileAndSetUser]);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        if (data.session) {
          await supabase.auth.signOut();
        }
        return {
          success: true,
          needsConfirmation: true,
        };
      }
      return { success: false, error: 'Không thể tạo tài khoản.' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi đăng ký tài khoản';
      return { success: false, error: msg };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.session) {
        await fetchProfileAndSetUser(data.session);
        return { success: true };
      }
      return { success: false, error: 'Không thể lấy phiên đăng nhập.' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi đăng nhập';
      return { success: false, error: msg };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSupabaseUser(null);
      setSession(null);
    } catch (err) {
      console.error('SignOut error:', err);
    }
  };

  const resetPasswordForEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi đặt lại mật khẩu';
      return { success: false, error: msg };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi cập nhật mật khẩu';
      return { success: false, error: msg };
    }
  };

  const verifyOtp = async (email: string, token: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: token.trim(),
        type: 'email',
      });
      if (error) {
        return { success: false, error: error.message };
      }
      if (data.session) {
        await supabase.auth.signOut();
      }
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi xác thực mã OTP';
      return { success: false, error: msg };
    }
  };

  const resendConfirmationEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi gửi lại email xác nhận';
      return { success: false, error: msg };
    }
  };

  const value = useMemo(
    () => ({
      user,
      supabaseUser,
      session,
      loading,
      signUp,
      signIn,
      signOut,
      resetPasswordForEmail,
      updatePassword,
      verifyOtp,
      resendConfirmationEmail,
      refreshSession,
    }),
    [user, supabaseUser, session, loading, refreshSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
