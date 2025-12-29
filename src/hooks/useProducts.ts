import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DbProduct {
  id: string;
  code: string;
  barcode: string | null;
  name: string;
  category_id: string | null;
  price: number;
  cost: number;
  stock: number;
  min_stock: number;
  unit: string;
  is_weighted: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  sort_order: number;
  is_active: boolean;
}

export function useProducts() {
  const query = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as DbProduct[];
    },
  });

  return {
    products: query.data || [],
    isLoading: query.isLoading,
    ...query,
  };
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      if (error) throw error;
      return data as DbCategory[];
    },
  });
}

export function useProductMutations() {
  const queryClient = useQueryClient();

  const createProduct = useMutation({
    mutationFn: async (product: Omit<DbProduct, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto criado com sucesso!');
    },
    onError: (error: Error) => {
      if (error.message.includes('duplicate key')) {
        toast.error('Já existe um produto com este código');
      } else {
        toast.error('Erro ao criar produto');
      }
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, ...product }: Partial<DbProduct> & { id: string }) => {
      const { data, error } = await supabase
        .from('products')
        .update(product)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto atualizado!');
    },
    onError: () => {
      toast.error('Erro ao atualizar produto');
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto excluído!');
    },
    onError: () => {
      toast.error('Erro ao excluir produto');
    },
  });

  return { createProduct, updateProduct, deleteProduct };
}
