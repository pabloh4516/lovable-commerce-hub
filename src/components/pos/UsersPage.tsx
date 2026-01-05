import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  UserPlus, 
  Shield, 
  ShieldCheck, 
  User, 
  Loader2, 
  Edit2, 
  MoreHorizontal,
  UserCheck,
  UserX,
  Building2,
  Users,
  Filter
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUsers, useUserMutations, UserWithRole } from '@/hooks/useUsers';
import { useStores, useStoreMutations } from '@/hooks/useStores';
import { UserEditModal } from './UserEditModal';
import { UserCreateModal } from './UserCreateModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ModernPageHeader, ModernStatCard, ModernSearchBar, ModernCard, ModernEmptyState } from './common';

export function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [statusChangeUser, setStatusChangeUser] = useState<UserWithRole | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { isAdmin, isSupervisor } = useAuth();
  const { data: users = [], isLoading } = useUsers();
  const { toggleUserStatus } = useUserMutations();
  const { data: stores = [] } = useStores();
  const { assignUserToStore } = useStoreMutations();

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter || (roleFilter === 'operator' && !user.role);
    return matchesSearch && matchesRole;
  });

  const userCounts = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    supervisors: users.filter(u => u.role === 'supervisor').length,
    operators: users.filter(u => !u.role || u.role === 'operator').length,
  };

  const getRoleBadge = (role: string | null) => {
    switch (role) {
      case 'admin':
        return (
          <Badge variant="default" className="gap-1">
            <Shield className="w-3 h-3" />
            Admin
          </Badge>
        );
      case 'supervisor':
        return (
          <Badge className="gap-1 bg-amber-500/10 text-amber-600 border-amber-500/20">
            <ShieldCheck className="w-3 h-3" />
            Supervisor
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <User className="w-3 h-3" />
            Operador
          </Badge>
        );
    }
  };

  const handleToggleStatus = async () => {
    if (!statusChangeUser) return;
    await toggleUserStatus.mutateAsync({
      userId: statusChangeUser.user_id,
      isActive: !statusChangeUser.is_active,
    });
    setStatusChangeUser(null);
  };

  const handleAssignStore = async (userId: string, storeId: string) => {
    await assignUserToStore.mutateAsync({
      userId,
      storeId,
      isPrimary: true,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in h-full overflow-auto">
      <ModernPageHeader
        title="Gestão de Usuários"
        subtitle="Cadastre e gerencie gerentes e funcionários"
        icon={Users}
        actions={
          (isAdmin || isSupervisor || users.length === 0) && (
            <Button className="gap-2" onClick={() => setIsCreateModalOpen(true)}>
              <UserPlus className="w-4 h-4" />
              Novo Usuário
            </Button>
          )
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ModernStatCard
          title="Total"
          value={userCounts.total}
          icon={Users}
          variant="blue"
        />
        <ModernStatCard
          title="Gerentes"
          value={userCounts.admins}
          icon={Shield}
          variant="purple"
        />
        <ModernStatCard
          title="Supervisores"
          value={userCounts.supervisors}
          icon={ShieldCheck}
          variant="amber"
        />
        <ModernStatCard
          title="Operadores"
          value={userCounts.operators}
          icon={User}
          variant="green"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <ModernSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar por nome ou código..."
          className="flex-1 max-w-md"
        />
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filtrar por função" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as funções</SelectItem>
            <SelectItem value="admin">Gerentes</SelectItem>
            <SelectItem value="supervisor">Supervisores</SelectItem>
            <SelectItem value="operator">Operadores</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <ModernCard noPadding>
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold">Lista de Usuários</h3>
          <p className="text-sm text-muted-foreground">Gerentes, supervisores e operadores do sistema</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-4 font-medium text-muted-foreground text-sm">Nome</th>
                <th className="text-left p-4 font-medium text-muted-foreground text-sm">Código</th>
                <th className="text-left p-4 font-medium text-muted-foreground text-sm">Função</th>
                <th className="text-center p-4 font-medium text-muted-foreground text-sm">Status</th>
                {(isAdmin || isSupervisor) && (
                  <th className="text-right p-4 font-medium text-muted-foreground text-sm">Ações</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={(isAdmin || isSupervisor) ? 5 : 4}>
                    <ModernEmptyState
                      icon={Users}
                      title="Nenhum usuário encontrado"
                    />
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <tr 
                    key={user.id}
                    className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-sm text-muted-foreground">{user.code}</td>
                    <td className="p-4">{getRoleBadge(user.role)}</td>
                    <td className="p-4 text-center">
                      {user.is_active ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                          Ativo
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Inativo</Badge>
                      )}
                    </td>
                    {(isAdmin || isSupervisor) && (
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingUser(user)}>
                              <Edit2 className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            {isAdmin && (
                              <DropdownMenuItem onClick={() => setStatusChangeUser(user)}>
                                {user.is_active ? (
                                  <>
                                    <UserX className="w-4 h-4 mr-2" />
                                    Desativar
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-4 h-4 mr-2" />
                                    Ativar
                                  </>
                                )}
                              </DropdownMenuItem>
                            )}
                            {isAdmin && stores.length > 0 && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuSub>
                                  <DropdownMenuSubTrigger>
                                    <Building2 className="w-4 h-4 mr-2" />
                                    Vincular à Loja
                                  </DropdownMenuSubTrigger>
                                  <DropdownMenuSubContent>
                                    {stores.map((store) => (
                                      <DropdownMenuItem
                                        key={store.id}
                                        onClick={() => handleAssignStore(user.user_id, store.id)}
                                      >
                                        {store.name}
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuSubContent>
                                </DropdownMenuSub>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </ModernCard>

      {/* Modals */}
      <UserCreateModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />

      <UserEditModal
        user={editingUser}
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
      />

      <AlertDialog open={!!statusChangeUser} onOpenChange={(open) => !open && setStatusChangeUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {statusChangeUser?.is_active ? 'Desativar usuário?' : 'Ativar usuário?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {statusChangeUser?.is_active
                ? `O usuário "${statusChangeUser?.name}" não poderá mais acessar o sistema.`
                : `O usuário "${statusChangeUser?.name}" poderá acessar o sistema novamente.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleStatus}>
              {statusChangeUser?.is_active ? 'Desativar' : 'Ativar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
