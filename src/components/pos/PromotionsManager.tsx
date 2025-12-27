import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Tag,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Percent,
  Gift,
  Layers,
  Check,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  usePromotions, 
  usePromotionMutations, 
  Promotion, 
  PromotionType 
} from '@/hooks/usePromotions';
import { cn } from '@/lib/utils';

const promotionTypes: { value: PromotionType; label: string; icon: typeof Percent }[] = [
  { value: 'percentage', label: 'Desconto %', icon: Percent },
  { value: 'fixed', label: 'Desconto Fixo', icon: Tag },
  { value: 'buy_x_get_y', label: 'Leve X Pague Y', icon: Gift },
  { value: 'progressive', label: 'Progressivo', icon: Layers },
  { value: 'happy_hour', label: 'Happy Hour', icon: Clock },
];

export function PromotionsManager() {
  const { data: promotions, isLoading } = usePromotions();
  const { createPromotion, updatePromotion, deletePromotion } = usePromotionMutations();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'percentage' as PromotionType,
    value: 0,
    buy_quantity: 0,
    get_quantity: 0,
    min_quantity: 0,
    min_value: 0,
    max_discount: 0,
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'percentage',
      value: 0,
      buy_quantity: 0,
      get_quantity: 0,
      min_quantity: 0,
      min_value: 0,
      max_discount: 0,
      start_date: '',
      end_date: '',
      start_time: '',
      end_time: '',
      is_active: true,
    });
    setEditingPromotion(null);
  };

  const openNewModal = () => {
    resetForm();
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    setFormData(prev => ({
      ...prev,
      start_date: now.toISOString().split('T')[0],
      end_date: nextMonth.toISOString().split('T')[0],
    }));
    setIsModalOpen(true);
  };

  const openEditModal = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      name: promotion.name,
      description: promotion.description || '',
      type: promotion.type,
      value: promotion.value || 0,
      buy_quantity: promotion.buy_quantity || 0,
      get_quantity: promotion.get_quantity || 0,
      min_quantity: promotion.min_quantity || 0,
      min_value: promotion.min_value || 0,
      max_discount: promotion.max_discount || 0,
      start_date: promotion.start_date.split('T')[0],
      end_date: promotion.end_date.split('T')[0],
      start_time: promotion.start_time || '',
      end_time: promotion.end_time || '',
      is_active: promotion.is_active,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.start_date || !formData.end_date) {
      return;
    }

    const promotionData = {
      name: formData.name,
      description: formData.description || undefined,
      type: formData.type,
      value: formData.value || undefined,
      buy_quantity: formData.buy_quantity || undefined,
      get_quantity: formData.get_quantity || undefined,
      min_quantity: formData.min_quantity || undefined,
      min_value: formData.min_value || undefined,
      max_discount: formData.max_discount || undefined,
      start_date: new Date(formData.start_date).toISOString(),
      end_date: new Date(formData.end_date).toISOString(),
      start_time: formData.start_time || undefined,
      end_time: formData.end_time || undefined,
      is_active: formData.is_active,
    };

    try {
      if (editingPromotion) {
        await updatePromotion.mutateAsync({
          id: editingPromotion.id,
          ...promotionData,
        });
      } else {
        await createPromotion.mutateAsync({ promotion: promotionData });
      }
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja remover esta promoção?')) {
      await deletePromotion.mutateAsync(id);
    }
  };

  const isPromoActive = (promo: Promotion) => {
    if (!promo.is_active) return false;
    const now = new Date();
    return new Date(promo.start_date) <= now && new Date(promo.end_date) >= now;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" />
              Gerenciar Promoções
            </CardTitle>
            <Button onClick={openNewModal}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Promoção
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
                    <TableHead>Nome</TableHead>
                    <TableHead className="w-32">Tipo</TableHead>
                    <TableHead className="w-24">Valor</TableHead>
                    <TableHead className="w-40">Período</TableHead>
                    <TableHead className="w-24 text-center">Status</TableHead>
                    <TableHead className="w-24" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promotions?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Nenhuma promoção cadastrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    promotions?.map((promo) => {
                      const typeInfo = promotionTypes.find(t => t.value === promo.type);
                      const TypeIcon = typeInfo?.icon || Tag;
                      const active = isPromoActive(promo);

                      return (
                        <TableRow key={promo.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{promo.name}</div>
                              {promo.description && (
                                <div className="text-xs text-muted-foreground">
                                  {promo.description}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <TypeIcon className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">{typeInfo?.label}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {promo.type === 'percentage' && `${promo.value}%`}
                            {promo.type === 'fixed' && `R$ ${promo.value?.toFixed(2)}`}
                            {promo.type === 'buy_x_get_y' && 
                              `${(promo.buy_quantity || 0) + (promo.get_quantity || 0)}x${promo.buy_quantity}`}
                            {promo.type === 'happy_hour' && `${promo.value}%`}
                            {promo.type === 'progressive' && `até ${promo.max_discount}%`}
                          </TableCell>
                          <TableCell className="text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-muted-foreground" />
                              {format(new Date(promo.start_date), 'dd/MM/yy')} - 
                              {format(new Date(promo.end_date), 'dd/MM/yy')}
                            </div>
                            {promo.start_time && promo.end_time && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {promo.start_time} - {promo.end_time}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {active ? (
                              <Badge className="bg-success/10 text-success">
                                Ativa
                              </Badge>
                            ) : promo.is_active ? (
                              <Badge variant="secondary">
                                Agendada
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-muted text-muted-foreground">
                                Inativa
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEditModal(promo)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => handleDelete(promo.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
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
              <Tag className="w-5 h-5 text-primary" />
              {editingPromotion ? 'Editar Promoção' : 'Nova Promoção'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="name">Nome da Promoção *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Semana do Consumidor"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição da promoção..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de Promoção *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: PromotionType) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {promotionTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {(formData.type === 'percentage' || formData.type === 'fixed' || formData.type === 'happy_hour') && (
              <div className="space-y-2">
                <Label htmlFor="value">
                  {formData.type === 'fixed' ? 'Valor (R$)' : 'Desconto (%)'}
                </Label>
                <Input
                  id="value"
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                />
              </div>
            )}

            {formData.type === 'buy_x_get_y' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="buy_qty">Quantidade a Levar</Label>
                  <Input
                    id="buy_qty"
                    type="number"
                    value={formData.buy_quantity + formData.get_quantity}
                    onChange={(e) => {
                      const total = Number(e.target.value);
                      setFormData({ 
                        ...formData, 
                        buy_quantity: Math.max(1, total - 1),
                        get_quantity: 1
                      });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pay_qty">Quantidade a Pagar</Label>
                  <Input
                    id="pay_qty"
                    type="number"
                    value={formData.buy_quantity}
                    onChange={(e) => setFormData({ ...formData, buy_quantity: Number(e.target.value) })}
                  />
                </div>
              </>
            )}

            {formData.type === 'progressive' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="min_qty">Quantidade Mínima</Label>
                  <Input
                    id="min_qty"
                    type="number"
                    value={formData.min_quantity}
                    onChange={(e) => setFormData({ ...formData, min_quantity: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_disc">Desconto Máximo (%)</Label>
                  <Input
                    id="max_disc"
                    type="number"
                    value={formData.max_discount}
                    onChange={(e) => setFormData({ ...formData, max_discount: Number(e.target.value) })}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="start_date">Data Início *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">Data Fim *</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>

            {formData.type === 'happy_hour' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="start_time">Hora Início</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">Hora Fim</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  />
                </div>
              </>
            )}

            <div className="col-span-2 flex items-center gap-2 p-3 bg-secondary rounded-lg">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                Promoção ativa
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createPromotion.isPending || updatePromotion.isPending}
            >
              {createPromotion.isPending || updatePromotion.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
