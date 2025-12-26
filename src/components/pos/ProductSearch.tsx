import { useState, useEffect, useRef } from 'react';
import { Search, Barcode, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/pos';

interface ProductSearchProps {
  onSelectProduct: (product: Product) => void;
  products: Product[];
}

export function ProductSearch({ onSelectProduct, products }: ProductSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length > 0) {
      const filtered = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.code.includes(query) ||
          p.barcode?.includes(query)
      );
      setFilteredProducts(filtered);
      setIsOpen(true);
    } else {
      setFilteredProducts([]);
      setIsOpen(false);
    }
  }, [query, products]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen for barcode scanner input (rapid key presses)
  useEffect(() => {
    let buffer = '';
    let timeout: NodeJS.Timeout;

    function handleKeyPress(e: KeyboardEvent) {
      if (e.key === 'Enter' && buffer.length > 0) {
        const product = products.find((p) => p.barcode === buffer);
        if (product) {
          onSelectProduct(product);
          buffer = '';
          setQuery('');
        }
      } else if (e.key.length === 1) {
        buffer += e.key;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          buffer = '';
        }, 100);
      }
    }

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [products, onSelectProduct]);

  const handleSelect = (product: Product) => {
    onSelectProduct(product);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const clearSearch = () => {
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Buscar produto por nome ou código..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-10 h-12 text-base bg-secondary border-border focus:border-primary"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button variant="secondary" size="iconLg" className="shrink-0">
          <Barcode className="h-5 w-5" />
        </Button>
      </div>

      {isOpen && filteredProducts.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-slide-up">
          <div className="max-h-80 overflow-y-auto">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => handleSelect(product)}
                className="w-full flex items-center gap-4 p-3 hover:bg-secondary transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Cód: {product.code} {product.barcode && `• ${product.barcode}`}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-primary">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Estoque: {product.stock} {product.unit}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {isOpen && query.length > 0 && filteredProducts.length === 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg p-6 text-center animate-fade-in">
          <p className="text-muted-foreground">Nenhum produto encontrado</p>
        </div>
      )}
    </div>
  );
}
