import { useState } from 'react';
import { 
  Plus, 
  ShoppingBag,
  Truck,
  Package,
  Loader2,
  Edit,
  Check,
  FileText
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { usePurchaseOrders, usePurchaseOrderMutations } from '@/hooks/usePurchaseOrders';
import { useSuppliers } from '@/hooks/useSuppliers';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ModernPageHeader, ModernStatCard, ModernSearchBar, ModernCard, ModernEmptyState } from './common';

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pendente', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  approved: { label: 'Aprovado', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  partial: { label: 'Recebido Parcial', className: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
  received: { label: 'Recebido', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  cancelled: { label: 'Cancelado', className: 'bg-muted text-muted-foreground' },
};

export function PurchasesPage() {
  const { data: orders, isLoading } = usePurchaseOrders();
  const { data: suppliers } = useSuppliers();
  const { createPurchaseOrder, updatePurchaseOrder } = usePurchaseOrderMutations();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    supplier_id: '',
    invoice_number: '',
    invoice_date: '',
    expected_date: '',
    payment_condition: '',
    notes: '',
  });

  const filteredOrders = orders?.filter(order => {
    const matchesSearch = 
      order.number.toString().includes(searchQuery) ||
      order.supplier?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.invoice_number?.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const stats = {
    total: orders?.length || 0,
    pending: orders?.filter(o => o.status === 'pending').length || 0,
    approved: orders?.filter(o => o.status === 'approved').length || 0,
    received: orders?.filter(o => o.status === 'received').length || 0,
  };

  const resetForm = () => {
    setFormData({
      supplier_id: '',
      invoice_number: '',
      invoice_date: '',
      expected_date: '',
      payment_condition: '',
      notes: '',
    });
    setSelectedOrder(null);
  };

  const handleSave = async () => {
    if (!formData.supplier_id) return;

    const orderData = {
      supplier_id: formData.supplier_id,
      store_id: null,
      operator_id: '',
      subtotal: 0,
      discount: 0,
      shipping: 0,
      other_costs: 0,
      total: 0,
      status: 'pending' as const,
      invoice_number: formData.invoice_number || null,
      invoice_key: null,
      invoice_date: formData.invoice_date || null,
      expected_date: formData.expected_date || null,
      received_date: null,
      payment_method: null,
      payment_condition: formData.payment_condition || null,
      notes: formData.notes || null,
    };

    if (selectedOrder) {
      await updatePurchaseOrder.mutateAsync({ id: selectedOrder.id, ...orderData });
    } else {
      await createPurchaseOrder.mutateAsync(orderData);
    }

    setShowModal(false);
    resetForm();
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
        title="Compras"
        subtitle="Gerencie seus pedidos de compra"
        icon={ShoppingBag}
        actions={
          <Button onClick={() => setShowModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Pedido
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ModernStatCard
          title="Total"
          value={stats.total}
          icon={ShoppingBag}
          variant="blue"
        />
        <ModernStatCard
          title="Pendentes"
          value={stats.pending}
          icon={FileText}
          variant="amber"
        />
        <ModernStatCard
          title="Aprovados"
          value={stats.approved}
          icon={Truck}
          variant="purple"
        />
        <ModernStatCard
          title="Recebidos"
          value={stats.received}
          icon={Package}
          variant="green"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <ModernSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar por número, fornecedor ou nota fiscal..."
          className="flex-1 max-w-md"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(statusConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <ModernCard noPadding>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-4 font-medium text-muted-foreground text-sm">Pedido</th>
                <th className="text-left p-4 font-medium text-muted-foreground text-sm">Fornecedor</th>
                <th className="text-left p-4 font-medium text-muted-foreground text-sm">Nota Fiscal</th>
                <th className="text-left p-4 font-medium text-muted-foreground text-sm">Data</th>
                <th className="text-right p-4 font-medium text-muted-foreground text-sm">Total</th>
                <th className="text-center p-4 font-medium text-muted-foreground text-sm">Status</th>
                <th className="text-right p-4 font-medium text-muted-foreground text-sm">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <ModernEmptyState
                      icon={ShoppingBag}
                      title="Nenhum pedido encontrado"
                      description="Crie um novo pedido de compra"
                    />
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => {
                  const status = statusConfig[order.status];
                  
                  return (
                    <tr 
                      key={order.id}
                      className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <td className="p-4">
                        <span className="font-mono font-medium text-primary">#{order.number}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/10">
                            <Truck className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium">{order.supplier?.name || '-'}</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-sm text-muted-foreground">
                        {order.invoice_number || '-'}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {format(new Date(order.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                      </td>
                      <td className="p-4 text-right font-medium tabular-nums">
                        R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 text-center">
                        <Badge className={status.className}>{status.label}</Badge>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="w-4 h-4" />
                          </Button>
                          {order.status === 'approved' && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-500">
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </ModernCard>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Pedido de Compra</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <Label>Fornecedor *</Label>
              <Select
                value={formData.supplier_id}
                onValueChange={(value) => setFormData({ ...formData, supplier_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o fornecedor" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers?.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Número da NF</Label>
                <Input
                  value={formData.invoice_number}
                  onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                />
              </div>
              <div>
                <Label>Data da NF</Label>
                <Input
                  type="date"
                  value={formData.invoice_date}
                  onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Previsão de Entrega</Label>
                <Input
                  type="date"
                  value={formData.expected_date}
                  onChange={(e) => setFormData({ ...formData, expected_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Condição de Pagamento</Label>
                <Input
                  value={formData.payment_condition}
                  onChange={(e) => setFormData({ ...formData, payment_condition: e.target.value })}
                  placeholder="Ex: 30/60/90"
                />
              </div>
            </div>

            <div>
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
            <Button onClick={handleSave} disabled={!formData.supplier_id}>
              Criar Pedido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
