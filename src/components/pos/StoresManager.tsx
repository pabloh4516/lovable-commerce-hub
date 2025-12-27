import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Building2,
  Plus,
  Edit,
  Users,
  MapPin,
  Phone,
  Mail,
  Store,
  Check,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { useStores, useStoreMutations, Store as StoreType } from '@/hooks/useStores';
import { toast } from 'sonner';

export function StoresManager() {
  const { data: stores, isLoading } = useStores();
  const { createStore, updateStore } = useStoreMutations();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreType | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    cnpj: '',
    ie: '',
    address: '',
    city: '',
    state: '',
    cep: '',
    phone: '',
    email: '',
    is_matrix: false,
  });

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      cnpj: '',
      ie: '',
      address: '',
      city: '',
      state: '',
      cep: '',
      phone: '',
      email: '',
      is_matrix: false,
    });
    setEditingStore(null);
  };

  const openNewModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (store: StoreType) => {
    setEditingStore(store);
    setFormData({
      code: store.code,
      name: store.name,
      cnpj: store.cnpj || '',
      ie: store.ie || '',
      address: store.address || '',
      city: store.city || '',
      state: store.state || '',
      cep: store.cep || '',
      phone: store.phone || '',
      email: store.email || '',
      is_matrix: store.is_matrix,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.code || !formData.name) {
      toast.error('Código e nome são obrigatórios');
      return;
    }

    try {
      if (editingStore) {
        await updateStore.mutateAsync({
          id: editingStore.id,
          ...formData,
        });
      } else {
        await createStore.mutateAsync({
          ...formData,
          timezone: 'America/Sao_Paulo',
          is_active: true,
        } as any);
      }
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Gerenciar Lojas
            </CardTitle>
            <Button onClick={openNewModal}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Loja
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Código</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead className="w-40">CNPJ</TableHead>
                    <TableHead className="w-48">Cidade/UF</TableHead>
                    <TableHead className="w-24 text-center">Matriz</TableHead>
                    <TableHead className="w-24 text-center">Status</TableHead>
                    <TableHead className="w-20" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stores?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Nenhuma loja cadastrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    stores?.map((store) => (
                      <TableRow key={store.id}>
                        <TableCell className="font-mono font-medium">
                          {store.code}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Store className="w-4 h-4 text-muted-foreground" />
                            {store.name}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {store.cnpj || '-'}
                        </TableCell>
                        <TableCell>
                          {store.city && store.state ? (
                            <span>{store.city}/{store.state}</span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {store.is_matrix ? (
                            <Badge variant="default" className="bg-primary">
                              Matriz
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {store.is_active ? (
                            <Badge variant="secondary" className="bg-success/10 text-success">
                              Ativa
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-destructive/10 text-destructive">
                              Inativa
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(store)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={(o) => !o && setIsModalOpen(false)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              {editingStore ? 'Editar Loja' : 'Nova Loja'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Loja Centro"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                placeholder="00.000.000/0001-00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ie">Inscrição Estadual</Label>
              <Input
                id="ie"
                value={formData.ie}
                onChange={(e) => setFormData({ ...formData, ie: e.target.value })}
                placeholder="000.000.000.000"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Rua Principal, 100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="São Paulo"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="SP"
                  maxLength={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={formData.cep}
                  onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                  placeholder="00000-000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="loja@empresa.com"
              />
            </div>
            <div className="col-span-2 flex items-center gap-2 p-3 bg-secondary rounded-lg">
              <Switch
                id="is_matrix"
                checked={formData.is_matrix}
                onCheckedChange={(checked) => setFormData({ ...formData, is_matrix: checked })}
              />
              <Label htmlFor="is_matrix" className="cursor-pointer">
                Esta é a loja matriz (sede)
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createStore.isPending || updateStore.isPending}
            >
              {createStore.isPending || updateStore.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
