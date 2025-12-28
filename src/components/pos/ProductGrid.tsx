import { forwardRef } from 'react';
import { Product } from '@/types/pos';
import { Scale, AlertTriangle, Package, Sparkles, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductGridProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const ProductGrid = forwardRef<HTMLDivElement, ProductGridProps>(
  function ProductGrid({ products, onSelectProduct }, ref) {
    if (products.length === 0) {
      return (
        <div ref={ref} className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center mb-5 shadow-inner">
            <Package className="w-10 h-10 opacity-40" />
          </div>
          <p className="font-semibold text-lg">Nenhum produto encontrado</p>
          <p className="text-sm mt-1.5 text-muted-foreground/80">Tente ajustar sua busca ou categoria</p>
        </div>
      );
    }

    return (
      <div ref={ref} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {products.map((product, index) => {
          const isLowStock = product.stock <= product.minStock;
          const isOutOfStock = product.stock <= 0;
          const stockPercentage = Math.min((product.stock / (product.minStock * 3)) * 100, 100);
          
          return (
            <button
              key={product.id}
              onClick={() => !isOutOfStock && onSelectProduct(product)}
              disabled={isOutOfStock}
              className={cn(
                "group relative text-left transition-all duration-300",
                "bg-gradient-to-br from-card to-card/80 rounded-2xl p-4",
                "border border-border/50 hover:border-primary/30",
                "hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                "animate-scale-in",
                isOutOfStock && "opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-none"
              )}
              style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Top badges row */}
              <div className="relative flex items-center justify-between mb-3 gap-2">
                <span className="text-xs font-mono text-muted-foreground bg-muted/80 px-2.5 py-1 rounded-lg border border-border/50">
                  {product.code}
                </span>
                <div className="flex items-center gap-1.5">
                  {product.isWeighted && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 px-2 py-1 rounded-lg border border-primary/20">
                      <Scale className="w-3 h-3" />
                      kg
                    </span>
                  )}
                </div>
              </div>
              
              {/* Product Name */}
              <h3 className="relative font-semibold text-sm line-clamp-2 mb-4 min-h-[2.5rem] group-hover:text-primary transition-colors duration-200">
                {product.name}
              </h3>
              
              {/* Price */}
              <div className="relative mb-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-xs text-muted-foreground">R$</span>
                  <span className="text-2xl font-bold tabular-nums tracking-tight">
                    {product.price.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                {product.isWeighted && (
                  <span className="text-xs text-muted-foreground">/kg</span>
                )}
              </div>

              {/* Stock indicator */}
              <div className="relative space-y-2">
                {/* Stock bar */}
                <div className="h-1.5 rounded-full bg-muted/80 overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      isOutOfStock 
                        ? "bg-destructive" 
                        : isLowStock 
                          ? "bg-warning" 
                          : "bg-success"
                    )}
                    style={{ width: `${stockPercentage}%` }}
                  />
                </div>
                
                {/* Stock text */}
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1",
                    isOutOfStock 
                      ? 'bg-destructive/10 text-destructive' 
                      : isLowStock 
                        ? 'bg-warning/10 text-warning' 
                        : 'bg-muted text-muted-foreground'
                  )}>
                    {isOutOfStock ? (
                      <>
                        <AlertTriangle className="w-3 h-3" />
                        Sem estoque
                      </>
                    ) : isLowStock ? (
                      <>
                        <AlertTriangle className="w-3 h-3" />
                        Baixo: {product.stock} {product.unit}
                      </>
                    ) : (
                      <>
                        {product.stock} {product.unit}
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Hover overlay effect */}
              <div className={cn(
                "absolute inset-x-0 bottom-0 h-1 rounded-b-2xl transition-all duration-300",
                "bg-gradient-to-r from-primary/60 via-primary to-primary/60",
                "opacity-0 group-hover:opacity-100"
              )} />
            </button>
          );
        })}
      </div>
    );
  }
);

ProductGrid.displayName = 'ProductGrid';
