import { useState } from 'react';
import { Plus, Search, UserCircle, Edit, Trash2, Phone, Mail, MapPin, CreditCard, Calendar, Lock, Unlock, Gift, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { useCustomers } from '@/hooks/useCustomers';
import { useLoyalty } from '@/hooks/useLoyalty';
import type { DbCustomer } from '@/hooks/useCustomers';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground">Gerencie sua base de clientes</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, CPF, telefone ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{customers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success">{customers.filter(c => c.is_active && !c.is_blocked).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bloqueados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">{customers.filter(c => c.is_blocked).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Aniversariantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">
              {customers.filter(c => isUpcomingBirthday(c.birth_date)).length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CPF/CNPJ</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Limite</TableHead>
                <TableHead>Pontos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => {
                const points = getCustomerPoints(customer.id);
                return (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{customer.name}</span>
                        {isUpcomingBirthday(customer.birth_date) && (
                          <Gift className="w-4 h-4 text-primary" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{customer.cpf || customer.cnpj || '-'}</TableCell>
                    <TableCell>{customer.phone || '-'}</TableCell>
                    <TableCell>{customer.email || '-'}</TableCell>
                    <TableCell>R$ {customer.credit_limit.toFixed(2)}</TableCell>
                    <TableCell>
                      {points ? (
                        <Badge variant="secondary">{points.available_points} pts</Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {customer.is_blocked ? (
                        <Badge variant="destructive">Bloqueado</Badge>
                      ) : customer.is_active ? (
                        <Badge variant="default">Ativo</Badge>
                      ) : (
                        <Badge variant="secondary">Inativo</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="icon" onClick={() => handleViewCustomer(customer)}>
                          <History className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal(customer)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleToggleBlock(customer)}>
                          {customer.is_blocked ? (
                            <Unlock className="w-4 h-4 text-success" />
                          ) : (
                            <Lock className="w-4 h-4 text-warning" />
                          )}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(customer.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredCustomers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    <UserCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum cliente encontrado</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
            
            <TabsContent value="personal" className="space-y-4">
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
                  <Label>CNPJ</Label>
                  <Input 
                    value={formData.cnpj} 
                    onChange={(e) => setFormData({...formData, cnpj: e.target.value})} 
                    placeholder="00.000.000/0001-00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Inscrição Estadual</Label>
                  <Input 
                    value={formData.ie} 
                    onChange={(e) => setFormData({...formData, ie: e.target.value})} 
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Nome Fantasia</Label>
                  <Input 
                    value={formData.fantasy_name} 
                    onChange={(e) => setFormData({...formData, fantasy_name: e.target.value})} 
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
                  <Label>Telefone 2</Label>
                  <Input 
                    value={formData.phone2} 
                    onChange={(e) => setFormData({...formData, phone2: e.target.value})} 
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
            
            <TabsContent value="address" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>CEP</Label>
                  <Input 
                    value={formData.cep} 
                    onChange={(e) => setFormData({...formData, cep: e.target.value})} 
                    placeholder="00000-000"
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
                <div className="space-y-2 col-span-2">
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
                      {states.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="financial" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Limite de Crédito (R$)</Label>
                  <Input 
                    type="number"
                    min={0}
                    step={0.01}
                    value={formData.credit_limit} 
                    onChange={(e) => setFormData({...formData, credit_limit: Number(e.target.value)})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Renda Mensal (R$)</Label>
                  <Input 
                    type="number"
                    min={0}
                    step={0.01}
                    value={formData.income} 
                    onChange={(e) => setFormData({...formData, income: Number(e.target.value)})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Profissão</Label>
                  <Input 
                    value={formData.profession} 
                    onChange={(e) => setFormData({...formData, profession: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Local de Trabalho</Label>
                  <Input 
                    value={formData.workplace} 
                    onChange={(e) => setFormData({...formData, workplace: e.target.value})} 
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="other" className="space-y-4">
              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea 
                  value={formData.notes} 
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Observações sobre o cliente..."
                  rows={4}
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {editingId ? 'Salvar' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Customer Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCircle className="w-5 h-5" />
              {selectedCustomer?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedCustomer.phone || 'Não informado'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedCustomer.email || 'Não informado'}</span>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {selectedCustomer.address 
                      ? `${selectedCustomer.address}, ${selectedCustomer.number || 's/n'} - ${selectedCustomer.neighborhood || ''}, ${selectedCustomer.city || ''} - ${selectedCustomer.state || ''}`
                      : 'Endereço não informado'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Limite
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-bold">R$ {selectedCustomer.credit_limit.toFixed(2)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Débito</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-bold text-destructive">R$ {selectedCustomer.current_debt.toFixed(2)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Gift className="w-4 h-4" />
                      Pontos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-bold text-primary">
                      {getCustomerPoints(selectedCustomer.id)?.available_points || 0}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {selectedCustomer.birth_date && (
                <div className="flex items-center gap-2 bg-muted p-3 rounded-lg">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Aniversário: {format(new Date(selectedCustomer.birth_date), 'dd/MM', { locale: ptBR })}</span>
                  {isUpcomingBirthday(selectedCustomer.birth_date) && (
                    <Badge variant="default" className="ml-auto">Próximo!</Badge>
                  )}
                </div>
              )}

              {selectedCustomer.notes && (
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">{selectedCustomer.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}