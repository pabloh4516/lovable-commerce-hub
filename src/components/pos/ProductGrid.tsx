import { forwardRef } from 'react';
import { Product } from '@/types/pos';
import { Scale, AlertTriangle } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const ProductGrid = forwardRef<HTMLDivElement, ProductGridProps>(
  function ProductGrid({ products, onSelectProduct }, ref) {
    return (
      <div ref={ref} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {products.map((product) => {
        const isLowStock = product.stock <= product.minStock;
        
        return (
          <button
            key={product.id}
            onClick={() => onSelectProduct(product)}
            className="product-card group text-left"
          >
            {/* Product Code */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-muted-foreground">{product.code}</span>
              {product.isWeighted && (
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  <Scale className="w-3 h-3" />
                  kg
                </span>
              )}
            </div>
            
            {/* Product Name */}
            <h3 className="font-medium text-sm line-clamp-2 mb-3 min-h-[2.5rem]">
              {product.name}
            </h3>
            
            {/* Price and Stock */}
            <div className="flex items-end justify-between mt-auto">
              <span className="text-lg font-bold tabular-nums">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
              <span className={`text-[10px] px-2 py-1 rounded ${
                isLowStock 
                  ? 'bg-warning/10 text-warning flex items-center gap-1' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {isLowStock && <AlertTriangle className="w-3 h-3" />}
                {product.stock} {product.unit}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
});

ProductGrid.displayName = 'ProductGrid';
