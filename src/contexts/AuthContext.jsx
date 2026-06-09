import { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const profileRequestRef = useRef(0);

  const fetchProfile = useCallback(async (userId) => {
    const requestId = ++profileRequestRef.current;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (requestId !== profileRequestRef.current) return null;

      if (error) {
        console.warn('[Auth] Profile fetch error:', error.message);
        return null;
      }

      if (data) {
        setProfile(data);
        return data;
      }
    } catch (err) {
      console.warn('[Auth] Profile fetch exception:', err.message);
    }
    return null;
  }, []);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return;

      if (error) {
        console.error('[Auth] getSession error:', error.message);
        setAuthError(error.message);
      }

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        fetchProfile(currentUser.id).finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        fetchProfile(currentUser.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signUp = async (email, password, fullName, phone) => {
    setAuthError(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    if (error) {
      setAuthError(error.message);
      throw error;
    }

    // Check if email confirmation is required
    if (data?.user?.identities?.length === 0) {
      throw new Error(
        'This email is already registered. Please sign in instead.'
      );
    }

    // If user was created but session is null, email confirmation is required
    if (data?.user && !data?.session) {
      toast.info('Account created! Please check your email to verify before signing in.');
    }

    return data;
  };

  const signIn = async (email, password) => {
    setAuthError(null);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthError(error.message);
      // Provide more helpful error messages
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password. Please check and try again.');
      }
      if (error.message.includes('Email not confirmed')) {
        throw new Error(
          'Your email is not verified. Please check your inbox (and spam folder) for the verification link, or contact support.'
        );
      }
      throw error;
    }

    return data;
  };

  const signInWithGoogle = async () => {
    setAuthError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/login`,
      },
    });

    if (error) {
      setAuthError(error.message);
      throw error;
    }
  };

  const signOut = async () => {
    setAuthError(null);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setAuthError(error.message);
      throw error;
    }
    setProfile(null);
  };

  const updateProfile = async (updates) => {
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...updates, updated_at: new Date().toISOString() })
      .select()
      .single();
    if (error) throw error;
    setProfile(data);
    return data;
  };

  const value = {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    authError,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
