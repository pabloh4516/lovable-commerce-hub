import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Commission {
  id: string;
  seller_id: string;
  sale_id: string | null;
  service_order_id: string | null;
  product_id: string | null;
  sale_total: number;
  commission_percent: number;
  commission_amount: number;
  status: 'pending' | 'paid';
  paid_date: string | null;
  notes: string | null;
  created_at: string;
  seller?: {
    name: string;
    code: string;
  };
}

export function useSellerCommissions(sellerId: string | undefined) {
  return useQuery({
    queryKey: ['seller_commissions', sellerId],
    queryFn: async () => {
      if (!sellerId) return [];
      
      const { data, error } = await supabase
        .from('commissions')
        .select('*')
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as Commission[];
    },
    enabled: !!sellerId,
  });
}

export function usePendingCommissions() {
  return useQuery({
    queryKey: ['pending_commissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('commissions')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Commission[];
    },
  });
}

export function useCommissionMutations() {
  const queryClient = useQueryClient();

  // Create commission for a sale
  const createCommission = useMutation({
    mutationFn: async ({ 
      sellerId,
      saleId,
      saleTotal,
      commissionPercent,
    }: { 
      sellerId: string;
      saleId: string;
      saleTotal: number;
      commissionPercent: number;
    }) => {
      const commissionAmount = (saleTotal * commissionPercent) / 100;

      const { data, error } = await supabase
        .from('commissions')
        .insert({
          seller_id: sellerId,
          sale_id: saleId,
          sale_total: saleTotal,
          commission_percent: commissionPercent,
          commission_amount: commissionAmount,
          status: 'pending',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as Commission;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller_commissions'] });
      queryClient.invalidateQueries({ queryKey: ['pending_commissions'] });
    },
  });

  // Mark commission as paid
  const payCommission = useMutation({
    mutationFn: async ({ commissionId }: { commissionId: string }) => {
      const { data, error } = await supabase
        .from('commissions')
        .update({
          status: 'paid',
          paid_date: new Date().toISOString(),
        })
        .eq('id', commissionId)
        .select()
        .single();
      
      if (error) throw error;
      return data as Commission;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller_commissions'] });
      queryClient.invalidateQueries({ queryKey: ['pending_commissions'] });
      toast.success('Comissão paga!');
    },
    onError: () => {
      toast.error('Erro ao pagar comissão');
    },
  });

  // Pay multiple commissions
  const payMultipleCommissions = useMutation({
    mutationFn: async ({ commissionIds }: { commissionIds: string[] }) => {
      const { error } = await supabase
        .from('commissions')
        .update({
          status: 'paid',
          paid_date: new Date().toISOString(),
        })
        .in('id', commissionIds);
      
      if (error) throw error;
      return commissionIds;
    },
    onSuccess: (ids) => {
      queryClient.invalidateQueries({ queryKey: ['seller_commissions'] });
      queryClient.invalidateQueries({ queryKey: ['pending_commissions'] });
      toast.success(`${ids.length} comissões pagas!`);
    },
    onError: () => {
      toast.error('Erro ao pagar comissões');
    },
  });

  return { createCommission, payCommission, payMultipleCommissions };
}

// Helper to calculate commission
export function calculateCommission(saleTotal: number, commissionPercent: number): number {
  return (saleTotal * commissionPercent) / 100;
}
