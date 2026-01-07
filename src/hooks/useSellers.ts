import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Seller {
  id: string;
  user_id: string;
  name: string;
  code: string;
  commission_percent: number | null;
  daily_goal: number | null;
  monthly_goal: number | null;
  is_active: boolean;
  image_url: string | null;
}

export function useSellers() {
  return useQuery({
    queryKey: ['sellers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as Seller[];
    },
  });
}

export function useSellerById(sellerId: string | undefined) {
  return useQuery({
    queryKey: ['seller', sellerId],
    queryFn: async () => {
      if (!sellerId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', sellerId)
        .maybeSingle();
      
      if (error) throw error;
      return data as Seller | null;
    },
    enabled: !!sellerId,
  });
}

export function useSellerStats(sellerId: string | undefined) {
  return useQuery({
    queryKey: ['seller_stats', sellerId],
    queryFn: async () => {
      if (!sellerId) return null;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      // Get today's sales for this seller
      const { data: todaySales } = await supabase
        .from('sales')
        .select('total')
        .eq('seller_id', sellerId)
        .eq('status', 'completed')
        .gte('created_at', today.toISOString());

      // Get month's sales for this seller
      const { data: monthSales } = await supabase
        .from('sales')
        .select('total')
        .eq('seller_id', sellerId)
        .eq('status', 'completed')
        .gte('created_at', firstDayOfMonth.toISOString());

      // Get pending commissions
      const { data: pendingCommissions } = await supabase
        .from('commissions')
        .select('commission_amount')
        .eq('seller_id', sellerId)
        .eq('status', 'pending');

      const dailyTotal = todaySales?.reduce((sum, s) => sum + Number(s.total), 0) || 0;
      const monthlyTotal = monthSales?.reduce((sum, s) => sum + Number(s.total), 0) || 0;
      const pendingCommissionsTotal = pendingCommissions?.reduce((sum, c) => sum + Number(c.commission_amount), 0) || 0;

      return {
        dailyTotal,
        dailySalesCount: todaySales?.length || 0,
        monthlyTotal,
        monthlySalesCount: monthSales?.length || 0,
        pendingCommissions: pendingCommissionsTotal,
      };
    },
    enabled: !!sellerId,
  });
}
