import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PaymentMethod {
  id: string;
  code: string;
  name: string;
  type: 'cash' | 'credit' | 'debit' | 'pix' | 'boleto' | 'check' | 'fiado' | 'other';
  fee_percent: number;
  fee_fixed: number;
  installments_max: number;
  days_to_receive: number;
  is_active: boolean;
  requires_customer: boolean;
  sort_order: number;
  created_at: string;
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: ['payment_methods'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      if (error) throw error;
      return data as PaymentMethod[];
    },
  });
}

export function usePaymentMethodMutations() {
  const queryClient = useQueryClient();

  const createPaymentMethod = useMutation({
    mutationFn: async (method: Omit<PaymentMethod, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('payment_methods')
        .insert(method)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment_methods'] });
      toast.success('Forma de pagamento criada!');
    },
    onError: (error: Error) => {
      if (error.message.includes('duplicate key')) {
        toast.error('Código já existe');
      } else {
        toast.error('Erro ao criar forma de pagamento');
      }
    },
  });

  const updatePaymentMethod = useMutation({
    mutationFn: async ({ id, ...method }: Partial<PaymentMethod> & { id: string }) => {
      const { data, error } = await supabase
        .from('payment_methods')
        .update(method)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment_methods'] });
      toast.success('Forma de pagamento atualizada!');
    },
    onError: () => {
      toast.error('Erro ao atualizar forma de pagamento');
    },
  });

  const deletePaymentMethod = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment_methods'] });
      toast.success('Forma de pagamento removida!');
    },
    onError: () => {
      toast.error('Erro ao remover forma de pagamento');
    },
  });

  return { createPaymentMethod, updatePaymentMethod, deletePaymentMethod };
}
