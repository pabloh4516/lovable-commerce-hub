import { useState } from 'react';
import { X, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CashMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: number, reason: string) => void;
  type: 'withdrawal' | 'deposit';
}

const commonReasons = {
  withdrawal: ['Sangria de segurança', 'Pagamento de fornecedor', 'Despesas operacionais', 'Troco para outro caixa'],
  deposit: ['Troco adicional', 'Reforço de caixa', 'Devolução de sangria', 'Correção de diferença'],
};

export function CashMovementModal({ isOpen, onClose, onConfirm, type }: CashMovementModalProps) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const handleNumpadClick = (value: string) => {
    if (value === 'C') {
      setAmount('');
    } else if (value === '⌫') {
      setAmount((prev) => prev.slice(0, -1));
    } else if (value === '.') {
      if (!amount.includes('.')) {
        setAmount((prev) => prev + '.');
      }
    } else {
      setAmount((prev) => prev + value);
    }
  };

  const handleConfirm = () => {
    const numAmount = parseFloat(amount) || 0;
    if (numAmount > 0 && reason) {
      onConfirm(numAmount, reason);
      setAmount('');
      setReason('');
    }
  };

  const numpadButtons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'];

  const isWithdrawal = type === 'withdrawal';
  const Icon = isWithdrawal ? ArrowDownCircle : ArrowUpCircle;
  const title = isWithdrawal ? 'Sangria de Caixa' : 'Suprimento de Caixa';
  const color = isWithdrawal ? 'text-destructive' : 'text-success';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Icon className={`h-5 w-5 ${color}`} />
              {title}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center p-4 bg-secondary rounded-xl">
            <p className="text-sm text-muted-foreground mb-2">Valor</p>
            <p className={`text-4xl font-bold ${color}`}>
              R$ {amount ? parseFloat(amount).toFixed(2).replace('.', ',') : '0,00'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {numpadButtons.map((btn) => (
              <Button
                key={btn}
                variant="numpad"
                size="numpad"
                onClick={() => handleNumpadClick(btn)}
              >
                {btn}
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Motivo</label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Informe o motivo..."
              className="bg-secondary"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {commonReasons[type].map((r) => (
              <Button
                key={r}
                variant={reason === r ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setReason(r)}
              >
                {r}
              </Button>
            ))}
          </div>

          <Button
            variant={isWithdrawal ? 'destructive' : 'success'}
            size="xl"
            className="w-full"
            onClick={handleConfirm}
            disabled={!amount || !reason}
          >
            Confirmar {isWithdrawal ? 'Sangria' : 'Suprimento'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
