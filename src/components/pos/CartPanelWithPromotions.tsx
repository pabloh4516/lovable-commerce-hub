import { CartItemWithPromotion } from '@/hooks/useCartWithPromotions';
import { Customer } from '@/types/pos';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Plus, Minus, User, Percent, ShoppingCart, CreditCard, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PromotionsSummary } from './PromotionBadgeCart';
import { LoyaltyBadge, LoyaltyDiscountApplied } from './LoyaltyBadge';
import { CustomerPoints } from '@/hooks/useLoyalty';

interface CartPanelWithPromotionsProps {
  items: CartItemWithPromotion[];
  selectedItemId: string | null;
  customer: Customer | null;
  customerCpf?: string;
  subtotal: number;
  subtotalWithPromotions: number;
  promotionsDiscount: number;
  discountValue: number;
  loyaltyDiscount: number;
  loyaltyPointsUsed: number;
  total: number;
  totalDiscount: number;
  totalDiscountType: 'percent' | 'value';
  isRegisterOpen: boolean;
  customerPoints: CustomerPoints | null;
  earnablePoints: number;
  onSelectItem: (item: CartItemWithPromotion | null) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onOpenCustomer: () => void;
  onOpenDiscount: () => void;
  onOpenLoyaltyRedeem: () => void;
  onRemoveLoyaltyDiscount: () => void;
  onCheckout: () => void;
}

export function CartPanelWithPromotions({
  items,
  selectedItemId,
  customer,
  customerCpf,
  subtotal,
  promotionsDiscount,
  discountValue,
  loyaltyDiscount,
  loyaltyPointsUsed,
  total,
  totalDiscount,
  totalDiscountType,
  isRegisterOpen,
  customerPoints,
  earnablePoints,
  onSelectItem,
  onUpdateQuantity,
  onRemoveItem,
  onOpenCustomer,
  onOpenDiscount,
  onOpenLoyaltyRedeem,
  onRemoveLoyaltyDiscount,
  onCheckout,
}: CartPanelWithPromotionsProps) {
  const itemsWithPromotions = items.filter((item) => item.appliedPromotion);
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="h-full flex flex-col bg-card border-l border-border">
      {/* Customer Section */}
      <div className="p-3 border-b border-border">
        <button
          onClick={onOpenCustomer}
          className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
        >
          <div className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center",
            customer ? "bg-primary text-primary-foreground" : "bg-muted"
          )}>
            <User className="w-4 h-4" />
          </div>
          <div className="flex-1 text-left">
            {customer ? (
              <>
                <p className="text-sm font-medium">{customer.name}</p>
                {customerCpf && <p className="text-xs text-muted-foreground">{customerCpf}</p>}
              </>
            ) : (
              <span className="text-sm text-muted-foreground">Identificar cliente</span>
            )}
          </div>
        </button>

        {customer && (
          <div className="mt-2">
            <LoyaltyBadge
              points={customerPoints}
              earnablePoints={earnablePoints}
              onRedeem={onOpenLoyaltyRedeem}
            />
          </div>
        )}
      </div>

      {/* Cart Header */}
      <div className="px-3 py-2 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">{items.length} itens</span>
          {totalItems !== items.length && (
            <span className="text-xs text-muted-foreground">({totalItems} un.)</span>
          )}
        </div>
        {itemsWithPromotions.length > 0 && (
          <span className="text-xs text-success font-medium bg-success/10 px-2 py-0.5 rounded">
            {itemsWithPromotions.length} promo
          </span>
        )}
      </div>

      {/* Cart Items */}
      <ScrollArea className="flex-1">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <ShoppingCart className="w-10 h-10 opacity-30 mb-2" />
            <p className="text-sm">Carrinho vazio</p>
          </div>
        ) : (
          <div className="p-2 space-y-1.5">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectItem(selectedItemId === item.id ? null : item)}
                className={cn(
                  "p-3 rounded-lg cursor-pointer border transition-colors",
                  selectedItemId === item.id 
                    ? "border-primary bg-primary/5" 
                    : "border-transparent hover:bg-secondary/50"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      R$ {item.product.price.toFixed(2).replace('.', ',')}
                      {item.weight && ` × ${item.weight.toFixed(3)}kg`}
                      {!item.weight && item.quantity > 1 && ` × ${item.quantity}`}
                    </p>
                  </div>
                  <div className="text-right">
                    {item.appliedPromotion && (
                      <p className="text-[10px] text-muted-foreground line-through">
                        R$ {item.originalSubtotal.toFixed(2).replace('.', ',')}
                      </p>
                    )}
                    <p className="text-sm font-semibold tabular-nums">
                      R$ {item.subtotal.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </div>
                
                {/* Quantity Controls */}
                <div className="flex items-center justify-between mt-2">
                  {!item.weight ? (
                    <div className="flex items-center bg-secondary rounded-lg">
                      <button
                        onClick={(e) => { e.stopPropagation(); onUpdateQuantity(item.id, item.quantity - 1); }}
                        className="w-8 h-8 rounded-l-lg hover:bg-muted flex items-center justify-center"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium tabular-nums">{item.quantity}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); onUpdateQuantity(item.id, item.quantity + 1); }}
                        className="w-8 h-8 rounded-r-lg hover:bg-muted flex items-center justify-center"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                      {item.weight.toFixed(3)} kg
                    </span>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemoveItem(item.id); }}
                    className="w-8 h-8 rounded-lg text-destructive hover:bg-destructive/10 flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Promotion badge */}
                {item.appliedPromotion && (
                  <div className="mt-2 text-xs text-success flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    -{item.appliedPromotion.discount.toFixed(2).replace('.', ',')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Totals & Actions */}
      <div className="border-t border-border p-3 space-y-3">
        <PromotionsSummary 
          totalDiscount={promotionsDiscount} 
          itemsCount={itemsWithPromotions.length} 
        />

        <LoyaltyDiscountApplied
          pointsUsed={loyaltyPointsUsed}
          discountValue={loyaltyDiscount}
          onRemove={onRemoveLoyaltyDiscount}
        />

        <Button
          variant="outline"
          className={cn(
            "w-full justify-between h-9 text-sm",
            totalDiscount > 0 && "border-success/50 bg-success/5"
          )}
          onClick={onOpenDiscount}
          disabled={items.length === 0}
        >
          <span className="flex items-center gap-1.5">
            <Percent className="w-3.5 h-3.5" />
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
          {promotionsDiscount > 0 && (
            <div className="flex justify-between text-success">
              <span>Promoções</span>
              <span className="tabular-nums">- R$ {promotionsDiscount.toFixed(2).replace('.', ',')}</span>
            </div>
          )}
          {discountValue > 0 && (
            <div className="flex justify-between text-success">
              <span>Desconto</span>
              <span className="tabular-nums">- R$ {discountValue.toFixed(2).replace('.', ',')}</span>
            </div>
          )}
          {loyaltyDiscount > 0 && (
            <div className="flex justify-between text-amber-600">
              <span>Fidelidade</span>
              <span className="tabular-nums">- R$ {loyaltyDiscount.toFixed(2).replace('.', ',')}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
            <span>Total</span>
            <span className="tabular-nums">R$ {total.toFixed(2).replace('.', ',')}</span>
          </div>
        </div>

        <Button
          className="w-full h-11 text-base font-medium gap-2"
          onClick={onCheckout}
          disabled={items.length === 0 || !isRegisterOpen}
        >
          <CreditCard className="w-4 h-4" />
          Finalizar Venda
        </Button>

        {!isRegisterOpen && (
          <p className="text-xs text-center text-warning">
            Abra o caixa para realizar vendas
          </p>
        )}
      </div>
    </div>
  );
}
