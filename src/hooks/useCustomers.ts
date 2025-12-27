import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DbCustomer {
  id: string;
  name: string;
  cpf: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  credit_limit: number;
  current_debt: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as DbCustomer[];
    },
  });
}

export function useCustomerMutations() {
  const queryClient = useQueryClient();

  const createCustomer = useMutation({
    mutationFn: async (customer: Omit<DbCustomer, 'id' | 'created_at' | 'updated_at' | 'is_active'>) => {
      const { data, error } = await supabase
        .from('customers')
        .insert(customer)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Cliente cadastrado!');
    },
    onError: (error: Error) => {
      if (error.message.includes('duplicate key')) {
        toast.error('CPF já cadastrado');
      } else {
        toast.error('Erro ao cadastrar cliente');
      }
    },
  });

  const updateCustomer = useMutation({
    mutationFn: async ({ id, ...customer }: Partial<DbCustomer> & { id: string }) => {
      const { data, error } = await supabase
        .from('customers')
        .update(customer)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Cliente atualizado!');
    },
    onError: () => {
      toast.error('Erro ao atualizar cliente');
    },
  });

  return { createCustomer, updateCustomer };
}
