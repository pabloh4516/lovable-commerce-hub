import { useState, useEffect, useRef } from 'react';
import { X, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CartItem } from '@/types/pos';

interface QuantityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quantity: number) => void;
  item: CartItem | null;
}

export function QuantityModal({ isOpen, onClose, onConfirm, item }: QuantityModalProps) {
  const [quantity, setQuantity] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && item) {
      setQuantity(item.quantity.toString());
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, item]);

  const handleNumpadClick = (value: string) => {
    if (value === 'C') {
      setQuantity('');
    } else if (value === '⌫') {
      setQuantity((prev) => prev.slice(0, -1));
    } else {
      setQuantity((prev) => prev + value);
    }
  };

  const handleConfirm = () => {
    const numQuantity = parseInt(quantity) || 0;
    if (numQuantity > 0) {
      onConfirm(numQuantity);
      setQuantity('');
    }
  };

  const numpadButtons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'];
  const numQuantity = parseInt(quantity) || 0;
  const subtotal = item ? numQuantity * item.product.price : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-primary" />
              Alterar Quantidade
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {item && (
            <div className="p-3 bg-secondary rounded-xl">
              <p className="font-medium">{item.product.name}</p>
              <p className="text-sm text-muted-foreground">
                R$ {item.product.price.toFixed(2).replace('.', ',')} / {item.product.unit}
              </p>
            </div>
          )}

          <div className="text-center p-6 bg-secondary rounded-xl">
            <p className="text-sm text-muted-foreground mb-2">Quantidade</p>
            <p className="text-5xl font-bold">
              {quantity || '0'}
              <span className="text-2xl text-muted-foreground ml-2">{item?.product.unit || 'un'}</span>
            </p>
          </div>

          {numQuantity > 0 && (
            <div className="text-center p-3 bg-primary/10 rounded-xl border border-primary/30">
              <p className="text-sm text-muted-foreground">Subtotal</p>
              <p className="text-2xl font-bold text-primary">
                R$ {subtotal.toFixed(2).replace('.', ',')}
              </p>
            </div>
          )}

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
            variant="default"
            size="xl"
            className="w-full"
            onClick={handleConfirm}
            disabled={numQuantity <= 0}
          >
            Confirmar Quantidade
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
