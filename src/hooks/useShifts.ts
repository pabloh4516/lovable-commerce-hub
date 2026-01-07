import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface RegisterShift {
  id: string;
  register_id: string;
  operator_id: string;
  started_at: string;
  ended_at: string | null;
  starting_cash: number;
  ending_cash: number | null;
  sales_count: number;
  sales_total: number;
  cash_total: number;
  pix_total: number;
  credit_total: number;
  debit_total: number;
  fiado_total: number;
  withdrawals_total: number;
  deposits_total: number;
  status: 'active' | 'closed';
  notes: string | null;
  created_at: string;
  operator?: {
    name: string;
    code: string;
  };
}

// Get current active shift for a register
export function useActiveShift(registerId: string | undefined) {
  return useQuery({
    queryKey: ['active_shift', registerId],
    queryFn: async () => {
      if (!registerId) return null;
      
      const { data, error } = await supabase
        .from('register_shifts')
        .select('*')
        .eq('register_id', registerId)
        .eq('status', 'active')
        .maybeSingle();
      
      if (error) throw error;
      return data as RegisterShift | null;
    },
    enabled: !!registerId,
  });
}

// Get all shifts for a register
export function useRegisterShifts(registerId: string | undefined) {
  return useQuery({
    queryKey: ['register_shifts', registerId],
    queryFn: async () => {
      if (!registerId) return [];
      
      const { data, error } = await supabase
        .from('register_shifts')
        .select('*')
        .eq('register_id', registerId)
        .order('started_at', { ascending: false });
      
      if (error) throw error;
      return data as RegisterShift[];
    },
    enabled: !!registerId,
  });
}

// Get today's shifts
export function useTodayShifts() {
  return useQuery({
    queryKey: ['today_shifts'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('register_shifts')
        .select('*')
        .gte('started_at', today.toISOString())
        .order('started_at', { ascending: false });
      
      if (error) throw error;
      return data as RegisterShift[];
    },
  });
}

export function useShiftMutations() {
  const queryClient = useQueryClient();

  // Start a new shift
  const startShift = useMutation({
    mutationFn: async ({ 
      registerId, 
      startingCash 
    }: { 
      registerId: string; 
      startingCash: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('register_shifts')
        .insert({
          register_id: registerId,
          operator_id: user.id,
          starting_cash: startingCash,
          status: 'active',
        })
        .select()
        .single();
      
      if (error) throw error;

      // Update register's current_shift_id
      await supabase
        .from('cash_registers')
        .update({ current_shift_id: data.id })
        .eq('id', registerId);

      return data as RegisterShift;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active_shift'] });
      queryClient.invalidateQueries({ queryKey: ['register_shifts'] });
      queryClient.invalidateQueries({ queryKey: ['open_register'] });
      toast.success('Turno iniciado!');
    },
    onError: () => {
      toast.error('Erro ao iniciar turno');
    },
  });

  // End current shift
  const endShift = useMutation({
    mutationFn: async ({ 
      shiftId, 
      endingCash,
      notes,
    }: { 
      shiftId: string; 
      endingCash: number;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('register_shifts')
        .update({
          ended_at: new Date().toISOString(),
          ending_cash: endingCash,
          status: 'closed',
          notes,
        })
        .eq('id', shiftId)
        .select()
        .single();
      
      if (error) throw error;
      return data as RegisterShift;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active_shift'] });
      queryClient.invalidateQueries({ queryKey: ['register_shifts'] });
      toast.success('Turno encerrado!');
    },
    onError: () => {
      toast.error('Erro ao encerrar turno');
    },
  });

  // Change shift (end current, start new)
  const changeShift = useMutation({
    mutationFn: async ({ 
      currentShiftId,
      registerId,
      countedCash,
      notes,
    }: { 
      currentShiftId: string;
      registerId: string;
      countedCash: number;
      notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // End current shift
      await supabase
        .from('register_shifts')
        .update({
          ended_at: new Date().toISOString(),
          ending_cash: countedCash,
          status: 'closed',
          notes,
        })
        .eq('id', currentShiftId);

      // Start new shift
      const { data: newShift, error } = await supabase
        .from('register_shifts')
        .insert({
          register_id: registerId,
          operator_id: user.id,
          starting_cash: countedCash,
          status: 'active',
        })
        .select()
        .single();
      
      if (error) throw error;

      // Update register's current_shift_id
      await supabase
        .from('cash_registers')
        .update({ current_shift_id: newShift.id })
        .eq('id', registerId);

      return newShift as RegisterShift;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active_shift'] });
      queryClient.invalidateQueries({ queryKey: ['register_shifts'] });
      queryClient.invalidateQueries({ queryKey: ['open_register'] });
      toast.success('Troca de turno realizada!');
    },
    onError: () => {
      toast.error('Erro na troca de turno');
    },
  });

  // Update shift totals after a sale
  const updateShiftTotals = useMutation({
    mutationFn: async ({ 
      shiftId,
      saleTotal,
      cashAmount,
      pixAmount,
      creditAmount,
      debitAmount,
      fiadoAmount,
    }: { 
      shiftId: string;
      saleTotal: number;
      cashAmount: number;
      pixAmount: number;
      creditAmount: number;
      debitAmount: number;
      fiadoAmount: number;
    }) => {
      // Get current shift values
      const { data: shift } = await supabase
        .from('register_shifts')
        .select('*')
        .eq('id', shiftId)
        .single();

      if (!shift) throw new Error('Turno não encontrado');

      const { data, error } = await supabase
        .from('register_shifts')
        .update({
          sales_count: (shift.sales_count || 0) + 1,
          sales_total: (shift.sales_total || 0) + saleTotal,
          cash_total: (shift.cash_total || 0) + cashAmount,
          pix_total: (shift.pix_total || 0) + pixAmount,
          credit_total: (shift.credit_total || 0) + creditAmount,
          debit_total: (shift.debit_total || 0) + debitAmount,
          fiado_total: (shift.fiado_total || 0) + fiadoAmount,
        })
        .eq('id', shiftId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active_shift'] });
    },
  });

  return { startShift, endShift, changeShift, updateShiftTotals };
}
