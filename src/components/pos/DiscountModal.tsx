import { useState } from 'react';
import { X, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CartItem } from '@/types/pos';

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (discount: number, type: 'percent' | 'value') => void;
  item?: CartItem | null;
  currentTotal?: number;
  isItemDiscount?: boolean;
}

export function DiscountModal({ isOpen, onClose, onConfirm, item, currentTotal, isItemDiscount = true }: DiscountModalProps) {
  const [discount, setDiscount] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'value'>('percent');

  const handleNumpadClick = (value: string) => {
    if (value === 'C') {
      setDiscount('');
    } else if (value === '⌫') {
      setDiscount((prev) => prev.slice(0, -1));
    } else if (value === '.') {
      if (!discount.includes('.')) {
        setDiscount((prev) => prev + '.');
      }
    } else {
      setDiscount((prev) => prev + value);
    }
  };

  const handleConfirm = () => {
    const numDiscount = parseFloat(discount) || 0;
    if (numDiscount > 0) {
      onConfirm(numDiscount, discountType);
      setDiscount('');
    }
  };

  const numpadButtons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'];
  const numDiscount = parseFloat(discount) || 0;
  
  const baseValue = isItemDiscount ? (item?.subtotal || 0) : (currentTotal || 0);
  const discountValue = discountType === 'percent' 
    ? (baseValue * numDiscount / 100)
    : numDiscount;
  const finalValue = baseValue - discountValue;

  const quickDiscounts = [5, 10, 15, 20];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-warning" />
              {isItemDiscount ? 'Desconto no Item' : 'Desconto na Venda'}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {isItemDiscount && item && (
            <div className="p-3 bg-secondary rounded-xl">
              <p className="font-medium">{item.product.name}</p>
              <p className="text-sm text-muted-foreground">
                Subtotal: R$ {item.subtotal.toFixed(2).replace('.', ',')}
              </p>
            </div>
          )}

          {!isItemDiscount && (
            <div className="p-3 bg-secondary rounded-xl text-center">
              <p className="text-sm text-muted-foreground">Total da venda</p>
              <p className="text-xl font-bold">
                R$ {(currentTotal || 0).toFixed(2).replace('.', ',')}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant={discountType === 'percent' ? 'default' : 'secondary'}
              className="flex-1"
              onClick={() => setDiscountType('percent')}
            >
              Porcentagem (%)
            </Button>
            <Button
              variant={discountType === 'value' ? 'default' : 'secondary'}
              className="flex-1"
              onClick={() => setDiscountType('value')}
            >
              Valor (R$)
            </Button>
          </div>

          <div className="text-center p-6 bg-secondary rounded-xl">
            <p className="text-sm text-muted-foreground mb-2">
              Desconto {discountType === 'percent' ? '(%)' : '(R$)'}
            </p>
            <p className="text-5xl font-bold text-warning">
              {discountType === 'percent' ? '' : 'R$ '}
              {discount || '0'}
              {discountType === 'percent' ? '%' : ''}
            </p>
          </div>

          {discountType === 'percent' && (
            <div className="flex flex-wrap gap-2 justify-center">
              {quickDiscounts.map((d) => (
                <Button
                  key={d}
                  variant="secondary"
                  size="sm"
                  onClick={() => setDiscount(d.toString())}
                >
                  {d}%
                </Button>
              ))}
            </div>
          )}

          {numDiscount > 0 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-destructive/10 rounded-xl text-center border border-destructive/30">
                <p className="text-sm text-muted-foreground">Desconto</p>
                <p className="text-xl font-bold text-destructive">
                  - R$ {discountValue.toFixed(2).replace('.', ',')}
                </p>
              </div>
              <div className="p-3 bg-success/10 rounded-xl text-center border border-success/30">
                <p className="text-sm text-muted-foreground">Final</p>
                <p className="text-xl font-bold text-success">
                  R$ {finalValue.toFixed(2).replace('.', ',')}
                </p>
              </div>
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
            variant="warning"
            size="xl"
            className="w-full bg-warning text-warning-foreground hover:bg-warning/90"
            onClick={handleConfirm}
            disabled={numDiscount <= 0}
          >
            Aplicar Desconto
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
