import { Minus, Plus, Trash2, ShoppingCart, Percent, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartItem, Customer } from '@/types/pos';
import { cn } from '@/lib/utils';

interface CartProps {
  items: CartItem[];
  customer: Customer | null;
  customerCpf?: string;
  totalDiscount: number;
  totalDiscountType: 'percent' | 'value';
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
  onSelectItem: (item: CartItem) => void;
  selectedItemId: string | null;
  onOpenCustomer: () => void;
  onOpenDiscount: () => void;
  isRegisterOpen: boolean;
}

export function Cart({
  items,
  customer,
  customerCpf,
  totalDiscount,
  totalDiscountType,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  onSelectItem,
  selectedItemId,
  onOpenCustomer,
  onOpenDiscount,
  isRegisterOpen,
}: CartProps) {
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const discountValue = totalDiscountType === 'percent' 
    ? (subtotal * totalDiscount / 100) 
    : totalDiscount;
  const total = subtotal - discountValue;
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  if (!isRegisterOpen) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl gradient-warning flex items-center justify-center mb-6 shadow-elevated animate-float">
            <ShoppingCart className="w-12 h-12 text-warning-foreground" />
          </div>
          <div className="absolute inset-0 gradient-warning opacity-30 blur-3xl" />
        </div>
        <h3 className="text-xl font-bold mb-2">Caixa Fechado</h3>
        <p className="text-muted-foreground">
          Abra o caixa para iniciar as vendas
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="h-full flex flex-col">
        {/* Customer Section */}
        <div className="p-4 border-b border-border/30">
          <Button
            variant="outline"
            className="w-full justify-start h-12 rounded-xl border-border/50 hover:border-primary/50 transition-all"
            onClick={onOpenCustomer}
          >
            <User className="w-4 h-4 mr-3 text-primary" />
            {customer ? customer.name : customerCpf ? `CPF: ${customerCpf}` : 'Identificar Cliente (F7)'}
          </Button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-3xl bg-secondary/50 flex items-center justify-center animate-pulse-scale">
              <ShoppingCart className="w-12 h-12 text-muted-foreground" />
            </div>
          </div>
          <h3 className="text-xl font-bold mb-2">Carrinho vazio</h3>
          <p className="text-muted-foreground text-sm">
            Adicione produtos para iniciar uma venda
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Customer Section */}
      <div className="p-4 border-b border-border/30">
        <Button
          variant={customer || customerCpf ? 'default' : 'outline'}
          className={cn(
            'w-full justify-start h-12 rounded-xl transition-all',
            customer || customerCpf 
              ? 'gradient-accent text-accent-foreground shadow-glow-accent' 
              : 'border-border/50 hover:border-primary/50'
          )}
          onClick={onOpenCustomer}
        >
          <User className="w-4 h-4 mr-3" />
          {customer ? customer.name : customerCpf ? `CPF: ${customerCpf}` : 'Identificar Cliente (F7)'}
        </Button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/30">
        <div>
          <h2 className="font-bold text-lg">Carrinho</h2>
          <p className="text-sm text-muted-foreground">{totalItems} itens</p>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClearCart} 
          className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
        >
          Limpar (F9)
        </Button>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            onClick={() => onSelectItem(item)}
            className={cn(
              'cart-item cursor-pointer animate-slide-up',
              selectedItemId === item.id && 'border-primary/50 bg-primary/5 shadow-glow'
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-primary font-bold font-mono">{String(index + 1).padStart(2, '0')}</span>
                <h4 className="font-medium text-sm truncate">{item.product.name}</h4>
              </div>
              <p className="text-sm text-muted-foreground font-mono mt-1">
                R$ {item.product.price.toFixed(2).replace('.', ',')} × {
                  item.product.isWeighted 
                    ? `${item.weight?.toFixed(3) || item.quantity} ${item.product.unit}`
                    : `${item.quantity} ${item.product.unit}`
                }
              </p>
              {item.discount > 0 && (
                <p className="text-xs text-warning font-medium mt-1">
                  ✨ Desconto: {item.discountType === 'percent' ? `${item.discount}%` : `R$ ${item.discount.toFixed(2)}`}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!item.product.isWeighted && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-9 w-9 rounded-xl"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateQuantity(item.id, item.quantity - 1);
                    }}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-bold font-mono">{item.quantity}</span>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-9 w-9 rounded-xl"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateQuantity(item.id, item.quantity + 1);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
            <div className="text-right min-w-[85px]">
              <p className="font-bold gradient-text font-mono">
                R$ {item.subtotal.toFixed(2).replace('.', ',')}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl text-destructive/70 hover:text-destructive hover:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveItem(item.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border/30 space-y-4 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium font-mono">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
        </div>
        
        <Button
          variant="ghost"
          className="w-full justify-between h-auto py-3 rounded-xl hover:bg-secondary/50"
          onClick={onOpenDiscount}
        >
          <span className="flex items-center gap-2 text-muted-foreground">
            <Percent className="h-4 w-4" />
            Desconto (F6)
          </span>
          <span className={cn(
            'font-mono',
            discountValue > 0 ? 'text-warning font-bold' : 'text-muted-foreground'
          )}>
            {discountValue > 0 ? `- R$ ${discountValue.toFixed(2).replace('.', ',')}` : 'R$ 0,00'}
          </span>
        </Button>

        <div className="flex items-center justify-between text-2xl pt-3 border-t border-border/30">
          <span className="font-bold">Total</span>
          <span className="font-bold gradient-text font-mono">
            R$ {total.toFixed(2).replace('.', ',')}
          </span>
        </div>
        
        <Button
          className="w-full h-14 text-lg font-bold rounded-2xl gradient-primary text-white shadow-glow pulse-glow hover:scale-[1.02] transition-transform"
          onClick={onCheckout}
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Finalizar Venda (F12)
        </Button>
      </div>
    </div>
  );
}
