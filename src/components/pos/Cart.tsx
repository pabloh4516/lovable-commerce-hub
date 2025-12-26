import { Minus, Plus, Trash2, ShoppingCart, Percent, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartItem, Customer } from '@/types/pos';

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
      <div className="h-full flex flex-col items-center justify-center text-center p-6">
        <div className="w-20 h-20 rounded-full bg-warning/20 flex items-center justify-center mb-4">
          <ShoppingCart className="w-10 h-10 text-warning" />
        </div>
        <h3 className="text-lg font-medium mb-2">Caixa Fechado</h3>
        <p className="text-sm text-muted-foreground">
          Abra o caixa para iniciar as vendas
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="h-full flex flex-col">
        {/* Customer/CPF Section */}
        <div className="p-4 border-b border-border">
          <Button
            variant="secondary"
            className="w-full justify-start"
            onClick={onOpenCustomer}
          >
            <User className="w-4 h-4 mr-2" />
            {customer ? customer.name : customerCpf ? `CPF: ${customerCpf}` : 'Identificar Cliente (F7)'}
          </Button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
            <ShoppingCart className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Carrinho vazio</h3>
          <p className="text-sm text-muted-foreground">
            Adicione produtos para iniciar uma venda
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Customer/CPF Section */}
      <div className="p-4 border-b border-border">
        <Button
          variant={customer || customerCpf ? 'default' : 'secondary'}
          className="w-full justify-start"
          onClick={onOpenCustomer}
        >
          <User className="w-4 h-4 mr-2" />
          {customer ? customer.name : customerCpf ? `CPF: ${customerCpf}` : 'Identificar Cliente (F7)'}
        </Button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h2 className="font-semibold">Carrinho</h2>
          <p className="text-sm text-muted-foreground">{totalItems} itens</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClearCart} className="text-destructive hover:text-destructive">
          Limpar (F9)
        </Button>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {items.map((item, index) => (
          <div
            key={item.id}
            onClick={() => onSelectItem(item)}
            className={`cart-item cursor-pointer animate-slide-up ${
              selectedItemId === item.id ? 'border-primary bg-primary/5' : ''
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{index + 1}.</span>
                <h4 className="font-medium text-sm truncate">{item.product.name}</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                R$ {item.product.price.toFixed(2).replace('.', ',')} × {
                  item.product.isWeighted 
                    ? `${item.weight?.toFixed(3) || item.quantity} ${item.product.unit}`
                    : `${item.quantity} ${item.product.unit}`
                }
              </p>
              {item.discount > 0 && (
                <p className="text-xs text-warning">
                  Desconto: {item.discountType === 'percent' ? `${item.discount}%` : `R$ ${item.discount.toFixed(2)}`}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!item.product.isWeighted && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateQuantity(item.id, item.quantity - 1);
                    }}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8"
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
            <div className="text-right min-w-[80px]">
              <p className="font-bold text-primary">
                R$ {item.subtotal.toFixed(2).replace('.', ',')}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
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
      <div className="p-4 border-t border-border space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
        </div>
        
        <Button
          variant="ghost"
          className="w-full justify-between h-auto py-2"
          onClick={onOpenDiscount}
        >
          <span className="flex items-center gap-2 text-muted-foreground">
            <Percent className="h-4 w-4" />
            Desconto (F6)
          </span>
          <span className={discountValue > 0 ? 'text-warning font-medium' : 'text-muted-foreground'}>
            {discountValue > 0 ? `- R$ ${discountValue.toFixed(2).replace('.', ',')}` : 'R$ 0,00'}
          </span>
        </Button>

        <div className="flex items-center justify-between text-2xl pt-2 border-t border-border">
          <span className="font-semibold">Total</span>
          <span className="font-bold text-primary">
            R$ {total.toFixed(2).replace('.', ',')}
          </span>
        </div>
        
        <Button
          variant="gradient"
          size="xl"
          className="w-full pulse-glow"
          onClick={onCheckout}
        >
          Finalizar Venda (F12)
        </Button>
      </div>
    </div>
  );
}
