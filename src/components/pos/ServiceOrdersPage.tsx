import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Wrench,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Package,
  Loader2,
  Edit,
  MessageCircle,
  Printer,
  Save,
  FileText,
  Camera,
  Phone,
  ChevronRight,
  XCircle,
  Settings
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
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useServiceOrders, useServiceOrderMutations, ServiceOrderStatus } from '@/hooks/useServiceOrders';
import { useCustomers } from '@/hooks/useCustomers';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

const statusConfig: Record<ServiceOrderStatus, { label: string; color: string; icon: any }> = {
  received: { label: 'Recebido', color: 'bg-blue-500', icon: Package },
  waiting_approval: { label: 'Aguard. Aprovação', color: 'bg-yellow-500', icon: Clock },
  approved: { label: 'Aprovado', color: 'bg-green-500', icon: CheckCircle },
  in_progress: { label: 'Em Andamento', color: 'bg-primary', icon: Wrench },
  waiting_parts: { label: 'Aguard. Peças', color: 'bg-orange-500', icon: AlertCircle },
  completed: { label: 'Concluído', color: 'bg-success', icon: CheckCircle },
  delivered: { label: 'Entregue', color: 'bg-muted', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'bg-destructive', icon: XCircle },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Baixa', color: 'bg-muted' },
  normal: { label: 'Normal', color: 'bg-blue-500' },
  high: { label: 'Alta', color: 'bg-orange-500' },
  urgent: { label: 'Urgente', color: 'bg-destructive' },
};

const defaultAccessories = [
  'Carregador',
  'Cabo USB',
  'Fone de Ouvido',
  'Case/Capa',
  'Película',
  'Cartão de Memória',
  'Chip',
  'Bateria Extra',
];

const defaultChecklist = [
  'Liga normalmente',
  'Tela funcional',
  'Touch funcional',
  'Áudio funcional',
  'Microfone funcional',
  'Câmera funcional',
  'Botões funcionais',
  'Conectividade OK',
];

export function ServiceOrdersPage() {
  const { data: serviceOrders, isLoading } = useServiceOrders();
  const { customers } = useCustomers();
  const { createServiceOrder, updateServiceOrder } = useServiceOrderMutations();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [accessories, setAccessories] = useState<string[]>([]);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState('info');
  
  const [formData, setFormData] = useState({
    customer_id: '',
    equipment_type: '',
    equipment_brand: '',
    equipment_model: '',
    equipment_serial: '',
    equipment_color: '',
    equipment_condition: '',
    defect_reported: '',
    defect_found: '',
    solution: '',
    technical_report: '',
    internal_notes: '',
    customer_notes: '',
    priority: 'normal',
    estimated_value: '',
    final_value: '',
    parts_value: '',
    labor_value: '',
    estimated_date: '',
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
      equipment_condition: '',
      defect_reported: '',
      defect_found: '',
      solution: '',
      technical_report: '',
      internal_notes: '',
      customer_notes: '',
      priority: 'normal',
      estimated_value: '',
      final_value: '',
      parts_value: '',
      labor_value: '',
      estimated_date: '',
    });
    setAccessories([]);
    setChecklist({});
    setSelectedOrder(null);
    setActiveTab('info');
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
        equipment_condition: order.equipment_condition || '',
        defect_reported: order.defect_reported,
        defect_found: order.defect_found || '',
        solution: order.solution || '',
        technical_report: order.technical_report || '',
        internal_notes: order.internal_notes || '',
        customer_notes: order.customer_notes || '',
        priority: order.priority,
        estimated_value: order.estimated_value?.toString() || '',
        final_value: order.final_value?.toString() || '',
        parts_value: order.parts_value?.toString() || '',
        labor_value: order.labor_value?.toString() || '',
        estimated_date: order.estimated_date || '',
      });
      setAccessories(order.equipment_accessories?.split(',').map((a: string) => a.trim()) || []);
      setChecklist(order.checklist || {});
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.customer_id || !formData.equipment_type || !formData.defect_reported) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    const orderData = {
      customer_id: formData.customer_id,
      equipment_type: formData.equipment_type,
      equipment_brand: formData.equipment_brand || null,
      equipment_model: formData.equipment_model || null,
      equipment_serial: formData.equipment_serial || null,
      equipment_color: formData.equipment_color || null,
      equipment_accessories: accessories.join(', ') || null,
      equipment_condition: formData.equipment_condition || null,
      defect_reported: formData.defect_reported,
      defect_found: formData.defect_found || null,
      solution: formData.solution || null,
      technical_report: formData.technical_report || null,
      internal_notes: formData.internal_notes || null,
      customer_notes: formData.customer_notes || null,
      priority: formData.priority,
      estimated_value: formData.estimated_value ? parseFloat(formData.estimated_value) : null,
      final_value: formData.final_value ? parseFloat(formData.final_value) : null,
      parts_value: formData.parts_value ? parseFloat(formData.parts_value) : 0,
      labor_value: formData.labor_value ? parseFloat(formData.labor_value) : 0,
      estimated_date: formData.estimated_date || null,
      checklist: Object.keys(checklist).length > 0 ? checklist : null,
      status: 'received' as ServiceOrderStatus,
      store_id: null,
      technician_id: null,
      receptionist_id: '',
      discount: 0,
      warranty_until: null,
      completed_date: null,
      delivered_date: null,
      images: null,
    };

    try {
      if (selectedOrder) {
        await updateServiceOrder.mutateAsync({ id: selectedOrder.id, ...orderData });
        toast.success('OS atualizada!');
      } else {
        await createServiceOrder.mutateAsync(orderData);
        toast.success('OS criada!');
      }
      setShowModal(false);
      resetForm();
    } catch (error) {
      toast.error('Erro ao salvar OS');
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: ServiceOrderStatus) => {
    await updateServiceOrder.mutateAsync({ id: orderId, status: newStatus });
  };

  const sendWhatsApp = (phone: string, orderNumber: number) => {
    const message = encodeURIComponent(`Olá! Sua ordem de serviço #${orderNumber} está pronta para retirada.`);
    window.open(`https://wa.me/55${phone?.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  const printOS = (order: any) => {
    toast.success(`Imprimindo OS #${order.number}`);
  };

  const toggleAccessory = (accessory: string) => {
    setAccessories(prev => 
      prev.includes(accessory) 
        ? prev.filter(a => a !== accessory)
        : [...prev, accessory]
    );
  };

  const toggleChecklistItem = (item: string) => {
    setChecklist(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
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
      {/* Shortcut Bar */}
      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg overflow-x-auto">
        <Button onClick={() => handleOpenModal()} size="sm" className="gap-1">
          <Plus className="w-4 h-4" />
          Nova OS <kbd className="ml-1 text-xs opacity-70">F2</kbd>
        </Button>
        <Button variant="outline" size="sm" disabled={!selectedOrder} className="gap-1">
          <Save className="w-4 h-4" />
          Salvar <kbd className="ml-1 text-xs opacity-70">F4</kbd>
        </Button>
        <Button variant="outline" size="sm" disabled={!selectedOrder} className="gap-1">
          <Edit className="w-4 h-4" />
          Alterar <kbd className="ml-1 text-xs opacity-70">F5</kbd>
        </Button>
        <Button variant="outline" size="sm" className="gap-1">
          <Search className="w-4 h-4" />
          Localizar <kbd className="ml-1 text-xs opacity-70">F9</kbd>
        </Button>
        <div className="flex-1" />
        <Button variant="outline" size="sm" disabled={!selectedOrder} className="gap-1" onClick={() => selectedOrder && printOS(selectedOrder)}>
          <Printer className="w-4 h-4" />
          Cupom 80mm <kbd className="ml-1 text-xs opacity-70">F7</kbd>
        </Button>
        <Button variant="outline" size="sm" disabled={!selectedOrder} className="gap-1">
          <Printer className="w-4 h-4" />
          Cupom 58mm <kbd className="ml-1 text-xs opacity-70">F8</kbd>
        </Button>
        <Button variant="outline" size="sm" disabled={!selectedOrder} className="gap-1">
          <Camera className="w-4 h-4" />
          Foto
        </Button>
        <Button variant="outline" size="sm" disabled={!selectedOrder} className="gap-1">
          <MessageCircle className="w-4 h-4 text-green-500" />
          WhatsApp
        </Button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Wrench className="h-7 w-7 text-primary" />
            Ordens de Serviço
          </h1>
          <p className="text-muted-foreground">Gerencie suas ordens de serviço</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="icon-box">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="icon-box-warning">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10">
                <Wrench className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="icon-box-success">
                <CheckCircle className="w-5 h-5" />
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
              <Card 
                key={order.id} 
                className={`hover:shadow-md transition-shadow cursor-pointer ${selectedOrder?.id === order.id ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedOrder(order)}
              >
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
                            Valor estimado: {formatCurrency(order.estimated_value)}
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
                            onClick={(e) => { e.stopPropagation(); sendWhatsApp(order.customer.phone!, order.number); }}
                          >
                            <MessageCircle className="w-4 h-4 text-green-500" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); handleOpenModal(order); }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); printOS(order); }}
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                      </div>
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleStatusChange(order.id, value as ServiceOrderStatus)}
                      >
                        <SelectTrigger className="w-[160px] h-8 text-xs" onClick={(e) => e.stopPropagation()}>
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

      {/* Full Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-primary" />
              {selectedOrder ? `Editar OS #${selectedOrder.number}` : 'Nova Ordem de Serviço'}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <div className="grid grid-cols-4 gap-6 h-full">
              {/* Main Content */}
              <div className="col-span-3 space-y-4 overflow-y-auto pr-4">
                {/* Customer & Equipment Row */}
                <div className="grid grid-cols-2 gap-4">
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
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Status</Label>
                      <Select defaultValue="received">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusConfig).map(([key, config]) => (
                            <SelectItem key={key} value={key}>{config.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Prioridade</Label>
                      <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
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
                  </div>
                </div>

                {/* Equipment */}
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Dados do Equipamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <Label>Tipo *</Label>
                        <Input
                          value={formData.equipment_type}
                          onChange={(e) => setFormData({ ...formData, equipment_type: e.target.value })}
                          placeholder="Celular, Notebook..."
                        />
                      </div>
                      <div>
                        <Label>Marca</Label>
                        <Input
                          value={formData.equipment_brand}
                          onChange={(e) => setFormData({ ...formData, equipment_brand: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Modelo</Label>
                        <Input
                          value={formData.equipment_model}
                          onChange={(e) => setFormData({ ...formData, equipment_model: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Cor</Label>
                        <Input
                          value={formData.equipment_color}
                          onChange={(e) => setFormData({ ...formData, equipment_color: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Número de Série / IMEI</Label>
                        <Input
                          value={formData.equipment_serial}
                          onChange={(e) => setFormData({ ...formData, equipment_serial: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Condição</Label>
                        <Input
                          value={formData.equipment_condition}
                          onChange={(e) => setFormData({ ...formData, equipment_condition: e.target.value })}
                          placeholder="Bom estado, arranhões..."
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Problem / Report / Notes */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Problema Relatado *</Label>
                    <Textarea
                      value={formData.defect_reported}
                      onChange={(e) => setFormData({ ...formData, defect_reported: e.target.value })}
                      placeholder="Descreva o problema informado pelo cliente..."
                      className="h-24"
                    />
                  </div>
                  <div>
                    <Label>Defeito Encontrado</Label>
                    <Textarea
                      value={formData.defect_found}
                      onChange={(e) => setFormData({ ...formData, defect_found: e.target.value })}
                      placeholder="Descreva o defeito encontrado..."
                      className="h-24"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Laudo Técnico</Label>
                    <Textarea
                      value={formData.technical_report}
                      onChange={(e) => setFormData({ ...formData, technical_report: e.target.value })}
                      placeholder="Laudo técnico..."
                      className="h-24"
                    />
                  </div>
                  <div>
                    <Label>Solução</Label>
                    <Textarea
                      value={formData.solution}
                      onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                      placeholder="Solução aplicada..."
                      className="h-24"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Observações do Cliente</Label>
                    <Textarea
                      value={formData.customer_notes}
                      onChange={(e) => setFormData({ ...formData, customer_notes: e.target.value })}
                      className="h-20"
                    />
                  </div>
                  <div>
                    <Label>Observações Internas</Label>
                    <Textarea
                      value={formData.internal_notes}
                      onChange={(e) => setFormData({ ...formData, internal_notes: e.target.value })}
                      className="h-20"
                    />
                  </div>
                </div>

                {/* Values */}
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">Valores</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <Label>Valor Estimado</Label>
                        <Input
                          type="number"
                          value={formData.estimated_value}
                          onChange={(e) => setFormData({ ...formData, estimated_value: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Peças (R$)</Label>
                        <Input
                          type="number"
                          value={formData.parts_value}
                          onChange={(e) => setFormData({ ...formData, parts_value: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Mão de Obra (R$)</Label>
                        <Input
                          type="number"
                          value={formData.labor_value}
                          onChange={(e) => setFormData({ ...formData, labor_value: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Valor Final</Label>
                        <Input
                          type="number"
                          value={formData.final_value}
                          onChange={(e) => setFormData({ ...formData, final_value: e.target.value })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Side Panel */}
              <div className="space-y-4 overflow-y-auto">
                {/* Accessories */}
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">Acessórios</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {defaultAccessories.map(acc => (
                      <div key={acc} className="flex items-center gap-2">
                        <Checkbox
                          checked={accessories.includes(acc)}
                          onCheckedChange={() => toggleAccessory(acc)}
                        />
                        <span className="text-sm">{acc}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Checklist */}
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">Checklist</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {defaultChecklist.map(item => (
                      <div key={item} className="flex items-center gap-2">
                        <Checkbox
                          checked={checklist[item] || false}
                          onCheckedChange={() => toggleChecklistItem(item)}
                        />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Dates */}
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">Datas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <Label>Previsão de Entrega</Label>
                      <Input
                        type="date"
                        value={formData.estimated_date}
                        onChange={(e) => setFormData({ ...formData, estimated_date: e.target.value })}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => printOS(selectedOrder)} disabled={!selectedOrder}>
                <Printer className="w-4 h-4 mr-2" />
                Imprimir OS
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
