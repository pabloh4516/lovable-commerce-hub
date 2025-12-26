import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartItem } from '@/types/pos';

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
}

export function Cart({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
}: CartProps) {
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6">
        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
          <ShoppingCart className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">Carrinho vazio</h3>
        <p className="text-sm text-muted-foreground">
          Adicione produtos para iniciar uma venda
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h2 className="font-semibold">Carrinho</h2>
          <p className="text-sm text-muted-foreground">{totalItems} itens</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClearCart} className="text-destructive hover:text-destructive">
          Limpar
        </Button>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.map((item) => (
          <div key={item.product.id} className="cart-item animate-slide-up">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{item.product.name}</h4>
              <p className="text-sm text-muted-foreground">
                R$ {item.product.price.toFixed(2).replace('.', ',')} × {item.quantity}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8"
                onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-medium">{item.quantity}</span>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8"
                onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-right min-w-[80px]">
              <p className="font-bold text-primary">
                R$ {item.subtotal.toFixed(2).replace('.', ',')}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => onRemoveItem(item.product.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-4">
        <div className="flex items-center justify-between text-lg">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-bold">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
        </div>
        <div className="flex items-center justify-between text-2xl">
          <span className="font-semibold">Total</span>
          <span className="font-bold text-primary">
            R$ {subtotal.toFixed(2).replace('.', ',')}
          </span>
        </div>
        <Button
          variant="gradient"
          size="xl"
          className="w-full pulse-glow"
          onClick={onCheckout}
        >
          Finalizar Venda
        </Button>
      </div>
    </div>
  );
}
