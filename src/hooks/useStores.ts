import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

export interface Store {
  id: string;
  code: string;
  name: string;
  cnpj?: string;
  ie?: string;
  address?: string;
  city?: string;
  state?: string;
  cep?: string;
  phone?: string;
  email?: string;
  is_matrix: boolean;
  parent_store_id?: string;
  timezone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoreUser {
  id: string;
  store_id: string;
  user_id: string;
  is_primary: boolean;
  can_transfer: boolean;
  created_at: string;
  store?: Store;
}

export function useStores() {
  return useQuery({
    queryKey: ['stores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('is_active', true)
        .order('code');

      if (error) throw error;
      return data as Store[];
    },
  });
}

export function useUserStores() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-stores', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('store_users')
        .select(`
          *,
          store:stores(*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      return data as (StoreUser & { store: Store })[];
    },
    enabled: !!user?.id,
  });
}

export function useCurrentStore() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['current-store', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('store_users')
        .select(`
          *,
          store:stores(*)
        `)
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .maybeSingle();

      if (error) throw error;
      return data?.store as Store | null;
    },
    enabled: !!user?.id,
  });
}

export function useStoreMutations() {
  const queryClient = useQueryClient();

  const createStore = useMutation({
    mutationFn: async (store: Omit<Store, 'id' | 'created_at' | 'updated_at'> & { id?: string }) => {
      const { data, error } = await supabase
        .from('stores')
        .insert([{
          code: store.code,
          name: store.name,
          cnpj: store.cnpj,
          ie: store.ie,
          address: store.address,
          city: store.city,
          state: store.state,
          cep: store.cep,
          phone: store.phone,
          email: store.email,
          is_matrix: store.is_matrix,
          parent_store_id: store.parent_store_id,
          timezone: store.timezone,
          is_active: store.is_active ?? true,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      toast.success('Loja criada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao criar loja: ' + error.message);
    },
  });

  const updateStore = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Store> & { id: string }) => {
      const { data, error } = await supabase
        .from('stores')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      toast.success('Loja atualizada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar loja: ' + error.message);
    },
  });

  const assignUserToStore = useMutation({
    mutationFn: async ({
      storeId,
      userId,
      isPrimary = false,
      canTransfer = false,
    }: {
      storeId: string;
      userId: string;
      isPrimary?: boolean;
      canTransfer?: boolean;
    }) => {
      // If setting as primary, remove other primary flags first
      if (isPrimary) {
        await supabase
          .from('store_users')
          .update({ is_primary: false })
          .eq('user_id', userId);
      }

      const { data, error } = await supabase
        .from('store_users')
        .upsert({
          store_id: storeId,
          user_id: userId,
          is_primary: isPrimary,
          can_transfer: canTransfer,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-stores'] });
      queryClient.invalidateQueries({ queryKey: ['current-store'] });
      toast.success('Usuário vinculado à loja!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao vincular usuário: ' + error.message);
    },
  });

  return { createStore, updateStore, assignUserToStore };
}
