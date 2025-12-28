import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  Building2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUsers, useUserMutations, UserWithRole } from '@/hooks/useUsers';
import { useStores, useStoreMutations } from '@/hooks/useStores';
import { UserEditModal } from './UserEditModal';
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

export function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [statusChangeUser, setStatusChangeUser] = useState<UserWithRole | null>(null);
  const { isAdmin } = useAuth();
  const { data: users = [], isLoading } = useUsers();
  const { toggleUserStatus } = useUserMutations();
  const { data: stores = [] } = useStores();
  const { assignUserToStore } = useStoreMutations();

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <Badge variant="secondary" className="gap-1 bg-warning/10 text-warning border-warning/20">
            <ShieldCheck className="w-3 h-3" />
            Supervisor
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1">
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

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Usuários</h1>
          <p className="text-muted-foreground">
            {users.length} usuários cadastrados
          </p>
        </div>
        
        {isAdmin && (
          <Button className="gap-2">
            <UserPlus className="w-4 h-4" />
            Novo Usuário
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou código..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Status</TableHead>
                  {isAdmin && <TableHead className="w-16" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">{user.code}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      {user.is_active ? (
                        <Badge variant="outline" className="text-success border-success/30 bg-success/10">
                          Ativo
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/10">
                          Inativo
                        </Badge>
                      )}
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingUser(user)}>
                              <Edit2 className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
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
                            {stores.length > 0 && (
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
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 5 : 4} className="text-center text-muted-foreground py-8">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

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
