import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Search, UserPlus, Shield, ShieldCheck, User, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface UserWithRole {
  id: string;
  user_id: string;
  name: string;
  code: string;
  is_active: boolean;
  created_at: string;
  role: 'operator' | 'supervisor' | 'admin' | null;
}

export function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { isAdmin } = useAuth();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('name');

      if (profilesError) throw profilesError;

      // Get roles for each user
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
          <Badge variant="secondary" className="gap-1">
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="font-mono">{user.code}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      {user.is_active ? (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Ativo
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-red-600 border-red-600">
                          Inativo
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
