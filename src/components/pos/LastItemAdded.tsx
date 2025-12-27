import { CartItem } from '@/types/pos';
import { Scale, Check } from 'lucide-react';

interface LastItemAddedProps {
  item: CartItem | null;
}

export function LastItemAdded({ item }: LastItemAddedProps) {
  if (!item) {
    return (
      <div className="bg-muted/30 border border-dashed border-border rounded-lg p-4 text-center">
        <p className="text-muted-foreground text-sm">Aguardando item...</p>
      </div>
    );
  }

  return (
    <div className="bg-success/5 border border-success/30 rounded-lg p-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center">
          <Check className="w-3 h-3 text-success-foreground" />
        </div>
        <span className="text-xs font-medium text-success uppercase tracking-wide">Último item adicionado</span>
      </div>
      
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-muted-foreground">{item.product.code}</span>
            <span className="text-lg font-semibold truncate">{item.product.name}</span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            {item.weight ? (
              <span className="flex items-center gap-1">
                <Scale className="w-3.5 h-3.5" />
                {item.weight.toFixed(3)} kg × R$ {item.product.price.toFixed(2).replace('.', ',')}
              </span>
            ) : (
              <span>{item.quantity} × R$ {item.product.price.toFixed(2).replace('.', ',')}</span>
            )}
          </div>
        </div>
        
        <div className="text-right">
          <span className="text-2xl font-bold tabular-nums">
            R$ {item.subtotal.toFixed(2).replace('.', ',')}
          </span>
        </div>
      </div>
    </div>
  );
}
