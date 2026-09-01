import { AdminUser } from '../types';
import { getStoredItem, setStoredItem } from './storage';

const AUTH_KEY = 'prism_admin_user';

export const authService = {
  getCurrentUser: (): AdminUser | null => {
    return getStoredItem<AdminUser | null>(AUTH_KEY, null);
  },

  isAuthenticated: (): boolean => {
    return authService.getCurrentUser() !== null;
  },

  login: async (email: string, pass: string): Promise<{ success: boolean; user?: AdminUser; error?: string }> => {
    // Isolated mock authentication that can easily be replaced by supabase.auth.signInWithPassword later
    await new Promise((r) => setTimeout(r, 450)); // simulate sleek network auth delay
    
    // Accept standard demo admin or any legitimate looking admin credential
    if ((email === 'admin@prismflow.tech' || email === 'admin@prismflow.com' || email.includes('@')) && pass.length >= 4) {
      const user: AdminUser = {
        id: 'usr_admin_01',
        email: email.toLowerCase(),
        name: 'Prism Flow Admin',
        role: 'superadmin'
      };
      setStoredItem(AUTH_KEY, user);
      return { success: true, user };
    }

    return { success: false, error: 'Invalid credentials. Use admin@prismflow.tech / admin123' };
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem(AUTH_KEY);
    setStoredItem(AUTH_KEY, null);
  }
};
