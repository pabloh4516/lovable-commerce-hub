import { useState } from 'react';
import { Plus, Search, CreditCard, Edit, Trash2, Percent, DollarSign, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';

export function PaymentMethodsPage() {
  const { paymentMethods, createPaymentMethod, updatePaymentMethod, deletePaymentMethod, isLoading } = usePaymentMethods();
  
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'cash',
    fee_percent: 0,
    fee_fixed: 0,
    installments_max: 1,
    days_to_receive: 0,
    requires_customer: false,
    is_active: true,
    sort_order: 0,
  });

  const filteredMethods = paymentMethods.filter(method =>
    method.name.toLowerCase().includes(search.toLowerCase()) ||
    method.code.toLowerCase().includes(search.toLowerCase())
  );

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      cash: 'Dinheiro',
      credit: 'Crédito',
      debit: 'Débito',
      pix: 'PIX',
      check: 'Cheque',
      voucher: 'Vale',
      fiado: 'Fiado',
      other: 'Outro',
    };
    return types[type] || type;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cash':
        return <DollarSign className="w-4 h-4" />;
      case 'credit':
      case 'debit':
        return <CreditCard className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const handleOpenModal = (method?: any) => {
    if (method) {
      setEditingId(method.id);
      setFormData({
        code: method.code,
        name: method.name,
        type: method.type,
        fee_percent: method.fee_percent || 0,
        fee_fixed: method.fee_fixed || 0,
        installments_max: method.installments_max || 1,
        days_to_receive: method.days_to_receive || 0,
        requires_customer: method.requires_customer || false,
        is_active: method.is_active ?? true,
        sort_order: method.sort_order || 0,
      });
    } else {
      setEditingId(null);
      setFormData({
        code: '',
        name: '',
        type: 'cash',
        fee_percent: 0,
        fee_fixed: 0,
        installments_max: 1,
        days_to_receive: 0,
        requires_customer: false,
        is_active: true,
        sort_order: 0,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.code || !formData.name) {
      toast.error('Código e nome são obrigatórios');
      return;
    }
    
    try {
      if (editingId) {
        await updatePaymentMethod({ id: editingId, ...formData });
        toast.success('Forma de pagamento atualizada!');
      } else {
        await createPaymentMethod(formData);
        toast.success('Forma de pagamento criada!');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Erro ao salvar forma de pagamento');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta forma de pagamento?')) {
      try {
        await deletePaymentMethod(id);
        toast.success('Forma de pagamento excluída!');
      } catch (error) {
        toast.error('Erro ao excluir forma de pagamento');
      }
    }
  };

  const handleToggleActive = async (method: any) => {
    try {
      await updatePaymentMethod({ id: method.id, is_active: !method.is_active });
      toast.success(method.is_active ? 'Forma de pagamento desativada!' : 'Forma de pagamento ativada!');
    } catch (error) {
      toast.error('Erro ao atualizar');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Formas de Pagamento</h1>
          <p className="text-muted-foreground">Configure taxas e parcelamentos</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Forma de Pagamento
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por código ou nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{paymentMethods.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success">{paymentMethods.filter(m => m.is_active).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Com Taxa</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-warning">
              {paymentMethods.filter(m => (m.fee_percent || 0) > 0 || (m.fee_fixed || 0) > 0).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Parcelados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{paymentMethods.filter(m => (m.installments_max || 1) > 1).length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Taxa %</TableHead>
                <TableHead>Taxa Fixa</TableHead>
                <TableHead>Parcelas</TableHead>
                <TableHead>Dias p/ Receber</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMethods.map((method) => (
                <TableRow key={method.id}>
                  <TableCell className="font-mono">{method.code}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(method.type)}
                      <span className="font-medium">{method.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getTypeLabel(method.type)}</Badge>
                  </TableCell>
                  <TableCell>
                    {method.fee_percent > 0 ? (
                      <span className="flex items-center gap-1">
                        <Percent className="w-3 h-3" />
                        {method.fee_percent}%
                      </span>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    {method.fee_fixed > 0 ? `R$ ${method.fee_fixed.toFixed(2)}` : '-'}
                  </TableCell>
                  <TableCell>
                    {method.installments_max > 1 ? `Até ${method.installments_max}x` : 'À vista'}
                  </TableCell>
                  <TableCell>
                    {method.days_to_receive > 0 ? (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {method.days_to_receive} dias
                      </span>
                    ) : 'Imediato'}
                  </TableCell>
                  <TableCell>
                    <Switch 
                      checked={method.is_active} 
                      onCheckedChange={() => handleToggleActive(method)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenModal(method)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(method.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredMethods.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma forma de pagamento encontrada</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Forma de Pagamento' : 'Nova Forma de Pagamento'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Código *</Label>
                <Input 
                  value={formData.code} 
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} 
                  placeholder="PIX"
                  className="uppercase"
                />
              </div>
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder="PIX"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Dinheiro</SelectItem>
                  <SelectItem value="credit">Crédito</SelectItem>
                  <SelectItem value="debit">Débito</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="check">Cheque</SelectItem>
                  <SelectItem value="voucher">Vale</SelectItem>
                  <SelectItem value="fiado">Fiado</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Taxa Percentual (%)</Label>
                <Input 
                  type="number"
                  min={0}
                  step={0.01}
                  value={formData.fee_percent} 
                  onChange={(e) => setFormData({...formData, fee_percent: Number(e.target.value)})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Taxa Fixa (R$)</Label>
                <Input 
                  type="number"
                  min={0}
                  step={0.01}
                  value={formData.fee_fixed} 
                  onChange={(e) => setFormData({...formData, fee_fixed: Number(e.target.value)})} 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Máx. Parcelas</Label>
                <Input 
                  type="number"
                  min={1}
                  max={24}
                  value={formData.installments_max} 
                  onChange={(e) => setFormData({...formData, installments_max: Number(e.target.value)})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Dias para Receber</Label>
                <Input 
                  type="number"
                  min={0}
                  value={formData.days_to_receive} 
                  onChange={(e) => setFormData({...formData, days_to_receive: Number(e.target.value)})} 
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch 
                  checked={formData.requires_customer} 
                  onCheckedChange={(v) => setFormData({...formData, requires_customer: v})}
                />
                <Label>Requer Cliente</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={formData.is_active} 
                  onCheckedChange={(v) => setFormData({...formData, is_active: v})}
                />
                <Label>Ativo</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {editingId ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}