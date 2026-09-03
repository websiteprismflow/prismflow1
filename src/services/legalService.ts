import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { LegalClause, PolicyType } from '../types';

export const legalService = {
  /**
   * Public query: retrieve published clauses for a given policy type, ordered by clause_order ASC.
   */
  getPublishedClauses: async (policyType: PolicyType): Promise<LegalClause[]> => {
    if (!isSupabaseConfigured()) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('legal_clauses')
        .select('*')
        .eq('policy_type', policyType)
        .eq('published_live', true)
        .order('clause_order', { ascending: true });

      if (error) {
        console.error(`PrismFlow legalService.getPublishedClauses (${policyType}) error:`, error.message);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('PrismFlow legalService.getPublishedClauses exception:', err);
      return [];
    }
  },

  /**
   * Admin query: retrieve all clauses (published and unpublished) for a given policy type, ordered by clause_order ASC.
   */
  getAllClausesAdmin: async (policyType: PolicyType): Promise<LegalClause[]> => {
    if (!isSupabaseConfigured()) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('legal_clauses')
        .select('*')
        .eq('policy_type', policyType)
        .order('clause_order', { ascending: true });

      if (error) {
        console.error(`PrismFlow legalService.getAllClausesAdmin (${policyType}) error:`, error.message);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('PrismFlow legalService.getAllClausesAdmin exception:', err);
      return [];
    }
  },

  /**
   * Add a new clause.
   */
  createClause: async (data: {
    policy_type: PolicyType;
    clause_heading: string;
    clause_content: string;
    clause_order?: number;
    published_live?: boolean;
  }): Promise<{ success: boolean; data?: LegalClause; error?: string }> => {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database is not configured' };
    }

    try {
      let order = data.clause_order;
      if (order === undefined) {
        // Find max order currently in database for this policy type
        const existing = await legalService.getAllClausesAdmin(data.policy_type);
        order = existing.length > 0 ? Math.max(...existing.map((c) => c.clause_order)) + 1 : 1;
      }

      const { data: inserted, error } = await supabase
        .from('legal_clauses')
        .insert({
          policy_type: data.policy_type,
          clause_heading: data.clause_heading.trim(),
          clause_content: data.clause_content.trim(),
          clause_order: order,
          published_live: data.published_live !== undefined ? data.published_live : true,
        })
        .select()
        .single();

      if (error || !inserted) {
        console.error('PrismFlow legalService.createClause error:', error?.message);
        return { success: false, error: error?.message || 'Failed to create clause' };
      }

      return { success: true, data: inserted };
    } catch (err) {
      console.error('PrismFlow legalService.createClause exception:', err);
      return { success: false, error: 'Failed to create clause' };
    }
  },

  /**
   * Update an existing clause.
   */
  updateClause: async (id: string, data: Partial<{
    clause_heading: string;
    clause_content: string;
    clause_order: number;
    published_live: boolean;
  }>): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database is not configured' };
    }

    try {
      const payload: any = { ...data, updated_at: new Date().toISOString() };
      const { error } = await supabase
        .from('legal_clauses')
        .update(payload)
        .eq('id', id);

      if (error) {
        console.error('PrismFlow legalService.updateClause error:', error.message);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      console.error('PrismFlow legalService.updateClause exception:', err);
      return { success: false, error: 'Failed to update clause' };
    }
  },

  /**
   * Toggle published_live for a clause.
   */
  togglePublish: async (id: string, currentStatus: boolean): Promise<{ success: boolean; error?: string }> => {
    return legalService.updateClause(id, { published_live: !currentStatus });
  },

  /**
   * Delete a clause.
   */
  deleteClause: async (id: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database is not configured' };
    }

    try {
      const { error } = await supabase
        .from('legal_clauses')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('PrismFlow legalService.deleteClause error:', error.message);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      console.error('PrismFlow legalService.deleteClause exception:', err);
      return { success: false, error: 'Failed to delete clause' };
    }
  },

  /**
   * Reorder clauses by updating clause_order sequentially.
   */
  reorderClauses: async (orderedClauses: { id: string; clause_order: number }[]): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database is not configured' };
    }

    try {
      // Update each clause's order
      const promises = orderedClauses.map((c) =>
        supabase
          .from('legal_clauses')
          .update({ clause_order: c.clause_order, updated_at: new Date().toISOString() })
          .eq('id', c.id)
      );

      const results = await Promise.all(promises);
      const failed = results.find((r) => r.error);

      if (failed?.error) {
        console.error('PrismFlow legalService.reorderClauses error:', failed.error.message);
        return { success: false, error: failed.error.message };
      }

      return { success: true };
    } catch (err) {
      console.error('PrismFlow legalService.reorderClauses exception:', err);
      return { success: false, error: 'Failed to reorder clauses' };
    }
  }
};
