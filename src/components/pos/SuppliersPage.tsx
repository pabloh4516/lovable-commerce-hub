import { useState } from 'react';
import { 
  Plus, 
  Building2, 
  Phone, 
  Mail, 
  MapPin,
  Edit,
  Trash2,
  Loader2,
  Truck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSuppliers, useSupplierMutations, Supplier } from '@/hooks/useSuppliers';
import { useAuth } from '@/hooks/useAuth';
import { ModernPageHeader, ModernStatCard, ModernSearchBar, ModernCard, ModernEmptyState } from './common';

export function SuppliersPage() {
  const { data: suppliers, isLoading } = useSuppliers();
  const { createSupplier, updateSupplier, deleteSupplier } = useSupplierMutations();
  const { role } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    fantasy_name: '',
    cnpj: '',
    cpf: '',
    ie: '',
    phone: '',
    phone2: '',
    email: '',
    website: '',
    address: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    cep: '',
    contact_name: '',
    contact_phone: '',
    notes: '',
  });

  const canManage = role === 'admin' || role === 'supervisor';

  const filteredSuppliers = suppliers?.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.cnpj?.includes(searchQuery) ||
    s.code.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      fantasy_name: '',
      cnpj: '',
      cpf: '',
      ie: '',
      phone: '',
      phone2: '',
      email: '',
      website: '',
      address: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      cep: '',
      contact_name: '',
      contact_phone: '',
      notes: '',
    });
    setEditingSupplier(null);
  };

  const handleOpenModal = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        code: supplier.code,
        name: supplier.name,
        fantasy_name: supplier.fantasy_name || '',
        cnpj: supplier.cnpj || '',
        cpf: supplier.cpf || '',
        ie: supplier.ie || '',
        phone: supplier.phone || '',
        phone2: supplier.phone2 || '',
        email: supplier.email || '',
        website: supplier.website || '',
        address: supplier.address || '',
        number: supplier.number || '',
        complement: supplier.complement || '',
        neighborhood: supplier.neighborhood || '',
        city: supplier.city || '',
        state: supplier.state || '',
        cep: supplier.cep || '',
        contact_name: supplier.contact_name || '',
        contact_phone: supplier.contact_phone || '',
        notes: supplier.notes || '',
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.code || !formData.name) return;

    const supplierData = {
      ...formData,
      fantasy_name: formData.fantasy_name || null,
      cnpj: formData.cnpj || null,
      cpf: formData.cpf || null,
      ie: formData.ie || null,
      im: null,
      phone: formData.phone || null,
      phone2: formData.phone2 || null,
      email: formData.email || null,
      website: formData.website || null,
      address: formData.address || null,
      number: formData.number || null,
      complement: formData.complement || null,
      neighborhood: formData.neighborhood || null,
      city: formData.city || null,
      state: formData.state || null,
      cep: formData.cep || null,
      contact_name: formData.contact_name || null,
      contact_phone: formData.contact_phone || null,
      notes: formData.notes || null,
      is_active: true,
    };

    if (editingSupplier) {
      await updateSupplier.mutateAsync({ id: editingSupplier.id, ...supplierData });
    } else {
      await createSupplier.mutateAsync(supplierData);
    }

    setShowModal(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (deletingSupplier) {
      await deleteSupplier.mutateAsync(deletingSupplier.id);
      setDeletingSupplier(null);
    }
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
        title="Fornecedores"
        subtitle="Gerencie seus fornecedores"
        icon={Truck}
        actions={
          canManage && (
            <Button onClick={() => handleOpenModal()} className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Fornecedor
            </Button>
          )
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ModernStatCard
          title="Total de Fornecedores"
          value={suppliers?.length || 0}
          icon={Truck}
          variant="blue"
        />
        <ModernStatCard
          title="Ativos"
          value={suppliers?.filter(s => s.is_active).length || 0}
          icon={Building2}
          variant="green"
        />
        <ModernStatCard
          title="Com Email"
          value={suppliers?.filter(s => s.email).length || 0}
          icon={Mail}
          variant="purple"
        />
      </div>

      {/* Search */}
      <ModernSearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Buscar por nome, código ou CNPJ..."
        className="max-w-md"
      />

      {/* Table */}
      <ModernCard noPadding>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-4 font-medium text-muted-foreground text-sm">Código</th>
                <th className="text-left p-4 font-medium text-muted-foreground text-sm">Nome</th>
                <th className="text-left p-4 font-medium text-muted-foreground text-sm">CNPJ/CPF</th>
                <th className="text-left p-4 font-medium text-muted-foreground text-sm">Telefone</th>
                <th className="text-left p-4 font-medium text-muted-foreground text-sm">Cidade/UF</th>
                {canManage && <th className="text-right p-4 font-medium text-muted-foreground text-sm">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 6 : 5}>
                    <ModernEmptyState
                      icon={Truck}
                      title="Nenhum fornecedor encontrado"
                      description="Adicione um novo fornecedor para começar"
                    />
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((supplier, index) => (
                  <tr 
                    key={supplier.id}
                    className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="p-4 font-mono text-sm text-muted-foreground">{supplier.code}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/10">
                          <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{supplier.name}</p>
                          {supplier.fantasy_name && (
                            <p className="text-sm text-muted-foreground">{supplier.fantasy_name}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-sm text-muted-foreground">
                      {supplier.cnpj || supplier.cpf || '-'}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {supplier.phone || '-'}
                    </td>
                    <td className="p-4">
                      {supplier.city && supplier.state ? (
                        <Badge variant="secondary">{supplier.city}/{supplier.state}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    {canManage && (
                      <td className="p-4 text-right">
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenModal(supplier)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeletingSupplier(supplier)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </ModernCard>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Dados Básicos */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Dados Básicos
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Código *</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="FOR001"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Razão Social *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nome Fantasia</Label>
                  <Input
                    value={formData.fantasy_name}
                    onChange={(e) => setFormData({ ...formData, fantasy_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>CNPJ</Label>
                  <Input
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>CPF</Label>
                  <Input
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                  />
                </div>
                <div>
                  <Label>Inscrição Estadual</Label>
                  <Input
                    value={formData.ie}
                    onChange={(e) => setFormData({ ...formData, ie: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Contato */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Contato
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Telefone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Telefone 2</Label>
                  <Input
                    value={formData.phone2}
                    onChange={(e) => setFormData({ ...formData, phone2: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>E-mail</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Website</Label>
                  <Input
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nome do Contato</Label>
                  <Input
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Telefone do Contato</Label>
                  <Input
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Endereço
              </h3>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label>CEP</Label>
                  <Input
                    value={formData.cep}
                    onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Endereço</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Número</Label>
                  <Input
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label>Complemento</Label>
                  <Input
                    value={formData.complement}
                    onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Bairro</Label>
                  <Input
                    value={formData.neighborhood}
                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Cidade</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div>
                  <Label>UF</Label>
                  <Input
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    maxLength={2}
                  />
                </div>
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={createSupplier.isPending || updateSupplier.isPending}
            >
              {(createSupplier.isPending || updateSupplier.isPending) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {editingSupplier ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingSupplier} onOpenChange={() => setDeletingSupplier(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir fornecedor?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o fornecedor "{deletingSupplier?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
