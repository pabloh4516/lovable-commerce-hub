import { useState, useEffect, useRef } from 'react';
import { X, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Product } from '@/types/pos';

interface WeightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (weight: number) => void;
  product: Product | null;
}

export function WeightModal({ isOpen, onClose, onConfirm, product }: WeightModalProps) {
  const [weight, setWeight] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setWeight('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleNumpadClick = (value: string) => {
    if (value === 'C') {
      setWeight('');
    } else if (value === '⌫') {
      setWeight((prev) => prev.slice(0, -1));
    } else if (value === '.') {
      if (!weight.includes('.')) {
        setWeight((prev) => prev + '.');
      }
    } else {
      setWeight((prev) => prev + value);
    }
  };

  const handleConfirm = () => {
    const numWeight = parseFloat(weight) || 0;
    if (numWeight > 0) {
      onConfirm(numWeight);
      setWeight('');
    }
  };

  const numpadButtons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'];
  const numWeight = parseFloat(weight) || 0;
  const subtotal = product ? numWeight * product.price : 0;

  const quickWeights = [0.1, 0.25, 0.5, 1, 1.5, 2];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              Informar Peso
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {product && (
            <div className="p-3 bg-secondary rounded-xl">
              <p className="font-medium">{product.name}</p>
              <p className="text-sm text-muted-foreground">
                R$ {product.price.toFixed(2).replace('.', ',')} / {product.unit}
              </p>
            </div>
          )}

          <div className="text-center p-6 bg-secondary rounded-xl">
            <p className="text-sm text-muted-foreground mb-2">Peso em {product?.unit || 'kg'}</p>
            <p className="text-5xl font-bold">
              {weight || '0.000'}
              <span className="text-2xl text-muted-foreground ml-2">{product?.unit || 'kg'}</span>
            </p>
          </div>

          {numWeight > 0 && (
            <div className="text-center p-3 bg-primary/10 rounded-xl border border-primary/30">
              <p className="text-sm text-muted-foreground">Subtotal</p>
              <p className="text-2xl font-bold text-primary">
                R$ {subtotal.toFixed(2).replace('.', ',')}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 justify-center">
            {quickWeights.map((w) => (
              <Button
                key={w}
                variant="secondary"
                size="sm"
                onClick={() => setWeight(w.toString())}
              >
                {w} kg
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
            variant="default"
            size="xl"
            className="w-full"
            onClick={handleConfirm}
            disabled={numWeight <= 0}
          >
            Confirmar Peso
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
