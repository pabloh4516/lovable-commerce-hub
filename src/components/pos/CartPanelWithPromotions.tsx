import { CartItemWithPromotion } from '@/hooks/useCartWithPromotions';
import { Customer } from '@/types/pos';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Plus, Minus, User, Percent, ShoppingCart, CreditCard, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PromotionBadgeCart, PromotionsSummary } from './PromotionBadgeCart';
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
  subtotalWithPromotions,
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

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Customer Section */}
      <div className="p-4 border-b border-border">
        <button
          onClick={onOpenCustomer}
          className={cn(
            "w-full flex items-center gap-4 p-3.5 rounded-xl transition-all duration-200",
            "bg-secondary/50 hover:bg-secondary border border-transparent hover:border-primary/20"
          )}
        >
          <div className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center",
            customer ? "bg-gradient-to-br from-primary to-primary/80" : "bg-muted"
          )}>
            <User className={cn("w-5 h-5", customer ? "text-primary-foreground" : "text-muted-foreground")} />
          </div>
          <div className="flex-1 text-left">
            {customer ? (
              <>
                <div className="font-semibold text-sm">{customer.name}</div>
                {customerCpf && <div className="text-xs text-muted-foreground">{customerCpf}</div>}
              </>
            ) : (
              <span className="text-muted-foreground text-sm">Identificar cliente</span>
            )}
          </div>
        </button>

        {/* Loyalty Section */}
        {customer && (
          <div className="mt-3">
            <LoyaltyBadge
              points={customerPoints}
              earnablePoints={earnablePoints}
              onRedeem={onOpenLoyaltyRedeem}
            />
          </div>
        )}
      </div>

      {/* Cart Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <ShoppingCart className="w-4 h-4 text-primary" />
          </div>
          <span className="font-semibold text-sm">
            {items.length} {items.length === 1 ? 'item' : 'itens'}
          </span>
        </div>
        {itemsWithPromotions.length > 0 && (
          <div className="flex items-center gap-1.5 text-success text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            {itemsWithPromotions.length} {itemsWithPromotions.length === 1 ? 'promoção' : 'promoções'}
          </div>
        )}
      </div>

      {/* Cart Items */}
      <ScrollArea className="flex-1">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-52 text-muted-foreground px-4">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
              <ShoppingCart className="w-8 h-8 opacity-30" />
            </div>
            <p className="font-medium">Carrinho vazio</p>
            <p className="text-xs mt-1">Adicione produtos para começar</p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {items.map((item, index) => (
              <div
                key={item.id}
                onClick={() => onSelectItem(selectedItemId === item.id ? null : item)}
                className={cn(
                  "p-3.5 rounded-xl cursor-pointer transition-all duration-200",
                  "border hover:shadow-md",
                  selectedItemId === item.id 
                    ? "bg-primary/5 border-primary/30 shadow-sm" 
                    : "bg-background border-transparent hover:border-border hover:bg-secondary/50",
                  item.appliedPromotion && "ring-1 ring-success/20 bg-success/5",
                  "animate-scale-in"
                )}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm truncate">{item.product.name}</p>
                      {item.appliedPromotion && (
                        <PromotionBadgeCart promotion={item.appliedPromotion} size="sm" showDiscount={false} />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-muted-foreground">
                        R$ {item.product.price.toFixed(2).replace('.', ',')}
                        {item.weight && ` × ${item.weight.toFixed(3)}kg`}
                      </p>
                      {item.appliedPromotion && (
                        <span className="text-xs text-success font-medium">
                          -{item.appliedPromotion.discount.toFixed(2).replace('.', ',')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {item.appliedPromotion && (
                      <p className="text-xs text-muted-foreground line-through">
                        R$ {item.originalSubtotal.toFixed(2).replace('.', ',')}
                      </p>
                    )}
                    <p className="font-bold text-sm tabular-nums text-primary">
                      R$ {item.subtotal.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </div>
                
                {/* Quantity Controls */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1">
                    {!item.weight && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); onUpdateQuantity(item.id, item.quantity - 1); }}
                          className="w-8 h-8 rounded-lg bg-secondary hover:bg-muted flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-10 text-center text-sm font-bold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); onUpdateQuantity(item.id, item.quantity + 1); }}
                          className="w-8 h-8 rounded-lg bg-secondary hover:bg-muted flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    {item.weight && (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg">
                        Pesado: {item.weight.toFixed(3)}kg
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemoveItem(item.id); }}
                    className="w-8 h-8 rounded-lg text-destructive hover:bg-destructive/10 flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Manual Item Discount */}
                {item.discount > 0 && !item.appliedPromotion && (
                  <div className="mt-2.5 text-xs text-success flex items-center gap-1.5 bg-success/10 px-2.5 py-1.5 rounded-lg w-fit">
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
      <div className="border-t border-border bg-muted/30 p-4 space-y-3">
        {/* Promotions Summary */}
        <PromotionsSummary 
          totalDiscount={promotionsDiscount} 
          itemsCount={itemsWithPromotions.length} 
        />

        {/* Loyalty Discount Applied */}
        <LoyaltyDiscountApplied
          pointsUsed={loyaltyPointsUsed}
          discountValue={loyaltyDiscount}
          onRemove={onRemoveLoyaltyDiscount}
        />

        {/* Discount Button */}
        <Button
          variant="outline"
          className="w-full justify-between h-11 rounded-xl"
          onClick={onOpenDiscount}
          disabled={items.length === 0}
        >
          <span className="flex items-center gap-2">
            <Percent className="w-4 h-4" />
            Desconto adicional
          </span>
          {totalDiscount > 0 && (
            <span className="text-success font-semibold">
              {totalDiscountType === 'percent' 
                ? `${totalDiscount}%` 
                : `R$ ${totalDiscount.toFixed(2).replace('.', ',')}`
              }
            </span>
          )}
        </Button>

        {/* Totals */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="tabular-nums font-medium">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
          </div>
          {promotionsDiscount > 0 && (
            <div className="flex justify-between text-success">
              <span>Promoções</span>
              <span className="tabular-nums font-medium">- R$ {promotionsDiscount.toFixed(2).replace('.', ',')}</span>
            </div>
          )}
          {discountValue > 0 && (
            <div className="flex justify-between text-success">
              <span>Desconto</span>
              <span className="tabular-nums font-medium">- R$ {discountValue.toFixed(2).replace('.', ',')}</span>
            </div>
          )}
          {loyaltyDiscount > 0 && (
            <div className="flex justify-between text-amber-600">
              <span>Fidelidade</span>
              <span className="tabular-nums font-medium">- R$ {loyaltyDiscount.toFixed(2).replace('.', ',')}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-xl pt-3 border-t border-border">
            <span>Total</span>
            <span className="tabular-nums gradient-text">R$ {total.toFixed(2).replace('.', ',')}</span>
          </div>
        </div>

        {/* Checkout Button */}
        <Button
          className={cn(
            "w-full h-14 text-lg font-bold gap-3 rounded-xl transition-all duration-200",
            "bg-gradient-to-r from-primary to-primary/90 hover:shadow-glow hover:scale-[1.02]"
          )}
          size="lg"
          onClick={onCheckout}
          disabled={items.length === 0 || !isRegisterOpen}
        >
          <CreditCard className="w-5 h-5" />
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
