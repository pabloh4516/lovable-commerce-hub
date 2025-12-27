import { Product } from '@/types/pos';

interface QuickProductsBarProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export function QuickProductsBar({ products, onSelectProduct }: QuickProductsBarProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {products.map((product) => (
        <button
          key={product.id}
          onClick={() => onSelectProduct(product)}
          className="quick-product-btn shrink-0 flex-col items-start w-28 h-auto py-3"
        >
          <span className="text-[10px] font-mono text-muted-foreground">{product.code}</span>
          <span className="text-xs font-medium text-left line-clamp-2 w-full">{product.name}</span>
          <span className="text-sm font-semibold tabular-nums mt-1">
            R$ {product.price.toFixed(2).replace('.', ',')}
          </span>
        </button>
      ))}
    </div>
  );
}
