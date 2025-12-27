import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useCurrentStore } from './useStores';

export interface AuditLog {
  id: string;
  store_id?: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  reason?: string;
  supervisor_id?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export type AuditAction =
  | 'sale.create'
  | 'sale.cancel'
  | 'sale.item_cancel'
  | 'sale.discount'
  | 'register.open'
  | 'register.close'
  | 'register.withdrawal'
  | 'register.deposit'
  | 'product.create'
  | 'product.update'
  | 'product.delete'
  | 'product.price_change'
  | 'stock.adjust'
  | 'stock.transfer'
  | 'stock.receive'
  | 'promotion.create'
  | 'promotion.update'
  | 'promotion.delete'
  | 'user.login'
  | 'user.logout'
  | 'user.create'
  | 'user.update';

export function useAuditLogs(filters?: {
  storeId?: string;
  userId?: string;
  action?: string;
  entityType?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(filters?.limit || 100);

      if (filters?.storeId) {
        query = query.eq('store_id', filters.storeId);
      }
      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters?.action) {
        query = query.eq('action', filters.action);
      }
      if (filters?.entityType) {
        query = query.eq('entity_type', filters.entityType);
      }
      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString());
      }
      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AuditLog[];
    },
  });
}

export function useCreateAuditLog() {
  const { user, profile } = useAuth();
  const { data: currentStore } = useCurrentStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      action,
      entityType,
      entityId,
      oldValues,
      newValues,
      reason,
      supervisorId,
      metadata,
    }: {
      action: AuditAction;
      entityType: string;
      entityId?: string;
      oldValues?: Record<string, any>;
      newValues?: Record<string, any>;
      reason?: string;
      supervisorId?: string;
      metadata?: Record<string, any>;
    }) => {
      const { data, error } = await supabase.from('audit_logs').insert({
        store_id: currentStore?.id,
        user_id: user?.id,
        action,
        entity_type: entityType,
        entity_id: entityId,
        old_values: oldValues,
        new_values: newValues,
        reason,
        supervisor_id: supervisorId,
        user_agent: navigator.userAgent,
        metadata: {
          ...metadata,
          operator_name: profile?.name,
        },
      }).select().single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    },
  });
}

// Helper hook for quick audit logging
export function useAudit() {
  const createAuditLog = useCreateAuditLog();

  const log = async (
    action: AuditAction,
    entityType: string,
    options?: {
      entityId?: string;
      oldValues?: Record<string, any>;
      newValues?: Record<string, any>;
      reason?: string;
      supervisorId?: string;
      metadata?: Record<string, any>;
    }
  ) => {
    try {
      await createAuditLog.mutateAsync({
        action,
        entityType,
        ...options,
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  };

  return { log, isLogging: createAuditLog.isPending };
}
