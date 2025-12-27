import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DbCashRegister {
  id: string;
  number: number;
  operator_id: string;
  opened_at: string;
  closed_at: string | null;
  opening_balance: number;
  closing_balance: number | null;
  expected_balance: number | null;
  difference: number | null;
  status: 'open' | 'closed';
  total_sales: number;
  total_cash: number;
  total_pix: number;
  total_credit: number;
  total_debit: number;
  total_fiado: number;
}

export function useOpenRegister() {
  return useQuery({
    queryKey: ['open_register'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('cash_registers')
        .select('*')
        .eq('operator_id', user.id)
        .eq('status', 'open')
        .maybeSingle();
      
      if (error) throw error;
      return data as DbCashRegister | null;
    },
  });
}

export function useCashRegisterMutations() {
  const queryClient = useQueryClient();

  const openRegister = useMutation({
    mutationFn: async ({ openingBalance, registerNumber }: { openingBalance: number; registerNumber: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('cash_registers')
        .insert({
          number: registerNumber,
          operator_id: user.id,
          opening_balance: openingBalance,
          status: 'open',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['open_register'] });
      toast.success('Caixa aberto com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao abrir caixa');
    },
  });

  const closeRegister = useMutation({
    mutationFn: async ({ registerId, closingBalance }: { registerId: string; closingBalance: number }) => {
      const { data: register } = await supabase
        .from('cash_registers')
        .select('*')
        .eq('id', registerId)
        .single();

      if (!register) throw new Error('Caixa não encontrado');

      const expectedBalance = 
        register.opening_balance + 
        register.total_cash - 
        (register.total_fiado || 0);

      const { data, error } = await supabase
        .from('cash_registers')
        .update({
          closed_at: new Date().toISOString(),
          closing_balance: closingBalance,
          expected_balance: expectedBalance,
          difference: closingBalance - expectedBalance,
          status: 'closed',
        })
        .eq('id', registerId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['open_register'] });
      toast.success('Caixa fechado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao fechar caixa');
    },
  });

  const createMovement = useMutation({
    mutationFn: async ({ 
      registerId, 
      type, 
      amount, 
      reason 
    }: { 
      registerId: string; 
      type: 'withdrawal' | 'deposit'; 
      amount: number; 
      reason: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('cash_movements')
        .insert({
          register_id: registerId,
          type,
          amount,
          reason,
          operator_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;

      // Update register cash total
      const { data: register } = await supabase
        .from('cash_registers')
        .select('total_cash')
        .eq('id', registerId)
        .single();

      if (register) {
        const newCash = type === 'deposit' 
          ? register.total_cash + amount 
          : register.total_cash - amount;

        await supabase
          .from('cash_registers')
          .update({ total_cash: newCash })
          .eq('id', registerId);
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['open_register'] });
      toast.success(variables.type === 'deposit' ? 'Suprimento registrado!' : 'Sangria registrada!');
    },
    onError: () => {
      toast.error('Erro ao registrar movimentação');
    },
  });

  return { openRegister, closeRegister, createMovement };
}
