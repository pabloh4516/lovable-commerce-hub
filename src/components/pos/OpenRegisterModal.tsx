import { useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface OpenRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => void;
}

export function OpenRegisterModal({ isOpen, onClose, onConfirm }: OpenRegisterModalProps) {
  const [amount, setAmount] = useState('0');

  const handleNumpadClick = (value: string) => {
    if (value === 'C') {
      setAmount('0');
    } else if (value === '⌫') {
      setAmount((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
    } else if (value === '.') {
      if (!amount.includes('.')) {
        setAmount((prev) => prev + '.');
      }
    } else {
      setAmount((prev) => (prev === '0' ? value : prev + value));
    }
  };

  const handleQuickAmount = (value: number) => {
    setAmount(value.toFixed(2));
  };

  const handleConfirm = () => {
    const numAmount = parseFloat(amount) || 0;
    onConfirm(numAmount);
    setAmount('0');
  };

  const numpadButtons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-success" />
              Abertura de Caixa
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center p-6 bg-secondary rounded-xl">
            <p className="text-sm text-muted-foreground mb-2">Valor inicial do caixa (Fundo de troco)</p>
            <p className="text-4xl font-bold text-success">
              R$ {parseFloat(amount || '0').toFixed(2).replace('.', ',')}
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[50, 100, 200, 500].map((value) => (
              <Button
                key={value}
                variant="secondary"
                size="sm"
                onClick={() => handleQuickAmount(value)}
              >
                R$ {value}
              </Button>
            ))}
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

          <Button
            variant="success"
            size="xl"
            className="w-full"
            onClick={handleConfirm}
          >
            Abrir Caixa
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
