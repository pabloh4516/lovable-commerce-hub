import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCurrentStore } from './useStores';

export interface LoyaltyProgram {
  id: string;
  name: string;
  description?: string;
  points_per_real: number;
  min_points_redeem: number;
  points_value: number;
  is_active: boolean;
  store_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerPoints {
  id: string;
  customer_id: string;
  program_id: string;
  total_points: number;
  available_points: number;
  redeemed_points: number;
  created_at: string;
  updated_at: string;
  loyalty_programs?: LoyaltyProgram;
}

export interface PointTransaction {
  id: string;
  customer_id: string;
  program_id: string;
  sale_id?: string;
  type: 'earn' | 'redeem' | 'expire' | 'adjustment';
  points: number;
  description?: string;
  created_at: string;
  operator_id?: string;
}

// Hook para buscar programas de fidelidade ativos
export function useLoyaltyPrograms() {
  const { data: currentStore } = useCurrentStore();

  return useQuery({
    queryKey: ['loyalty-programs', currentStore?.id],
    queryFn: async () => {
      let query = supabase
        .from('loyalty_programs')
        .select('*')
        .eq('is_active', true);

      // Filtrar por loja se disponível
      if (currentStore?.id) {
        query = query.or(`store_id.is.null,store_id.eq.${currentStore.id}`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data as LoyaltyProgram[];
    },
  });
}

// Hook para buscar pontos de um cliente
export function useCustomerPoints(customerId?: string) {
  return useQuery({
    queryKey: ['customer-points', customerId],
    queryFn: async () => {
      if (!customerId) return null;

      const { data, error } = await supabase
        .from('customer_points')
        .select(`
          *,
          loyalty_programs(*)
        `)
        .eq('customer_id', customerId)
        .maybeSingle();

      if (error) throw error;
      return data as CustomerPoints | null;
    },
    enabled: !!customerId,
  });
}

// Hook para buscar transações de pontos de um cliente
export function usePointTransactions(customerId?: string) {
  return useQuery({
    queryKey: ['point-transactions', customerId],
    queryFn: async () => {
      if (!customerId) return [];

      const { data, error } = await supabase
        .from('point_transactions')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as PointTransaction[];
    },
    enabled: !!customerId,
  });
}

// Hook de mutações para fidelidade
export function useLoyaltyMutations() {
  const queryClient = useQueryClient();

  // Acumular pontos após venda
  const earnPoints = useMutation({
    mutationFn: async ({
      customerId,
      programId,
      saleId,
      saleTotal,
      operatorId,
    }: {
      customerId: string;
      programId: string;
      saleId: string;
      saleTotal: number;
      operatorId?: string;
    }) => {
      // Buscar programa para calcular pontos
      const { data: program, error: programError } = await supabase
        .from('loyalty_programs')
        .select('points_per_real')
        .eq('id', programId)
        .single();

      if (programError) throw programError;

      const pointsToEarn = Math.floor(saleTotal * program.points_per_real);
      if (pointsToEarn <= 0) return null;

      // Upsert pontos do cliente
      const { data: existingPoints } = await supabase
        .from('customer_points')
        .select('*')
        .eq('customer_id', customerId)
        .eq('program_id', programId)
        .maybeSingle();

      if (existingPoints) {
        const { error: updateError } = await supabase
          .from('customer_points')
          .update({
            total_points: existingPoints.total_points + pointsToEarn,
            available_points: existingPoints.available_points + pointsToEarn,
          })
          .eq('id', existingPoints.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('customer_points')
          .insert({
            customer_id: customerId,
            program_id: programId,
            total_points: pointsToEarn,
            available_points: pointsToEarn,
          });

        if (insertError) throw insertError;
      }

      // Registrar transação
      const { error: transError } = await supabase
        .from('point_transactions')
        .insert({
          customer_id: customerId,
          program_id: programId,
          sale_id: saleId,
          type: 'earn',
          points: pointsToEarn,
          description: `Pontos ganhos na venda`,
          operator_id: operatorId,
        });

      if (transError) throw transError;

      return pointsToEarn;
    },
    onSuccess: (points, { customerId }) => {
      queryClient.invalidateQueries({ queryKey: ['customer-points', customerId] });
      queryClient.invalidateQueries({ queryKey: ['point-transactions', customerId] });
      if (points && points > 0) {
        toast.success(`🎉 Cliente ganhou ${points} pontos!`);
      }
    },
  });

  // Resgatar pontos
  const redeemPoints = useMutation({
    mutationFn: async ({
      customerId,
      programId,
      pointsToRedeem,
      operatorId,
    }: {
      customerId: string;
      programId: string;
      pointsToRedeem: number;
      operatorId?: string;
    }) => {
      // Buscar pontos atuais
      const { data: currentPoints, error: pointsError } = await supabase
        .from('customer_points')
        .select('*, loyalty_programs(*)')
        .eq('customer_id', customerId)
        .eq('program_id', programId)
        .single();

      if (pointsError) throw pointsError;

      if (currentPoints.available_points < pointsToRedeem) {
        throw new Error('Pontos insuficientes');
      }

      const program = currentPoints.loyalty_programs as LoyaltyProgram;
      if (pointsToRedeem < program.min_points_redeem) {
        throw new Error(`Mínimo de ${program.min_points_redeem} pontos para resgate`);
      }

      const discountValue = pointsToRedeem * program.points_value;

      // Atualizar pontos
      const { error: updateError } = await supabase
        .from('customer_points')
        .update({
          available_points: currentPoints.available_points - pointsToRedeem,
          redeemed_points: currentPoints.redeemed_points + pointsToRedeem,
        })
        .eq('id', currentPoints.id);

      if (updateError) throw updateError;

      // Registrar transação
      const { error: transError } = await supabase
        .from('point_transactions')
        .insert({
          customer_id: customerId,
          program_id: programId,
          type: 'redeem',
          points: -pointsToRedeem,
          description: `Resgate de ${pointsToRedeem} pontos (R$ ${discountValue.toFixed(2)})`,
          operator_id: operatorId,
        });

      if (transError) throw transError;

      return { pointsRedeemed: pointsToRedeem, discountValue };
    },
    onSuccess: (result, { customerId }) => {
      queryClient.invalidateQueries({ queryKey: ['customer-points', customerId] });
      queryClient.invalidateQueries({ queryKey: ['point-transactions', customerId] });
      toast.success(`🎁 ${result.pointsRedeemed} pontos resgatados = R$ ${result.discountValue.toFixed(2)}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Criar programa de fidelidade
  const createProgram = useMutation({
    mutationFn: async (program: Partial<LoyaltyProgram>) => {
      const { data, error } = await supabase
        .from('loyalty_programs')
        .insert({
          name: program.name!,
          description: program.description,
          points_per_real: program.points_per_real ?? 1,
          min_points_redeem: program.min_points_redeem ?? 100,
          points_value: program.points_value ?? 0.01,
          store_id: program.store_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty-programs'] });
      toast.success('Programa de fidelidade criado!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao criar programa: ' + error.message);
    },
  });

  return { earnPoints, redeemPoints, createProgram };
}

// Calculadora de pontos
export function usePointsCalculator() {
  const { data: programs } = useLoyaltyPrograms();

  const calculateEarnablePoints = (total: number): number => {
    if (!programs?.length) return 0;
    const program = programs[0]; // Usa o programa ativo
    return Math.floor(total * program.points_per_real);
  };

  const calculateRedeemValue = (points: number): number => {
    if (!programs?.length) return 0;
    const program = programs[0];
    return points * program.points_value;
  };

  return {
    calculateEarnablePoints,
    calculateRedeemValue,
    activeProgram: programs?.[0] || null,
  };
}
