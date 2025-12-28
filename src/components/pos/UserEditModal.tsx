import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserWithRole, useUserMutations } from '@/hooks/useUsers';
import { User, Shield, ShieldCheck, Loader2 } from 'lucide-react';

interface UserEditModalProps {
  user: UserWithRole | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserEditModal({ user, open, onOpenChange }: UserEditModalProps) {
  const { updateProfile, updateRole } = useUserMutations();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    isActive: true,
    role: 'operator' as 'operator' | 'supervisor' | 'admin',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        code: user.code,
        isActive: user.is_active,
        role: user.role || 'operator',
      });
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!user) return;

    try {
      await updateProfile.mutateAsync({
        userId: user.user_id,
        name: formData.name,
        code: formData.code,
        isActive: formData.isActive,
      });

      if (formData.role !== user.role) {
        await updateRole.mutateAsync({
          userId: user.user_id,
          role: formData.role,
        });
      }

      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };

  const isPending = updateProfile.isPending || updateRole.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Editar Usuário
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nome do usuário"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Código</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="Código único"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Função</Label>
            <Select
              value={formData.role}
              onValueChange={(value: 'operator' | 'supervisor' | 'admin') =>
                setFormData({ ...formData, role: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="operator">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Operador
                  </div>
                </SelectItem>
                <SelectItem value="supervisor">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    Supervisor
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Administrador
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
            <Label htmlFor="isActive" className="cursor-pointer">
              Usuário ativo
            </Label>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
