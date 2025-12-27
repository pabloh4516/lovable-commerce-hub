import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Package, 
  Plus, 
  Minus, 
  ArrowUpDown, 
  FileInput, 
  AlertTriangle,
  X 
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useStockMutations, StockMovementType } from '@/hooks/useStockMovements';
import { Product } from '@/types/pos';

const movementSchema = z.object({
  quantity: z.number().positive('Quantidade deve ser maior que zero'),
  reason: z.string().min(1, 'Motivo é obrigatório'),
  unitCost: z.number().optional(),
  batchNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  notes: z.string().optional(),
});

type MovementForm = z.infer<typeof movementSchema>;

interface StockMovementModalProps {
  open: boolean;
  onClose: () => void;
  product?: Product | null;
  initialType?: StockMovementType;
}

const movementTypes: { value: StockMovementType; label: string; icon: typeof Plus; color: string }[] = [
  { value: 'entrada', label: 'Entrada', icon: Plus, color: 'text-success' },
  { value: 'saida', label: 'Saída', icon: Minus, color: 'text-destructive' },
  { value: 'ajuste', label: 'Ajuste', icon: ArrowUpDown, color: 'text-primary' },
  { value: 'perda', label: 'Perda/Quebra', icon: AlertTriangle, color: 'text-warning' },
  { value: 'devolucao', label: 'Devolução', icon: FileInput, color: 'text-blue-500' },
  { value: 'inventario', label: 'Inventário', icon: Package, color: 'text-purple-500' },
];

const reasonOptions: Record<StockMovementType, string[]> = {
  entrada: ['Compra de fornecedor', 'Transferência recebida', 'Devolução de cliente', 'Ajuste de inventário', 'Outro'],
  saida: ['Venda', 'Transferência enviada', 'Consumo interno', 'Amostra', 'Outro'],
  ajuste: ['Correção de inventário', 'Diferença de contagem', 'Erro de lançamento', 'Outro'],
  perda: ['Produto vencido', 'Produto danificado', 'Roubo/Furto', 'Outro'],
  devolucao: ['Devolução ao fornecedor', 'Produto defeituoso', 'Outro'],
  inventario: ['Contagem física', 'Balanço', 'Outro'],
  transferencia_entrada: ['Transferência entre lojas'],
  transferencia_saida: ['Transferência entre lojas'],
  venda: ['Venda'],
};

export function StockMovementModal({
  open,
  onClose,
  product,
  initialType = 'entrada',
}: StockMovementModalProps) {
  const [type, setType] = useState<StockMovementType>(initialType);
  const { createMovement } = useStockMutations();
  
  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm<MovementForm>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      quantity: 1,
      reason: '',
    },
  });

  const selectedReason = watch('reason');

  const handleClose = () => {
    reset();
    setType(initialType);
    onClose();
  };

  const onSubmit = async (data: MovementForm) => {
    if (!product) return;

    await createMovement.mutateAsync({
      productId: product.id,
      type,
      quantity: data.quantity,
      reason: data.reason,
      unitCost: data.unitCost,
      batchNumber: data.batchNumber,
      expiryDate: data.expiryDate || undefined,
      notes: data.notes,
    });

    handleClose();
  };

  const currentType = movementTypes.find(t => t.value === type);
  const Icon = currentType?.icon || Package;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Movimentação de Estoque
          </DialogTitle>
        </DialogHeader>

        {product && (
          <div className="p-3 bg-secondary rounded-lg mb-4">
            <div className="font-medium">{product.name}</div>
            <div className="text-sm text-muted-foreground">
              Código: {product.code} | Estoque atual: {product.stock} {product.unit}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {movementTypes.slice(0, 6).map((mt) => {
              const TypeIcon = mt.icon;
              return (
                <Button
                  key={mt.value}
                  type="button"
                  variant={type === mt.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setType(mt.value);
                    setValue('reason', '');
                  }}
                  className="flex flex-col items-center gap-1 h-auto py-2"
                >
                  <TypeIcon className={`w-4 h-4 ${type === mt.value ? '' : mt.color}`} />
                  <span className="text-xs">{mt.label}</span>
                </Button>
              );
            })}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantidade</Label>
            <Input
              id="quantity"
              type="number"
              step="0.001"
              min="0.001"
              {...register('quantity', { valueAsNumber: true })}
              className="text-lg font-mono"
            />
            {errors.quantity && (
              <p className="text-sm text-destructive">{errors.quantity.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Motivo</Label>
            <Select
              value={selectedReason}
              onValueChange={(value) => setValue('reason', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o motivo" />
              </SelectTrigger>
              <SelectContent>
                {reasonOptions[type]?.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.reason && (
              <p className="text-sm text-destructive">{errors.reason.message}</p>
            )}
          </div>

          {type === 'entrada' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="unitCost">Custo Unitário (opcional)</Label>
                <Input
                  id="unitCost"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  {...register('unitCost', { valueAsNumber: true })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="batchNumber">Lote (opcional)</Label>
                  <Input
                    id="batchNumber"
                    placeholder="Ex: LT2024001"
                    {...register('batchNumber')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Validade (opcional)</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    {...register('expiryDate')}
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Informações adicionais..."
              rows={2}
              {...register('notes')}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={createMovement.isPending}
            >
              <Icon className="w-4 h-4 mr-2" />
              {createMovement.isPending ? 'Salvando...' : 'Confirmar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
