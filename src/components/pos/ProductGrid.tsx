import { forwardRef } from 'react';
import { Product } from '@/types/pos';
import { Scale, AlertTriangle, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductGridProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const ProductGrid = forwardRef<HTMLDivElement, ProductGridProps>(
  function ProductGrid({ products, onSelectProduct }, ref) {
    if (products.length === 0) {
      return (
        <div ref={ref} className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Package className="w-12 h-12 opacity-30 mb-3" />
          <p className="font-medium">Nenhum produto encontrado</p>
          <p className="text-sm mt-1">Tente ajustar sua busca</p>
        </div>
      );
    }

    return (
      <div ref={ref} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
        {products.map((product) => {
          const isLowStock = product.stock <= product.minStock;
          const isOutOfStock = product.stock <= 0;
          
          return (
            <button
              key={product.id}
              onClick={() => !isOutOfStock && onSelectProduct(product)}
              disabled={isOutOfStock}
              className={cn(
                "text-left p-4 rounded-xl border border-border bg-card transition-all duration-150",
                "hover:border-primary/30 hover:shadow-sm",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                isOutOfStock && "opacity-50 cursor-not-allowed"
              )}
            >
              {/* Code & Weight badge */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-mono">{product.code}</span>
                {product.isWeighted && (
                  <span className="flex items-center gap-1 text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                    <Scale className="w-3 h-3" />
                    kg
                  </span>
                )}
              </div>
              
              {/* Name */}
              <h3 className="font-medium text-sm line-clamp-2 mb-3 min-h-[2.5rem]">
                {product.name}
              </h3>
              
              {/* Price */}
              <div className="mb-2">
                <span className="text-lg font-semibold tabular-nums">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </span>
                {product.isWeighted && (
                  <span className="text-xs text-muted-foreground ml-0.5">/kg</span>
                )}
              </div>

              {/* Stock */}
              <div className={cn(
                "text-xs flex items-center gap-1",
                isOutOfStock 
                  ? "text-destructive" 
                  : isLowStock 
                    ? "text-warning" 
                    : "text-muted-foreground"
              )}>
                {(isOutOfStock || isLowStock) && <AlertTriangle className="w-3 h-3" />}
                {isOutOfStock ? 'Sem estoque' : `${product.stock} ${product.unit}`}
              </div>
            </button>
          );
        })}
      </div>
    );
  }
);

ProductGrid.displayName = 'ProductGrid';
