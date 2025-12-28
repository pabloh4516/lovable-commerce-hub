import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserWithRole {
  id: string;
  user_id: string;
  name: string;
  code: string;
  is_active: boolean;
  created_at: string;
  role: 'operator' | 'supervisor' | 'admin' | null;
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('name');

      if (profilesError) throw profilesError;

      const usersWithRoles: UserWithRole[] = await Promise.all(
        profiles.map(async (profile) => {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.user_id)
            .maybeSingle();

          return {
            ...profile,
            role: roleData?.role as 'operator' | 'supervisor' | 'admin' | null,
          };
        })
      );

      return usersWithRoles;
    },
  });
}

export function useUserMutations() {
  const queryClient = useQueryClient();

  const updateProfile = useMutation({
    mutationFn: async ({ userId, name, code, isActive }: { 
      userId: string; 
      name: string; 
      code: string;
      isActive: boolean;
    }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ name, code, is_active: isActive })
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuário atualizado!');
    },
    onError: () => {
      toast.error('Erro ao atualizar usuário');
    },
  });

  const updateRole = useMutation({
    mutationFn: async ({ userId, role }: { 
      userId: string; 
      role: 'operator' | 'supervisor' | 'admin';
    }) => {
      // First check if role exists
      const { data: existing } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('user_roles')
          .update({ role })
          .eq('user_id', userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Função atualizada!');
    },
    onError: () => {
      toast.error('Erro ao atualizar função');
    },
  });

  const toggleUserStatus = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: isActive })
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(variables.isActive ? 'Usuário ativado!' : 'Usuário desativado!');
    },
    onError: () => {
      toast.error('Erro ao alterar status');
    },
  });

  return { updateProfile, updateRole, toggleUserStatus };
}
