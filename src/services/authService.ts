import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AdminUser } from '../types';

export const authService = {
  /**
   * Get the current authenticated Supabase user session
   */
  getCurrentUser: async (): Promise<AdminUser | null> => {
    if (!isSupabaseConfigured()) {
      return null;
    }

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        return null;
      }

      const user = session.user;
      return {
        id: user.id,
        email: user.email || '',
        name: (user.user_metadata?.full_name as string) || (user.user_metadata?.name as string) || user.email?.split('@')[0] || 'Admin',
        full_name: (user.user_metadata?.full_name as string) || null,
        role: 'admin'
      };
    } catch (err) {
      console.error('PrismFlow authService: Error getting session:', err);
      return null;
    }
  },

  /**
   * Check if current user is authenticated AND authorized as an admin via public.is_admin()
   */
  checkIsAdmin: async (): Promise<{ isAuthenticated: boolean; isAdmin: boolean; user: AdminUser | null }> => {
    if (!isSupabaseConfigured()) {
      return { isAuthenticated: false, isAdmin: false, user: null };
    }

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        return { isAuthenticated: false, isAdmin: false, user: null };
      }

      const user: AdminUser = {
        id: session.user.id,
        email: session.user.email || '',
        name: (session.user.user_metadata?.full_name as string) || session.user.email?.split('@')[0] || 'Admin',
        role: 'admin'
      };

      // Call public.is_admin() RPC function
      const { data: isAdminRpc, error: rpcError } = await supabase.rpc('is_admin');
      
      if (!rpcError && typeof isAdminRpc === 'boolean') {
        return {
          isAuthenticated: true,
          isAdmin: isAdminRpc,
          user
        };
      }

      // If RPC fails (e.g. function not deployed yet), check public.admin_profiles table
      const { data: profile, error: profileError } = await supabase
        .from('admin_profiles')
        .select('id, email, full_name')
        .eq('id', session.user.id)
        .maybeSingle();

      if (!profileError && profile) {
        return {
          isAuthenticated: true,
          isAdmin: true,
          user: {
            id: profile.id,
            email: profile.email,
            name: profile.full_name || profile.email.split('@')[0],
            full_name: profile.full_name,
            role: 'admin'
          }
        };
      }

      // User has Supabase Auth session but is not registered in admin_profiles
      return {
        isAuthenticated: true,
        isAdmin: false,
        user
      };
    } catch (err) {
      console.error('PrismFlow authService: checkIsAdmin error:', err);
      return { isAuthenticated: false, isAdmin: false, user: null };
    }
  },

  /**
   * Sign in using Supabase Auth
   */
  login: async (email: string, pass: string): Promise<{ success: boolean; user?: AdminUser; error?: string }> => {
    if (!isSupabaseConfigured()) {
      return { 
        success: false, 
        error: 'Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.' 
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: pass,
      });

      if (error || !data.user) {
        return { 
          success: false, 
          error: error?.message || 'Invalid email or password. Please try again.' 
        };
      }

      // Check admin status immediately after login
      const adminCheck = await authService.checkIsAdmin();
      if (!adminCheck.isAdmin) {
        return {
          success: false,
          error: 'Access Denied: Your account is authenticated but does not possess administrator privileges.'
        };
      }

      return {
        success: true,
        user: adminCheck.user || {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.email?.split('@')[0] || 'Admin',
          role: 'admin'
        }
      };
    } catch (err: any) {
      console.error('PrismFlow authService: login exception:', err);
      return { 
        success: false, 
        error: 'A connection error occurred. Please verify your network and credentials.' 
      };
    }
  },

  /**
   * Log out of Supabase Auth
   */
  logout: async (): Promise<void> => {
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error('PrismFlow authService: logout error:', err);
    }
  },

  /**
   * Listen for Supabase auth state changes
   */
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    if (!isSupabaseConfigured()) {
      return { unsubscribe: () => {} };
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
    return subscription;
  }
};
