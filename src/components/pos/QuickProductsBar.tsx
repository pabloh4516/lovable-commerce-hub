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
          className="shrink-0 flex flex-col items-center justify-center w-24 h-24 rounded-xl bg-secondary hover:bg-muted border border-border transition-all duration-200 active:scale-95"
        >
          <span className="text-2xl mb-1">{getCategoryEmoji(product.category)}</span>
          <span className="text-xs font-medium text-center line-clamp-2 px-1">{product.name}</span>
          <span className="text-xs text-primary font-bold mt-1">
            R$ {product.price.toFixed(2).replace('.', ',')}
          </span>
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
    Congelados: '🧊',
    Outros: '📦',
  };
  return emojis[category] || '📦';
}
