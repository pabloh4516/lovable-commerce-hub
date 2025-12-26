import { Product } from '@/types/pos';

interface ProductGridProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export function ProductGrid({ products, onSelectProduct }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {products.map((product, index) => (
        <button
          key={product.id}
          onClick={() => onSelectProduct(product)}
          className="product-card group animate-in"
          style={{ animationDelay: `${index * 30}ms` }}
        >
          <div className="aspect-square bg-gradient-to-br from-secondary/80 to-secondary/40 rounded-xl mb-3 flex items-center justify-center text-4xl relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
            <span className="relative z-10">{getCategoryEmoji(product.category)}</span>
            <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <h3 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors duration-200">
            {product.name}
          </h3>
          <div className="flex items-center justify-between mt-auto">
            <span className="text-lg font-bold gradient-text font-mono">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
            <span className="text-[10px] text-muted-foreground px-2 py-1 rounded-lg bg-secondary/50">
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
    Frios: '🧀',
    Hortifruti: '🥬',
    Carnes: '🥩',
    Mercearia: '🛒',
    Outros: '📦',
  };
  return emojis[category] || '📦';
}
