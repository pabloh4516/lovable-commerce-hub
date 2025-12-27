import { CartItem } from '@/types/pos';

interface TotalsPanelProps {
  items: CartItem[];
  totalDiscount: number;
  totalDiscountType: 'percent' | 'value';
}

export function TotalsPanel({ items, totalDiscount, totalDiscountType }: TotalsPanelProps) {
  const itemCount = items.reduce((sum, item) => sum + (item.weight ? 1 : item.quantity), 0);
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const discountValue = totalDiscountType === 'percent' ? (subtotal * totalDiscount / 100) : totalDiscount;
  const total = subtotal - discountValue;

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="grid grid-cols-2 gap-x-8 gap-y-2">
        {/* Left column */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Qtd. Itens:</span>
          <span className="font-semibold tabular-nums">{items.length}</span>
        </div>
        
        {/* Right column */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Subtotal:</span>
          <span className="font-semibold tabular-nums">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
        </div>
        
        {/* Left column */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Unidades:</span>
          <span className="font-semibold tabular-nums">{itemCount}</span>
        </div>
        
        {/* Right column */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Desconto:</span>
          <span className={`font-semibold tabular-nums ${discountValue > 0 ? 'text-success' : ''}`}>
            {discountValue > 0 ? '-' : ''}R$ {discountValue.toFixed(2).replace('.', ',')}
          </span>
        </div>
      </div>
      
      {/* Total - Full width */}
      <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
        <span className="text-lg font-semibold">TOTAL:</span>
        <span className="text-3xl font-bold tabular-nums">
          R$ {total.toFixed(2).replace('.', ',')}
        </span>
      </div>
    </div>
  );
}
