import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('AuthProvider: Initializing session...');
    
    const setData = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error fetching session:', error);
          toast.error("Authentication Error", {
            description: "Failed to restore your session. Please sign in again."
          });
        } else if (session) {
          console.log('Got session:', session);
          setSession(session);
          setUser(session.user);
        } else {
          console.log('No active session found');
        }
      } catch (err) {
        console.error('Unexpected error getting session:', err);
      } finally {
        setLoading(false);
      }
    };

    setData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log('Auth state changed:', event, currentSession?.user?.id);
      
      if (currentSession) {
        console.log('Setting new session and user from auth change');
        setSession(currentSession);
        setUser(currentSession.user);
      } else {
        console.log('Clearing session from auth change');
        setSession(null);
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => {
      console.log('Unsubscribing from auth changes');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
      
      toast.success("Welcome back!", {
        description: "You have successfully signed in."
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error("Sign in failed", {
        description: error.message || "Failed to sign in. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        }
      });

      if (error) {
        throw error;
      }
      
      toast.success("Account created!", {
        description: "Please check your email to verify your account."
      });
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error("Sign up failed", {
        description: error.message || "Failed to create account. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        console.log('No active session found, redirecting to login page');
        setSession(null);
        setUser(null);
        navigate('/auth/login');
        return;
      }
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      toast.success("Signed out", {
        description: "You have been successfully signed out."
      });
      
      setSession(null);
      setUser(null);
      navigate('/auth/login');
    } catch (error: any) {
      console.error('Error during sign out:', error);
      
      setSession(null);
      setUser(null);
      navigate('/auth/login');
      
      toast.success("Sign out completed", {
        description: "You have been signed out of your account."
      });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (error) {
        throw error;
      }
      
      toast.success("Password reset email sent", {
        description: "Please check your email for the password reset link."
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error("Password reset failed", {
        description: error.message || "Failed to send reset email. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
