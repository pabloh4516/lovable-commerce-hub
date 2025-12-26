import { Product } from '@/types/pos';

interface ProductGridProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export function ProductGrid({ products, onSelectProduct }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {products.map((product) => (
        <button
          key={product.id}
          onClick={() => onSelectProduct(product)}
          className="product-card group"
        >
          <div className="aspect-square bg-secondary/50 rounded-lg mb-2 flex items-center justify-center text-3xl">
            {getCategoryEmoji(product.category)}
          </div>
          <h3 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
            <span className="text-xs text-muted-foreground">
              {product.stock} {product.unit}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}

function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    Bebidas: '🥤',
    Alimentos: '🍔',
    Limpeza: '🧹',
    Higiene: '🧴',
    Doces: '🍫',
    Laticínios: '🥛',
    Padaria: '🥖',
    Outros: '📦',
  };
  return emojis[category] || '📦';
}
