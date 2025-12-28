import { Package, TrendingUp } from 'lucide-react';
import { Product } from '@/types/pos';
import { cn } from '@/lib/utils';
import { AnimatedCounter } from './AnimatedCounter';

interface TopProductsListProps {
  products: { product: Product; quantity: number }[];
}

const rankStyles = [
  'bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg shadow-yellow-500/30',
  'bg-gradient-to-br from-slate-300 to-slate-400 text-white shadow-lg shadow-slate-400/30',
  'bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-lg shadow-amber-600/30',
];

export function TopProductsList({ products }: TopProductsListProps) {
  const maxQuantity = Math.max(...products.map(p => p.quantity), 1);

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Top Produtos</h3>
            <p className="text-sm text-muted-foreground">Mais vendidos hoje</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {products.map((item, index) => {
          const barWidth = (item.quantity / maxQuantity) * 100;
          
          return (
            <div
              key={item.product.id}
              className="group relative flex items-center gap-4 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/60 transition-all duration-200 animate-slide-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {/* Rank badge */}
              <span className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0',
                index < 3 ? rankStyles[index] : 'bg-muted text-muted-foreground'
              )}>
                {index + 1}
              </span>

              {/* Product info */}
              <div className="flex-1 min-w-0 relative">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold truncate pr-4">{item.product.name}</p>
                  <span className="text-sm font-bold text-primary tabular-nums shrink-0">
                    <AnimatedCounter 
                      value={item.quantity} 
                      suffix=" un"
                      delay={index * 100}
                      duration={1500}
                    />
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    R$ {item.product.price.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-xs text-success font-medium">
                    R$ {(item.product.price * item.quantity).toFixed(2).replace('.', ',')}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-full overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity">
                  <div 
                    className="h-full bg-primary/50 rounded-full transition-all duration-500"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
