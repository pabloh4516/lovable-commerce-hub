import { Clock, DollarSign, ShoppingCart, ArrowRightLeft, User } from 'lucide-react';
import { RegisterShift } from '@/hooks/useShifts';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ShiftPanelProps {
  shift: RegisterShift | null;
  operatorName?: string;
  onChangeShift?: () => void;
  compact?: boolean;
}

export function ShiftPanel({ shift, operatorName, onChangeShift, compact = false }: ShiftPanelProps) {
  const formatCurrency = (value: number) => 
    `R$ ${value.toFixed(2).replace('.', ',')}`;

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const getShiftDuration = () => {
    if (!shift) return '0h 0m';
    const start = new Date(shift.started_at);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (!shift) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-warning/10 text-warning">
        <Clock className="h-4 w-4" />
        <span className="text-sm font-medium">Sem turno ativo</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary">
          <User className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">{operatorName || 'Operador'}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>{getShiftDuration()}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShoppingCart className="h-3.5 w-3.5" />
          <span>{shift.sales_count} vendas</span>
        </div>
        {onChangeShift && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onChangeShift}
            className="h-7 px-2 text-xs"
          >
            <ArrowRightLeft className="h-3.5 w-3.5 mr-1" />
            Trocar
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-card border border-border space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          Turno Atual
        </h3>
        {onChangeShift && (
          <Button variant="outline" size="sm" onClick={onChangeShift}>
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            Trocar Turno
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-secondary/50">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <User className="h-3 w-3" />
            Operador
          </div>
          <div className="font-medium text-sm mt-1">{operatorName || 'Não identificado'}</div>
        </div>
        
        <div className="p-3 rounded-lg bg-secondary/50">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Duração
          </div>
          <div className="font-medium text-sm mt-1">
            {formatTime(shift.started_at)} • {getShiftDuration()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 rounded-lg bg-primary/5">
          <div className="text-xs text-muted-foreground">Vendas</div>
          <div className="font-bold text-lg">{shift.sales_count}</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-success/5">
          <div className="text-xs text-muted-foreground">Total</div>
          <div className="font-bold text-lg text-success">{formatCurrency(shift.sales_total || 0)}</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-secondary">
          <div className="text-xs text-muted-foreground">Dinheiro</div>
          <div className="font-bold text-lg">{formatCurrency(shift.cash_total || 0)}</div>
        </div>
      </div>

      {/* Payment Methods Breakdown */}
      <div className="grid grid-cols-4 gap-2 text-xs">
        <div className="p-2 rounded-lg bg-secondary/50 text-center">
          <div className="text-muted-foreground">PIX</div>
          <div className="font-medium">{formatCurrency(shift.pix_total || 0)}</div>
        </div>
        <div className="p-2 rounded-lg bg-secondary/50 text-center">
          <div className="text-muted-foreground">Crédito</div>
          <div className="font-medium">{formatCurrency(shift.credit_total || 0)}</div>
        </div>
        <div className="p-2 rounded-lg bg-secondary/50 text-center">
          <div className="text-muted-foreground">Débito</div>
          <div className="font-medium">{formatCurrency(shift.debit_total || 0)}</div>
        </div>
        <div className="p-2 rounded-lg bg-secondary/50 text-center">
          <div className="text-muted-foreground">Fiado</div>
          <div className="font-medium">{formatCurrency(shift.fiado_total || 0)}</div>
        </div>
      </div>
    </div>
  );
}
