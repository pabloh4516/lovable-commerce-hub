import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Permission {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
}

export function usePermissions() {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      return data as Permission[];
    },
  });
}

export function useUserPermissions() {
  const { role } = useAuth();

  return useQuery({
    queryKey: ['user-permissions', role],
    queryFn: async () => {
      if (!role) return [];

      const { data, error } = await supabase
        .from('role_permissions')
        .select(`
          permission:permissions(*)
        `)
        .eq('role', role);

      if (error) throw error;
      return data?.map((rp: any) => rp.permission) as Permission[];
    },
    enabled: !!role,
  });
}

export function useHasPermission() {
  const { data: userPermissions, isLoading } = useUserPermissions();
  const { isAdmin } = useAuth();

  const hasPermission = (permissionCode: string): boolean => {
    // Admins have all permissions
    if (isAdmin) return true;
    
    if (!userPermissions) return false;
    return userPermissions.some((p) => p.code === permissionCode);
  };

  const hasAnyPermission = (permissionCodes: string[]): boolean => {
    if (isAdmin) return true;
    return permissionCodes.some((code) => hasPermission(code));
  };

  const hasAllPermissions = (permissionCodes: string[]): boolean => {
    if (isAdmin) return true;
    return permissionCodes.every((code) => hasPermission(code));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isLoading,
    permissions: userPermissions || [],
  };
}

// Permission codes as constants for type safety
export const PERMISSIONS = {
  // Sales
  SALE_CREATE: 'sale.create',
  SALE_CANCEL: 'sale.cancel',
  SALE_CANCEL_ITEM: 'sale.cancel_item',
  SALE_DISCOUNT: 'sale.discount',
  SALE_DISCOUNT_ABOVE_LIMIT: 'sale.discount_above_limit',
  // Register
  REGISTER_OPEN: 'register.open',
  REGISTER_CLOSE: 'register.close',
  REGISTER_WITHDRAWAL: 'register.withdrawal',
  REGISTER_DEPOSIT: 'register.deposit',
  // Products
  PRODUCT_VIEW: 'product.view',
  PRODUCT_CREATE: 'product.create',
  PRODUCT_EDIT: 'product.edit',
  PRODUCT_DELETE: 'product.delete',
  PRODUCT_PRICE_CHANGE: 'product.price_change',
  // Stock
  STOCK_VIEW: 'stock.view',
  STOCK_ADJUST: 'stock.adjust',
  STOCK_TRANSFER: 'stock.transfer',
  STOCK_RECEIVE: 'stock.receive',
  // Promotions
  PROMOTION_VIEW: 'promotion.view',
  PROMOTION_CREATE: 'promotion.create',
  PROMOTION_EDIT: 'promotion.edit',
  PROMOTION_DELETE: 'promotion.delete',
  // Reports
  REPORT_SALES: 'report.sales',
  REPORT_STOCK: 'report.stock',
  REPORT_FINANCIAL: 'report.financial',
  REPORT_AUDIT: 'report.audit',
  // Admin
  ADMIN_USERS: 'admin.users',
  ADMIN_STORES: 'admin.stores',
  ADMIN_SETTINGS: 'admin.settings',
} as const;
