import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Wrench,
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
  User,
  Package,
  Loader2,
  Eye,
  Edit,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { useServiceOrders, useServiceOrderMutations, ServiceOrderStatus } from '@/hooks/useServiceOrders';
import { useCustomers } from '@/hooks/useCustomers';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusConfig: Record<ServiceOrderStatus, { label: string; color: string; icon: any }> = {
  received: { label: 'Recebido', color: 'bg-blue-500', icon: Package },
  waiting_approval: { label: 'Aguard. Aprovação', color: 'bg-yellow-500', icon: Clock },
  approved: { label: 'Aprovado', color: 'bg-green-500', icon: CheckCircle },
  in_progress: { label: 'Em Andamento', color: 'bg-primary', icon: Wrench },
  waiting_parts: { label: 'Aguard. Peças', color: 'bg-orange-500', icon: AlertCircle },
  completed: { label: 'Concluído', color: 'bg-success', icon: CheckCircle },
  delivered: { label: 'Entregue', color: 'bg-muted', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'bg-destructive', icon: AlertCircle },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Baixa', color: 'bg-muted' },
  normal: { label: 'Normal', color: 'bg-blue-500' },
  high: { label: 'Alta', color: 'bg-orange-500' },
  urgent: { label: 'Urgente', color: 'bg-destructive' },
};

export function ServiceOrdersPage() {
  const { data: serviceOrders, isLoading } = useServiceOrders();
  const { customers } = useCustomers();
  const { createServiceOrder, updateServiceOrder } = useServiceOrderMutations();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    customer_id: '',
    equipment_type: '',
    equipment_brand: '',
    equipment_model: '',
    equipment_serial: '',
    equipment_color: '',
    equipment_accessories: '',
    equipment_condition: '',
    defect_reported: '',
    priority: 'normal',
    estimated_value: '',
    estimated_date: '',
    customer_notes: '',
  });

  const filteredOrders = serviceOrders?.filter(order => {
    const matchesSearch = 
      order.number.toString().includes(searchQuery) ||
      order.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.equipment_type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const stats = {
    total: serviceOrders?.length || 0,
    pending: serviceOrders?.filter(o => ['received', 'waiting_approval', 'approved'].includes(o.status)).length || 0,
    inProgress: serviceOrders?.filter(o => ['in_progress', 'waiting_parts'].includes(o.status)).length || 0,
    completed: serviceOrders?.filter(o => o.status === 'completed').length || 0,
  };

  const resetForm = () => {
    setFormData({
      customer_id: '',
      equipment_type: '',
      equipment_brand: '',
      equipment_model: '',
      equipment_serial: '',
      equipment_color: '',
      equipment_accessories: '',
      equipment_condition: '',
      defect_reported: '',
      priority: 'normal',
      estimated_value: '',
      estimated_date: '',
      customer_notes: '',
    });
    setSelectedOrder(null);
  };

  const handleOpenModal = (order?: any) => {
    if (order) {
      setSelectedOrder(order);
      setFormData({
        customer_id: order.customer_id,
        equipment_type: order.equipment_type,
        equipment_brand: order.equipment_brand || '',
        equipment_model: order.equipment_model || '',
        equipment_serial: order.equipment_serial || '',
        equipment_color: order.equipment_color || '',
        equipment_accessories: order.equipment_accessories || '',
        equipment_condition: order.equipment_condition || '',
        defect_reported: order.defect_reported,
        priority: order.priority,
        estimated_value: order.estimated_value?.toString() || '',
        estimated_date: order.estimated_date || '',
        customer_notes: order.customer_notes || '',
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.customer_id || !formData.equipment_type || !formData.defect_reported) return;

    const orderData = {
      customer_id: formData.customer_id,
      equipment_type: formData.equipment_type,
      equipment_brand: formData.equipment_brand || null,
      equipment_model: formData.equipment_model || null,
      equipment_serial: formData.equipment_serial || null,
      equipment_color: formData.equipment_color || null,
      equipment_accessories: formData.equipment_accessories || null,
      equipment_condition: formData.equipment_condition || null,
      defect_reported: formData.defect_reported,
      priority: formData.priority,
      estimated_value: formData.estimated_value ? parseFloat(formData.estimated_value) : null,
      estimated_date: formData.estimated_date || null,
      customer_notes: formData.customer_notes || null,
      status: 'received' as ServiceOrderStatus,
      store_id: null,
      technician_id: null,
      receptionist_id: '',
      defect_found: null,
      solution: null,
      technical_report: null,
      final_value: null,
      parts_value: 0,
      labor_value: 0,
      discount: 0,
      warranty_until: null,
      completed_date: null,
      delivered_date: null,
      internal_notes: null,
      checklist: null,
      images: null,
    };

    if (selectedOrder) {
      await updateServiceOrder.mutateAsync({ id: selectedOrder.id, ...orderData });
    } else {
      await createServiceOrder.mutateAsync(orderData);
    }

    setShowModal(false);
    resetForm();
  };

  const handleStatusChange = async (orderId: string, newStatus: ServiceOrderStatus) => {
    await updateServiceOrder.mutateAsync({ id: orderId, status: newStatus });
  };

  const sendWhatsApp = (phone: string, orderNumber: number) => {
    const message = encodeURIComponent(`Olá! Sua ordem de serviço #${orderNumber} está pronta para retirada.`);
    window.open(`https://wa.me/55${phone?.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ordens de Serviço</h1>
          <p className="text-muted-foreground">Gerencie suas ordens de serviço</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus className="w-4 h-4" />
          Nova OS
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Wrench className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Wrench className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-sm text-muted-foreground">Concluídos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número, cliente ou equipamento..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="grid gap-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Nenhuma ordem de serviço encontrada
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => {
            const status = statusConfig[order.status];
            const priority = priorityConfig[order.priority];
            
            return (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className={`p-3 rounded-lg ${status.color}/10`}>
                        <status.icon className={`w-6 h-6`} style={{ color: status.color.replace('bg-', '') }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">OS #{order.number}</span>
                          <Badge variant="outline" className={priority.color}>
                            {priority.label}
                          </Badge>
                          <Badge className={status.color}>
                            {status.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {order.customer?.name || 'Cliente não informado'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            {order.equipment_type}
                            {order.equipment_brand && ` - ${order.equipment_brand}`}
                            {order.equipment_model && ` ${order.equipment_model}`}
                          </span>
                        </div>
                        <p className="mt-2 text-sm">
                          <strong>Defeito:</strong> {order.defect_reported}
                        </p>
                        {order.estimated_value && (
                          <p className="mt-1 text-sm font-medium text-primary">
                            Valor estimado: R$ {order.estimated_value.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(order.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                      <div className="flex gap-1">
                        {order.customer?.phone && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => sendWhatsApp(order.customer.phone!, order.number)}
                          >
                            <MessageCircle className="w-4 h-4 text-green-500" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenModal(order)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleStatusChange(order.id, value as ServiceOrderStatus)}
                      >
                        <SelectTrigger className="w-[160px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusConfig).map(([key, config]) => (
                            <SelectItem key={key} value={key}>{config.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedOrder ? `Editar OS #${selectedOrder.number}` : 'Nova Ordem de Serviço'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Cliente */}
            <div>
              <Label>Cliente *</Label>
              <Select
                value={formData.customer_id}
                onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {customers?.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Equipamento */}
            <div className="space-y-4">
              <h3 className="font-semibold">Dados do Equipamento</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo de Equipamento *</Label>
                  <Input
                    value={formData.equipment_type}
                    onChange={(e) => setFormData({ ...formData, equipment_type: e.target.value })}
                    placeholder="Ex: Notebook, Celular, Impressora"
                  />
                </div>
                <div>
                  <Label>Marca</Label>
                  <Input
                    value={formData.equipment_brand}
                    onChange={(e) => setFormData({ ...formData, equipment_brand: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Modelo</Label>
                  <Input
                    value={formData.equipment_model}
                    onChange={(e) => setFormData({ ...formData, equipment_model: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Número de Série</Label>
                  <Input
                    value={formData.equipment_serial}
                    onChange={(e) => setFormData({ ...formData, equipment_serial: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cor</Label>
                  <Input
                    value={formData.equipment_color}
                    onChange={(e) => setFormData({ ...formData, equipment_color: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Acessórios</Label>
                  <Input
                    value={formData.equipment_accessories}
                    onChange={(e) => setFormData({ ...formData, equipment_accessories: e.target.value })}
                    placeholder="Carregador, case, etc."
                  />
                </div>
              </div>
              <div>
                <Label>Condição do Equipamento</Label>
                <Textarea
                  value={formData.equipment_condition}
                  onChange={(e) => setFormData({ ...formData, equipment_condition: e.target.value })}
                  placeholder="Descreva a condição física do equipamento"
                  rows={2}
                />
              </div>
            </div>

            {/* Defeito */}
            <div>
              <Label>Defeito Relatado *</Label>
              <Textarea
                value={formData.defect_reported}
                onChange={(e) => setFormData({ ...formData, defect_reported: e.target.value })}
                placeholder="Descreva o problema relatado pelo cliente"
                rows={3}
              />
            </div>

            {/* Prioridade e valores */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Prioridade</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(priorityConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Valor Estimado</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.estimated_value}
                  onChange={(e) => setFormData({ ...formData, estimated_value: e.target.value })}
                  placeholder="R$ 0,00"
                />
              </div>
              <div>
                <Label>Previsão de Entrega</Label>
                <Input
                  type="date"
                  value={formData.estimated_date}
                  onChange={(e) => setFormData({ ...formData, estimated_date: e.target.value })}
                />
              </div>
            </div>

            {/* Observações */}
            <div>
              <Label>Observações para o Cliente</Label>
              <Textarea
                value={formData.customer_notes}
                onChange={(e) => setFormData({ ...formData, customer_notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!formData.customer_id || !formData.equipment_type || !formData.defect_reported}
            >
              {selectedOrder ? 'Salvar' : 'Criar OS'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
