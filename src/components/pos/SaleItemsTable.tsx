import { CartItem } from '@/types/pos';
import { Trash2, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SaleItemsTableProps {
  items: CartItem[];
  selectedItemId: string | null;
  onSelectItem: (item: CartItem) => void;
  onRemoveItem: (itemId: string) => void;
}

export function SaleItemsTable({ items, selectedItemId, onSelectItem, onRemoveItem }: SaleItemsTableProps) {
  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-12">
        <div className="text-6xl mb-4 opacity-20">📋</div>
        <p className="text-lg font-medium">Nenhum item na venda</p>
        <p className="text-sm mt-1">Escaneie um código de barras ou busque um produto</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Table Header */}
      <div className="grid grid-cols-[40px_80px_1fr_80px_100px_100px_40px] gap-2 px-4 py-2 bg-muted text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b border-border">
        <span className="text-center">#</span>
        <span>Código</span>
        <span>Descrição</span>
        <span className="text-center">Qtd</span>
        <span className="text-right">Unit.</span>
        <span className="text-right">Total</span>
        <span></span>
      </div>

      {/* Table Body */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {items.map((item, index) => (
          <div
            key={item.id}
            onClick={() => onSelectItem(item)}
            className={`grid grid-cols-[40px_80px_1fr_80px_100px_100px_40px] gap-2 px-4 py-3 border-b border-border cursor-pointer transition-colors duration-100 ${
              selectedItemId === item.id
                ? 'bg-primary/10 border-l-2 border-l-primary'
                : 'hover:bg-muted/50'
            }`}
          >
            <span className="text-center text-muted-foreground tabular-nums">{index + 1}</span>
            <span className="text-sm font-mono text-muted-foreground">{item.product.code}</span>
            <div className="flex items-center gap-2 min-w-0">
              <span className="truncate font-medium">{item.product.name}</span>
              {item.weight && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  <Scale className="w-3 h-3" />
                  {item.weight.toFixed(3)}kg
                </span>
              )}
              {item.discount > 0 && (
                <span className="text-xs text-success bg-success/10 px-1.5 py-0.5 rounded">
                  -{item.discountType === 'percent' ? `${item.discount}%` : `R$${item.discount.toFixed(2)}`}
                </span>
              )}
            </div>
            <span className="text-center tabular-nums font-medium">
              {item.weight ? `${item.weight.toFixed(3)}` : item.quantity}
              <span className="text-xs text-muted-foreground ml-1">{item.product.unit}</span>
            </span>
            <span className="text-right tabular-nums text-muted-foreground">
              R$ {item.product.price.toFixed(2).replace('.', ',')}
            </span>
            <span className="text-right tabular-nums font-semibold">
              R$ {item.subtotal.toFixed(2).replace('.', ',')}
            </span>
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveItem(item.id);
                }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
