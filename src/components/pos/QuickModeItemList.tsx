import { useRef, useEffect } from 'react';
import { CartItemWithPromotion } from '@/hooks/useCartWithPromotions';
import { ScrollArea } from '@/components/ui/scroll-area';

interface QuickModeItemListProps {
  items: CartItemWithPromotion[];
  selectedItemId: string | null;
  onSelectItem: (item: CartItemWithPromotion | null) => void;
}

export function QuickModeItemList({ items, selectedItemId, onSelectItem }: QuickModeItemListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [items.length]);

  if (items.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p className="text-lg">Nenhum item na venda</p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="font-mono text-sm">
        {/* Header */}
        <div className="grid grid-cols-[40px_1fr_80px_80px_100px] gap-2 px-4 py-2 border-b border-border bg-muted/50 text-muted-foreground font-medium sticky top-0">
          <span>#</span>
          <span>PRODUTO</span>
          <span className="text-right">QTD</span>
          <span className="text-right">UNIT</span>
          <span className="text-right">TOTAL</span>
        </div>
        
        {/* Items */}
        {items.map((item, index) => (
          <div
            key={item.id}
            onClick={() => onSelectItem(selectedItemId === item.id ? null : item)}
            className={`grid grid-cols-[40px_1fr_80px_80px_100px] gap-2 px-4 py-3 border-b border-border/50 cursor-pointer transition-colors ${
              selectedItemId === item.id
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-muted/50'
            }`}
          >
            <span className="text-muted-foreground">{(index + 1).toString().padStart(3, '0')}</span>
            <span className="truncate font-medium">
              {item.product.code} - {item.product.name}
              {item.discount > 0 && (
                <span className="ml-2 text-success text-xs">
                  (-{item.discountType === 'percent' ? `${item.discount}%` : `R$${item.discount.toFixed(2)}`})
                </span>
              )}
            </span>
            <span className="text-right tabular-nums">
              {item.weight ? `${item.weight.toFixed(3)}kg` : item.quantity}
            </span>
            <span className="text-right tabular-nums text-muted-foreground">
              {item.product.price.toFixed(2)}
            </span>
            <span className="text-right tabular-nums font-bold">
              {item.subtotal.toFixed(2)}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
