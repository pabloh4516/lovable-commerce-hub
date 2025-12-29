import { useState } from 'react';
import { Plus, UserCircle, Edit, Trash2, Lock, Unlock, Gift, History, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useCustomers } from '@/hooks/useCustomers';
import { useLoyalty } from '@/hooks/useLoyalty';
import { ModernPageHeader, ModernStatCard, ModernSearchBar, ModernCard, ModernEmptyState } from './common';
import { differenceInDays } from 'date-fns';

export function CustomersPage() {
  const { customers, createCustomer, updateCustomer, deleteCustomer, isLoading } = useCustomers();
  const { customerPoints } = useLoyalty();
  
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    rg: '',
    cnpj: '',
    ie: '',
    fantasy_name: '',
    email: '',
    phone: '',
    phone2: '',
    birth_date: '',
    gender: '',
    profession: '',
    workplace: '',
    income: 0,
    address: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    cep: '',
    credit_limit: 0,
    notes: '',
    is_blocked: false,
    block_reason: '',
  });

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(search.toLowerCase()) ||
    customer.cpf?.includes(search) ||
    customer.phone?.includes(search) ||
    customer.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenModal = (customer?: any) => {
    if (customer) {
      setEditingId(customer.id);
      setFormData({
        name: customer.name || '',
        cpf: customer.cpf || '',
        rg: customer.rg || '',
        cnpj: customer.cnpj || '',
        ie: customer.ie || '',
        fantasy_name: customer.fantasy_name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        phone2: customer.phone2 || '',
        birth_date: customer.birth_date || '',
        gender: customer.gender || '',
        profession: customer.profession || '',
        workplace: customer.workplace || '',
        income: customer.income || 0,
        address: customer.address || '',
        number: customer.number || '',
        complement: customer.complement || '',
        neighborhood: customer.neighborhood || '',
        city: customer.city || '',
        state: customer.state || '',
        cep: customer.cep || '',
        credit_limit: customer.credit_limit || 0,
        notes: customer.notes || '',
        is_blocked: customer.is_blocked || false,
        block_reason: customer.block_reason || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '', cpf: '', rg: '', cnpj: '', ie: '', fantasy_name: '', email: '',
        phone: '', phone2: '', birth_date: '', gender: '', profession: '', workplace: '',
        income: 0, address: '', number: '', complement: '', neighborhood: '', city: '',
        state: '', cep: '', credit_limit: 0, notes: '', is_blocked: false, block_reason: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error('Nome é obrigatório');
      return;
    }
    
    try {
      const customerData = {
        ...formData,
        income: formData.income || null,
        birth_date: formData.birth_date || null,
        current_debt: 0,
        image_url: null,
      };
      
      if (editingId) {
        await updateCustomer({ id: editingId, ...customerData });
      } else {
        await createCustomer(customerData as any);
        toast.success('Cliente cadastrado!');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Erro ao salvar cliente');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await deleteCustomer(id);
        toast.success('Cliente excluído!');
      } catch (error) {
        toast.error('Erro ao excluir cliente');
      }
    }
  };

  const handleToggleBlock = async (customer: any) => {
    try {
      await updateCustomer({
        id: customer.id,
        is_blocked: !customer.is_blocked,
        block_reason: !customer.is_blocked ? 'Bloqueado pelo administrador' : null,
      });
      toast.success(customer.is_blocked ? 'Cliente desbloqueado!' : 'Cliente bloqueado!');
    } catch (error) {
      toast.error('Erro ao atualizar cliente');
    }
  };

  const handleViewCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setIsViewModalOpen(true);
  };

  const getCustomerPoints = (customerId: string) => {
    return customerPoints.find(cp => cp.customer_id === customerId);
  };

  const isUpcomingBirthday = (birthDate: string | null) => {
    if (!birthDate) return false;
    const today = new Date();
    const birth = new Date(birthDate);
    birth.setFullYear(today.getFullYear());
    const diff = differenceInDays(birth, today);
    return diff >= 0 && diff <= 7;
  };

  const states = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in h-full overflow-auto">
      <ModernPageHeader
        title="Clientes"
        subtitle="Gerencie sua base de clientes"
        icon={Users}
        actions={
          <Button onClick={() => handleOpenModal()} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Cliente
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ModernStatCard
          title="Total de Clientes"
          value={customers.length}
          icon={Users}
          variant="blue"
        />
        <ModernStatCard
          title="Ativos"
          value={customers.filter(c => c.is_active && !c.is_blocked).length}
          icon={Users}
          variant="green"
        />
        <ModernStatCard
          title="Bloqueados"
          value={customers.filter(c => c.is_blocked).length}
          icon={Lock}
          variant="red"
        />
        <ModernStatCard
          title="Aniversariantes"
          value={customers.filter(c => isUpcomingBirthday(c.birth_date)).length}
          icon={Gift}
          variant="purple"
        />
      </div>

      {/* Search */}
      <ModernSearchBar
        value={search}
        onChange={setSearch}
        placeholder="Buscar por nome, CPF, telefone ou email..."
        className="max-w-md"
      />

      {/* Table */}
      <ModernCard noPadding>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-4 font-medium text-muted-foreground text-sm">Nome</th>
                <th className="text-left p-4 font-medium text-muted-foreground text-sm">CPF/CNPJ</th>
                <th className="text-left p-4 font-medium text-muted-foreground text-sm">Telefone</th>
                <th className="text-left p-4 font-medium text-muted-foreground text-sm">Email</th>
                <th className="text-right p-4 font-medium text-muted-foreground text-sm">Limite</th>
                <th className="text-center p-4 font-medium text-muted-foreground text-sm">Pontos</th>
                <th className="text-center p-4 font-medium text-muted-foreground text-sm">Status</th>
                <th className="text-right p-4 font-medium text-muted-foreground text-sm">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer, index) => {
                const points = getCustomerPoints(customer.id);
                return (
                  <tr 
                    key={customer.id} 
                    className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <UserCircle className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{customer.name}</span>
                          {isUpcomingBirthday(customer.birth_date) && (
                            <Gift className="w-4 h-4 text-purple-500" />
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground font-mono text-sm">{customer.cpf || customer.cnpj || '-'}</td>
                    <td className="p-4 text-muted-foreground">{customer.phone || '-'}</td>
                    <td className="p-4 text-muted-foreground">{customer.email || '-'}</td>
                    <td className="p-4 text-right font-medium tabular-nums">R$ {customer.credit_limit.toFixed(2)}</td>
                    <td className="p-4 text-center">
                      {points ? (
                        <Badge variant="secondary" className="font-mono">{points.available_points} pts</Badge>
                      ) : '-'}
                    </td>
                    <td className="p-4 text-center">
                      {customer.is_blocked ? (
                        <Badge variant="destructive">Bloqueado</Badge>
                      ) : customer.is_active ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Ativo</Badge>
                      ) : (
                        <Badge variant="secondary">Inativo</Badge>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewCustomer(customer)}>
                          <History className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenModal(customer)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleBlock(customer)}>
                          {customer.is_blocked ? (
                            <Unlock className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Lock className="w-4 h-4 text-amber-500" />
                          )}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(customer.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 && (
          <ModernEmptyState
            icon={UserCircle}
            title="Nenhum cliente encontrado"
            description="Adicione um novo cliente para começar"
          />
        )}
      </ModernCard>

      {/* Create/Edit Customer Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
              <TabsTrigger value="address">Endereço</TabsTrigger>
              <TabsTrigger value="financial">Financeiro</TabsTrigger>
              <TabsTrigger value="other">Outros</TabsTrigger>
            </TabsList>
            
            <TabsContent value="personal" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Nome *</Label>
                  <Input 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    placeholder="Nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label>CPF</Label>
                  <Input 
                    value={formData.cpf} 
                    onChange={(e) => setFormData({...formData, cpf: e.target.value})} 
                    placeholder="000.000.000-00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>RG</Label>
                  <Input 
                    value={formData.rg} 
                    onChange={(e) => setFormData({...formData, rg: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    type="email"
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input 
                    value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data de Nascimento</Label>
                  <Input 
                    type="date"
                    value={formData.birth_date} 
                    onChange={(e) => setFormData({...formData, birth_date: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gênero</Label>
                  <Select value={formData.gender} onValueChange={(v) => setFormData({...formData, gender: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Feminino</SelectItem>
                      <SelectItem value="O">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="address" className="space-y-4 mt-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>CEP</Label>
                  <Input 
                    value={formData.cep} 
                    onChange={(e) => setFormData({...formData, cep: e.target.value})} 
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Endereço</Label>
                  <Input 
                    value={formData.address} 
                    onChange={(e) => setFormData({...formData, address: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Número</Label>
                  <Input 
                    value={formData.number} 
                    onChange={(e) => setFormData({...formData, number: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Complemento</Label>
                  <Input 
                    value={formData.complement} 
                    onChange={(e) => setFormData({...formData, complement: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bairro</Label>
                  <Input 
                    value={formData.neighborhood} 
                    onChange={(e) => setFormData({...formData, neighborhood: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input 
                    value={formData.city} 
                    onChange={(e) => setFormData({...formData, city: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select value={formData.state} onValueChange={(v) => setFormData({...formData, state: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map(uf => (
                        <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="financial" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Limite de Crédito</Label>
                  <Input 
                    type="number"
                    value={formData.credit_limit} 
                    onChange={(e) => setFormData({...formData, credit_limit: parseFloat(e.target.value) || 0})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Renda</Label>
                  <Input 
                    type="number"
                    value={formData.income} 
                    onChange={(e) => setFormData({...formData, income: parseFloat(e.target.value) || 0})} 
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="other" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea 
                  value={formData.notes} 
                  onChange={(e) => setFormData({...formData, notes: e.target.value})} 
                  rows={4}
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {editingId ? 'Salvar' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
