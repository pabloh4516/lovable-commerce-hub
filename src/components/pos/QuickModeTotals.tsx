import { CartItem } from '@/types/pos';

interface QuickModeTotalsProps {
  items: CartItem[];
  subtotal: number;
  discountValue: number;
  total: number;
}

export function QuickModeTotals({ items, subtotal, discountValue, total }: QuickModeTotalsProps) {
  const itemCount = items.reduce((acc, item) => acc + (item.weight ? 1 : item.quantity), 0);

  return (
    <div className="bg-card border-t-2 border-border p-4">
      <div className="flex items-center justify-between text-lg">
        <span className="text-muted-foreground">
          {items.length} {items.length === 1 ? 'item' : 'itens'} ({itemCount} un.)
        </span>
        <div className="text-right">
          {discountValue > 0 && (
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="tabular-nums">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
            </div>
          )}
          {discountValue > 0 && (
            <div className="flex items-center gap-4 text-sm text-success">
              <span>Desconto:</span>
              <span className="tabular-nums">-R$ {discountValue.toFixed(2).replace('.', ',')}</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-2xl font-bold">TOTAL</span>
        <span className="text-4xl font-bold tabular-nums text-primary">
          R$ {total.toFixed(2).replace('.', ',')}
        </span>
      </div>
    </div>
  );
}
