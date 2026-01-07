import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRightLeft, Clock, DollarSign, User } from 'lucide-react';
import { RegisterShift } from '@/hooks/useShifts';

interface ShiftChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (countedCash: number, notes?: string) => void;
  currentShift: RegisterShift | null;
}

export function ShiftChangeModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  currentShift 
}: ShiftChangeModalProps) {
  const [countedCash, setCountedCash] = useState('');
  const [notes, setNotes] = useState('');

  const formatCurrency = (value: number) => 
    `R$ ${value.toFixed(2).replace('.', ',')}`;

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const handleNumpadClick = (value: string) => {
    if (value === 'C') {
      setCountedCash('');
    } else if (value === '<') {
      setCountedCash((prev) => prev.slice(0, -1));
    } else if (value === '.') {
      if (!countedCash.includes('.')) {
        setCountedCash((prev) => prev + value);
      }
    } else {
      setCountedCash((prev) => prev + value);
    }
  };

  const handleConfirm = () => {
    const cash = parseFloat(countedCash) || 0;
    onConfirm(cash, notes || undefined);
    setCountedCash('');
    setNotes('');
  };

  const expectedCash = currentShift 
    ? (currentShift.starting_cash || 0) + 
      (currentShift.cash_total || 0) - 
      (currentShift.withdrawals_total || 0) + 
      (currentShift.deposits_total || 0)
    : 0;

  const countedValue = parseFloat(countedCash) || 0;
  const difference = countedValue - expectedCash;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-primary" />
            Troca de Turno
          </DialogTitle>
          <DialogDescription>
            Informe o valor em dinheiro no caixa para finalizar seu turno
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Current Shift Info */}
          {currentShift && (
            <div className="p-4 rounded-xl bg-secondary/50 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Início do Turno
                </span>
                <span className="font-medium">{formatTime(currentShift.started_at)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Vendas no Turno
                </span>
                <span className="font-medium">
                  {currentShift.sales_count} vendas • {formatCurrency(currentShift.sales_total || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Dinheiro Esperado</span>
                <span className="font-bold text-lg">{formatCurrency(expectedCash)}</span>
              </div>
            </div>
          )}

          {/* Cash Count Display */}
          <div className="p-4 rounded-xl bg-card border border-border">
            <label className="text-sm text-muted-foreground">Valor Contado</label>
            <div className="text-3xl font-bold tabular-nums mt-1">
              R$ {countedCash || '0,00'}
            </div>
            {countedValue > 0 && (
              <div className={`text-sm mt-2 ${difference >= 0 ? 'text-success' : 'text-destructive'}`}>
                Diferença: {difference >= 0 ? '+' : ''}{formatCurrency(difference)}
              </div>
            )}
          </div>

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-2">
            {['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0', '<'].map((key) => (
              <button
                key={key}
                onClick={() => handleNumpadClick(key)}
                className="h-12 rounded-lg bg-secondary hover:bg-secondary/80 font-semibold text-lg transition-colors"
              >
                {key === '<' ? '⌫' : key}
              </button>
            ))}
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm text-muted-foreground">Observações (opcional)</label>
            <Textarea
              placeholder="Adicione observações sobre o turno..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1"
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirm} 
              className="flex-1"
              disabled={!countedCash}
            >
              <User className="h-4 w-4 mr-2" />
              Trocar Turno
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
