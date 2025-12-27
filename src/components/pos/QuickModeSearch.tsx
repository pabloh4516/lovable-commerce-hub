import { useState, useRef, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Product } from '@/types/pos';
import { Input } from '@/components/ui/input';

interface QuickModeSearchProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  disabled?: boolean;
}

export function QuickModeSearch({ products, onSelectProduct, disabled }: QuickModeSearchProps) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the input
  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  // Refocus after product is added
  const focusInput = useCallback(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;

    // Try exact barcode/code match first
    const exactMatch = products.find(
      (p) => p.barcode === query || p.code === query
    );

    if (exactMatch) {
      onSelectProduct(exactMatch);
      setQuery('');
      setShowSuggestions(false);
      focusInput();
      return;
    }

    // Try partial name match
    const nameMatch = products.find((p) =>
      p.name.toLowerCase().includes(query.toLowerCase())
    );

    if (nameMatch) {
      onSelectProduct(nameMatch);
      setQuery('');
      setShowSuggestions(false);
      focusInput();
    }
  }, [query, products, onSelectProduct, focusInput]);

  const filteredProducts = query.length >= 2
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.code.includes(query) ||
          p.barcode?.includes(query)
      ).slice(0, 5)
    : [];

  const handleSelectSuggestion = useCallback((product: Product) => {
    onSelectProduct(product);
    setQuery('');
    setShowSuggestions(false);
    focusInput();
  }, [onSelectProduct, focusInput]);

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(e.target.value.length >= 2);
          }}
          onFocus={() => setShowSuggestions(query.length >= 2)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Digite código, código de barras ou nome do produto..."
          disabled={disabled}
          className="h-16 pl-14 pr-4 text-xl font-mono bg-card border-2 border-border focus:border-primary"
          autoComplete="off"
        />
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && filteredProducts.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => handleSelectSuggestion(product)}
              className="w-full px-4 py-3 text-left hover:bg-muted flex items-center justify-between border-b border-border/50 last:border-b-0"
            >
              <div>
                <span className="font-mono text-sm text-muted-foreground mr-2">
                  {product.code}
                </span>
                <span className="font-medium">{product.name}</span>
              </div>
              <span className="font-bold text-primary">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
            </button>
          ))}
        </div>
      )}
    </form>
  );
}
