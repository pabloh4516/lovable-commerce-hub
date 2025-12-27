import { CartItem, Customer } from '@/types/pos';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Plus, Minus, User, Percent, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CartPanelProps {
  items: CartItem[];
  selectedItemId: string | null;
  customer: Customer | null;
  customerCpf?: string;
  subtotal: number;
  discountValue: number;
  total: number;
  totalDiscount: number;
  totalDiscountType: 'percent' | 'value';
  isRegisterOpen: boolean;
  onSelectItem: (item: CartItem | null) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onOpenCustomer: () => void;
  onOpenDiscount: () => void;
  onCheckout: () => void;
}

export function CartPanel({
  items,
  selectedItemId,
  customer,
  customerCpf,
  subtotal,
  discountValue,
  total,
  totalDiscount,
  totalDiscountType,
  isRegisterOpen,
  onSelectItem,
  onUpdateQuantity,
  onRemoveItem,
  onOpenCustomer,
  onOpenDiscount,
  onCheckout,
}: CartPanelProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Customer Section */}
      <div className="p-4 border-b border-border">
        <Button
          variant="outline"
          className="w-full justify-start gap-3 h-12"
          onClick={onOpenCustomer}
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 text-left">
            {customer ? (
              <>
                <div className="font-medium text-sm">{customer.name}</div>
                {customerCpf && <div className="text-xs text-muted-foreground">{customerCpf}</div>}
              </>
            ) : (
              <span className="text-muted-foreground">Identificar cliente</span>
            )}
          </div>
        </Button>
      </div>

      {/* Cart Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium text-sm">
            {items.length} {items.length === 1 ? 'item' : 'itens'}
          </span>
        </div>
      </div>

      {/* Cart Items */}
      <ScrollArea className="flex-1">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <ShoppingCart className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">Carrinho vazio</p>
            <p className="text-xs mt-1">Adicione produtos para começar</p>
          </div>
        ) : (
          <div className="p-2">
            {items.map((item, index) => (
              <div
                key={item.id}
                onClick={() => onSelectItem(selectedItemId === item.id ? null : item)}
                className={cn(
                  "p-3 rounded-lg mb-2 cursor-pointer transition-all duration-200",
                  "border border-transparent hover:border-border",
                  selectedItemId === item.id 
                    ? "bg-primary/5 border-primary/30 shadow-sm" 
                    : "bg-background hover:bg-muted/50",
                  "animate-fade-in"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      R$ {item.product.price.toFixed(2).replace('.', ',')}
                      {item.weight && ` × ${item.weight.toFixed(3)}kg`}
                    </p>
                  </div>
                  <p className="font-semibold text-sm tabular-nums">
                    R$ {item.subtotal.toFixed(2).replace('.', ',')}
                  </p>
                </div>
                
                {/* Quantity Controls */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    {!item.weight && (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-7 h-7"
                          onClick={(e) => { e.stopPropagation(); onUpdateQuantity(item.id, item.quantity - 1); }}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium tabular-nums">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-7 h-7"
                          onClick={(e) => { e.stopPropagation(); onUpdateQuantity(item.id, item.quantity + 1); }}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                    {item.weight && (
                      <span className="text-xs text-muted-foreground">
                        Pesado: {item.weight.toFixed(3)}kg
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => { e.stopPropagation(); onRemoveItem(item.id); }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>

                {/* Item Discount */}
                {item.discount > 0 && (
                  <div className="mt-2 text-xs text-success flex items-center gap-1">
                    <Percent className="w-3 h-3" />
                    Desconto: {item.discountType === 'percent' 
                      ? `${item.discount}%` 
                      : `R$ ${item.discount.toFixed(2).replace('.', ',')}`
                    }
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Totals & Actions */}
      <div className="border-t border-border bg-muted/20 p-4 space-y-3">
        {/* Discount Button */}
        <Button
          variant="outline"
          className="w-full justify-between h-10"
          onClick={onOpenDiscount}
          disabled={items.length === 0}
        >
          <span className="flex items-center gap-2">
            <Percent className="w-4 h-4" />
            Desconto
          </span>
          {totalDiscount > 0 && (
            <span className="text-success font-medium">
              {totalDiscountType === 'percent' 
                ? `${totalDiscount}%` 
                : `R$ ${totalDiscount.toFixed(2).replace('.', ',')}`
              }
            </span>
          )}
        </Button>

        {/* Totals */}
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="tabular-nums">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
          </div>
          {discountValue > 0 && (
            <div className="flex justify-between text-success">
              <span>Desconto</span>
              <span className="tabular-nums">- R$ {discountValue.toFixed(2).replace('.', ',')}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
            <span>Total</span>
            <span className="tabular-nums text-primary">R$ {total.toFixed(2).replace('.', ',')}</span>
          </div>
        </div>

        {/* Checkout Button */}
        <Button
          className="w-full h-14 text-lg font-bold gap-2"
          size="lg"
          onClick={onCheckout}
          disabled={items.length === 0 || !isRegisterOpen}
        >
          <ShoppingCart className="w-5 h-5" />
          Finalizar Venda
        </Button>

        {!isRegisterOpen && (
          <p className="text-xs text-center text-muted-foreground">
            Abra o caixa para realizar vendas
          </p>
        )}
      </div>
    </div>
  );
}
