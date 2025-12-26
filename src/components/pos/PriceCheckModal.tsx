import { useState, useEffect, useRef } from 'react';
import { X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Product } from '@/types/pos';
import { products } from '@/data/mockData';

interface PriceCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PriceCheckModal({ isOpen, onClose }: PriceCheckModalProps) {
  const [query, setQuery] = useState('');
  const [foundProduct, setFoundProduct] = useState<Product | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setFoundProduct(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSearch = () => {
    const product = products.find(
      (p) =>
        p.barcode === query ||
        p.code === query ||
        p.name.toLowerCase().includes(query.toLowerCase())
    );
    setFoundProduct(product || null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Consulta de Preço
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Código de barras, código ou nome..."
              className="bg-secondary text-lg"
            />
            <Button onClick={handleSearch}>
              Buscar
            </Button>
          </div>

          {foundProduct ? (
            <div className="p-6 bg-secondary rounded-xl text-center animate-scale-in">
              <p className="text-lg font-medium mb-2">{foundProduct.name}</p>
              <p className="text-sm text-muted-foreground mb-4">
                Código: {foundProduct.code} | {foundProduct.barcode || 'Sem código de barras'}
              </p>
              <p className="text-5xl font-bold text-primary mb-2">
                R$ {foundProduct.price.toFixed(2).replace('.', ',')}
              </p>
              <p className="text-sm text-muted-foreground">
                {foundProduct.isWeighted ? `Por ${foundProduct.unit}` : `Por ${foundProduct.unit}`}
              </p>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm">
                  Estoque: <span className={foundProduct.stock <= foundProduct.minStock ? 'text-destructive' : 'text-success'}>
                    {foundProduct.stock} {foundProduct.unit}
                  </span>
                </p>
              </div>
            </div>
          ) : query && (
            <div className="p-6 bg-destructive/10 rounded-xl text-center border border-destructive/30">
              <p className="text-destructive font-medium">Produto não encontrado</p>
              <p className="text-sm text-muted-foreground mt-1">
                Verifique o código e tente novamente
              </p>
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center">
            Use o leitor de código de barras ou digite o código do produto
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
