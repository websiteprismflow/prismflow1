import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AdminUser } from '../types';

export interface RateLimitStatus {
  isLocked: boolean;
  attempts: number;
  maxAttempts: number;
  remainingAttempts: number;
  lockoutUntil: number | null;
  remainingTimeMs: number;
}

const RATE_LIMIT_KEY = 'prism_admin_rate_limit';
const MAX_LOGIN_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 60 * 60 * 1000; // 1 hour

export const authService = {
  /**
   * Get current rate limit and lockout status
   */
  getRateLimitStatus: (): RateLimitStatus => {
    try {
      const raw = localStorage.getItem(RATE_LIMIT_KEY);
      if (!raw) {
        return {
          isLocked: false,
          attempts: 0,
          maxAttempts: MAX_LOGIN_ATTEMPTS,
          remainingAttempts: MAX_LOGIN_ATTEMPTS,
          lockoutUntil: null,
          remainingTimeMs: 0
        };
      }

      const data = JSON.parse(raw);
      const now = Date.now();

      // Check active lockout
      if (data.lockoutUntil && now < data.lockoutUntil) {
        return {
          isLocked: true,
          attempts: data.attempts || MAX_LOGIN_ATTEMPTS,
          maxAttempts: MAX_LOGIN_ATTEMPTS,
          remainingAttempts: 0,
          lockoutUntil: data.lockoutUntil,
          remainingTimeMs: data.lockoutUntil - now
        };
      }

      // Expired lockout - reset automatically
      if (data.lockoutUntil && now >= data.lockoutUntil) {
        localStorage.removeItem(RATE_LIMIT_KEY);
        return {
          isLocked: false,
          attempts: 0,
          maxAttempts: MAX_LOGIN_ATTEMPTS,
          remainingAttempts: MAX_LOGIN_ATTEMPTS,
          lockoutUntil: null,
          remainingTimeMs: 0
        };
      }

      const attempts = data.attempts || 0;
      return {
        isLocked: false,
        attempts,
        maxAttempts: MAX_LOGIN_ATTEMPTS,
        remainingAttempts: Math.max(0, MAX_LOGIN_ATTEMPTS - attempts),
        lockoutUntil: null,
        remainingTimeMs: 0
      };
    } catch {
      return {
        isLocked: false,
        attempts: 0,
        maxAttempts: MAX_LOGIN_ATTEMPTS,
        remainingAttempts: MAX_LOGIN_ATTEMPTS,
        lockoutUntil: null,
        remainingTimeMs: 0
      };
    }
  },

  /**
   * Record a failed credential attempt and lock for 1 hr if threshold reached
   */
  recordFailedAttempt: (): RateLimitStatus => {
    const current = authService.getRateLimitStatus();
    const newAttempts = current.attempts + 1;
    const now = Date.now();

    if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
      const lockoutUntil = now + LOCKOUT_DURATION_MS;
      const data = { attempts: newAttempts, lockoutUntil };
      try {
        localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
      } catch (err) {
        console.error('Failed to store rate limit lockout:', err);
      }
      return {
        isLocked: true,
        attempts: newAttempts,
        maxAttempts: MAX_LOGIN_ATTEMPTS,
        remainingAttempts: 0,
        lockoutUntil,
        remainingTimeMs: LOCKOUT_DURATION_MS
      };
    } else {
      const data = { attempts: newAttempts, lockoutUntil: null };
      try {
        localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
      } catch (err) {
        console.error('Failed to store rate limit attempt:', err);
      }
      return {
        isLocked: false,
        attempts: newAttempts,
        maxAttempts: MAX_LOGIN_ATTEMPTS,
        remainingAttempts: MAX_LOGIN_ATTEMPTS - newAttempts,
        lockoutUntil: null,
        remainingTimeMs: 0
      };
    }
  },

  /**
   * Reset rate limit upon successful authentication or admin clearing
   */
  resetRateLimit: (): void => {
    try {
      localStorage.removeItem(RATE_LIMIT_KEY);
    } catch (e) {}
  },
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
    // 1. Check rate limit lockout first
    const rateLimit = authService.getRateLimitStatus();
    if (rateLimit.isLocked) {
      const remainingMinutes = Math.max(1, Math.ceil(rateLimit.remainingTimeMs / 60000));
      return {
        success: false,
        error: `Security Lockout: 3 failed attempts reached. Access is locked for approximately ${remainingMinutes} minute(s).`
      };
    }

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
        // Record failed attempt
        const updatedRateLimit = authService.recordFailedAttempt();
        if (updatedRateLimit.isLocked) {
          return {
            success: false,
            error: 'Maximum of 3 failed attempts reached. For security, access has been locked for 1 hour.'
          };
        }
        return { 
          success: false, 
          error: `Invalid email or password. (${updatedRateLimit.remainingAttempts} attempt${updatedRateLimit.remainingAttempts === 1 ? '' : 's'} remaining before 1-hour security lockout)` 
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

      // Successful login resets rate limit counter
      authService.resetRateLimit();

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
