import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DbCustomer {
  id: string;
  name: string;
  cpf: string | null;
  cnpj: string | null;
  rg: string | null;
  ie: string | null;
  fantasy_name: string | null;
  phone: string | null;
  phone2: string | null;
  email: string | null;
  address: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  cep: string | null;
  birth_date: string | null;
  gender: string | null;
  profession: string | null;
  workplace: string | null;
  income: number | null;
  credit_limit: number;
  current_debt: number;
  is_active: boolean;
  is_blocked: boolean | null;
  block_reason: string | null;
  notes: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export function useCustomers() {
  const queryClient = useQueryClient();

  const query = useQuery({
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

  const deleteCustomer = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('customers')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Cliente excluído!');
    },
    onError: () => {
      toast.error('Erro ao excluir cliente');
    },
  });

  return {
    customers: query.data || [],
    isLoading: query.isLoading,
    createCustomer: createCustomer.mutateAsync,
    updateCustomer: updateCustomer.mutateAsync,
    deleteCustomer: deleteCustomer.mutateAsync,
  };
}
