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
          <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
            <Package className="w-8 h-8 opacity-30" />
          </div>
          <p className="font-medium">Nenhum produto encontrado</p>
          <p className="text-sm mt-1">Tente ajustar sua busca</p>
        </div>
      );
    }

    return (
      <div ref={ref} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {products.map((product, index) => {
          const isLowStock = product.stock <= product.minStock;
          
          return (
            <button
              key={product.id}
              onClick={() => onSelectProduct(product)}
              className={cn(
                "product-card group text-left animate-scale-in",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              )}
              style={{ animationDelay: `${index * 20}ms` }}
            >
              {/* Product Code & Weight Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                  {product.code}
                </span>
                {product.isWeighted && (
                  <span className="flex items-center gap-1 text-[10px] font-medium text-primary bg-primary/10 px-2 py-1 rounded-md">
                    <Scale className="w-3 h-3" />
                    kg
                  </span>
                )}
              </div>
              
              {/* Product Name */}
              <h3 className="font-semibold text-sm line-clamp-2 mb-4 min-h-[2.5rem] group-hover:text-primary transition-colors">
                {product.name}
              </h3>
              
              {/* Price and Stock */}
              <div className="flex items-end justify-between mt-auto">
                <div>
                  <span className="text-xl font-bold tabular-nums">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <span className={cn(
                  "text-[10px] font-medium px-2 py-1 rounded-lg flex items-center gap-1",
                  isLowStock 
                    ? 'bg-warning/10 text-warning' 
                    : 'bg-muted text-muted-foreground'
                )}>
                  {isLowStock && <AlertTriangle className="w-3 h-3" />}
                  {product.stock} {product.unit}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    );
  }
);

ProductGrid.displayName = 'ProductGrid';
