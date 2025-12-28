import { CartItemWithPromotion } from '@/hooks/useCartWithPromotions';
import { Customer } from '@/types/pos';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Plus, Minus, User, Percent, ShoppingCart, CreditCard, Sparkles, Crown, Gift, Star } from 'lucide-react';
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
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const hasDiscounts = promotionsDiscount > 0 || discountValue > 0 || loyaltyDiscount > 0;

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-card to-card/95">
      {/* Customer Section */}
      <div className="p-4 border-b border-border/50">
        <button
          onClick={onOpenCustomer}
          className={cn(
            "w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300",
            "bg-gradient-to-r from-secondary/80 to-secondary/50 hover:from-secondary hover:to-secondary/70",
            "border border-transparent hover:border-primary/20",
            "hover:shadow-lg hover:shadow-primary/5 group"
          )}
        >
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
            "group-hover:scale-110",
            customer 
              ? "bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25" 
              : "bg-muted/80"
          )}>
            {customer ? (
              <Crown className="w-5 h-5 text-primary-foreground" />
            ) : (
              <User className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 text-left">
            {customer ? (
              <>
                <div className="font-semibold text-sm flex items-center gap-2">
                  {customer.name}
                  {customerPoints && customerPoints.total_points > 100 && (
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  )}
                </div>
                {customerCpf && <div className="text-xs text-muted-foreground mt-0.5">{customerCpf}</div>}
              </>
            ) : (
              <span className="text-muted-foreground text-sm">Identificar cliente</span>
            )}
          </div>
          <div className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
            {customer ? 'Trocar' : 'Adicionar'}
          </div>
        </button>

        {/* Loyalty Section */}
        {customer && (
          <div className="mt-3 animate-fade-in">
            <LoyaltyBadge
              points={customerPoints}
              earnablePoints={earnablePoints}
              onRedeem={onOpenLoyaltyRedeem}
            />
          </div>
        )}
      </div>

      {/* Cart Header */}
      <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between bg-gradient-to-r from-muted/50 to-transparent">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-primary" />
            </div>
            {totalItems > 0 && (
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center animate-scale-in">
                {totalItems > 99 ? '99+' : totalItems}
              </div>
            )}
          </div>
          <div>
            <span className="font-semibold text-sm">
              {items.length} {items.length === 1 ? 'item' : 'itens'}
            </span>
            {totalItems !== items.length && (
              <span className="text-xs text-muted-foreground ml-1.5">
                ({totalItems} un.)
              </span>
            )}
          </div>
        </div>
        {itemsWithPromotions.length > 0 && (
          <div className="flex items-center gap-1.5 text-success text-xs font-semibold bg-success/10 px-2.5 py-1 rounded-lg animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            {itemsWithPromotions.length} {itemsWithPromotions.length === 1 ? 'promo' : 'promos'}
          </div>
        )}
      </div>

      {/* Cart Items */}
      <ScrollArea className="flex-1">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-60 text-muted-foreground px-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center mb-5 shadow-inner">
              <ShoppingCart className="w-10 h-10 opacity-30" />
            </div>
            <p className="font-semibold text-base">Carrinho vazio</p>
            <p className="text-xs mt-1.5 text-center text-muted-foreground/80">
              Adicione produtos para começar a venda
            </p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {items.map((item, index) => (
              <div
                key={item.id}
                onClick={() => onSelectItem(selectedItemId === item.id ? null : item)}
                className={cn(
                  "relative p-4 rounded-2xl cursor-pointer transition-all duration-300",
                  "border hover:shadow-lg",
                  selectedItemId === item.id 
                    ? "bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30 shadow-md shadow-primary/10" 
                    : "bg-gradient-to-r from-background to-background/80 border-border/50 hover:border-primary/20 hover:bg-secondary/30",
                  item.appliedPromotion && "ring-1 ring-success/30 bg-gradient-to-r from-success/5 to-transparent",
                  "animate-slide-in"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Promotion ribbon */}
                {item.appliedPromotion && (
                  <div className="absolute -top-1 -right-1">
                    <div className="bg-success text-success-foreground text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                      PROMO
                    </div>
                  </div>
                )}

                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm truncate">{item.product.name}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground">
                        R$ {item.product.price.toFixed(2).replace('.', ',')}
                        {item.weight && ` × ${item.weight.toFixed(3)}kg`}
                        {!item.weight && item.quantity > 1 && ` × ${item.quantity}`}
                      </p>
                      {item.appliedPromotion && (
                        <span className="text-[10px] text-success font-semibold bg-success/10 px-1.5 py-0.5 rounded">
                          -{item.appliedPromotion.discount.toFixed(2).replace('.', ',')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {item.appliedPromotion && (
                      <p className="text-[10px] text-muted-foreground line-through">
                        R$ {item.originalSubtotal.toFixed(2).replace('.', ',')}
                      </p>
                    )}
                    <p className="font-bold text-sm tabular-nums text-primary">
                      R$ {item.subtotal.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </div>
                
                {/* Quantity Controls */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-1">
                    {!item.weight ? (
                      <div className="flex items-center bg-secondary/80 rounded-xl border border-border/50">
                        <button
                          onClick={(e) => { e.stopPropagation(); onUpdateQuantity(item.id, item.quantity - 1); }}
                          className="w-9 h-9 rounded-l-xl hover:bg-muted flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-10 text-center text-sm font-bold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); onUpdateQuantity(item.id, item.quantity + 1); }}
                          className="w-9 h-9 rounded-r-xl hover:bg-muted flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground bg-muted/80 px-3 py-1.5 rounded-xl border border-border/50">
                        {item.weight.toFixed(3)} kg
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemoveItem(item.id); }}
                    className="w-9 h-9 rounded-xl text-destructive hover:bg-destructive/10 flex items-center justify-center transition-all duration-200 hover:scale-110"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Manual Item Discount */}
                {item.discount > 0 && !item.appliedPromotion && (
                  <div className="mt-3 text-xs text-success flex items-center gap-1.5 bg-success/10 px-3 py-2 rounded-xl w-fit border border-success/20">
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
      <div className="border-t border-border/50 bg-gradient-to-t from-muted/50 to-transparent p-4 space-y-3">
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
          className={cn(
            "w-full justify-between h-12 rounded-xl border-dashed transition-all duration-200",
            totalDiscount > 0 && "border-success/50 bg-success/5"
          )}
          onClick={onOpenDiscount}
          disabled={items.length === 0}
        >
          <span className="flex items-center gap-2">
            <Gift className="w-4 h-4" />
            Desconto adicional
          </span>
          {totalDiscount > 0 && (
            <span className="text-success font-bold">
              {totalDiscountType === 'percent' 
                ? `${totalDiscount}%` 
                : `R$ ${totalDiscount.toFixed(2).replace('.', ',')}`
              }
            </span>
          )}
        </Button>

        {/* Totals */}
        <div className="space-y-2.5 text-sm bg-background/50 rounded-xl p-3 border border-border/50">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="tabular-nums font-medium">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
          </div>
          {promotionsDiscount > 0 && (
            <div className="flex justify-between text-success animate-fade-in">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                Promoções
              </span>
              <span className="tabular-nums font-semibold">- R$ {promotionsDiscount.toFixed(2).replace('.', ',')}</span>
            </div>
          )}
          {discountValue > 0 && (
            <div className="flex justify-between text-success animate-fade-in">
              <span>Desconto</span>
              <span className="tabular-nums font-semibold">- R$ {discountValue.toFixed(2).replace('.', ',')}</span>
            </div>
          )}
          {loyaltyDiscount > 0 && (
            <div className="flex justify-between text-amber-600 animate-fade-in">
              <span className="flex items-center gap-1.5">
                <Crown className="w-3 h-3" />
                Fidelidade
              </span>
              <span className="tabular-nums font-semibold">- R$ {loyaltyDiscount.toFixed(2).replace('.', ',')}</span>
            </div>
          )}
          
          {/* Total with highlight */}
          <div className={cn(
            "flex justify-between font-bold text-xl pt-3 border-t border-border/50",
            hasDiscounts && "pt-4"
          )}>
            <span>Total</span>
            <span className="tabular-nums bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              R$ {total.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>

        {/* Checkout Button */}
        <Button
          className={cn(
            "w-full h-14 text-lg font-bold gap-3 rounded-2xl transition-all duration-300",
            "bg-gradient-to-r from-primary via-primary to-primary/90",
            "hover:shadow-xl hover:shadow-primary/25 hover:scale-[1.02]",
            "border border-primary/20",
            "disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
          )}
          size="lg"
          onClick={onCheckout}
          disabled={items.length === 0 || !isRegisterOpen}
        >
          <CreditCard className="w-5 h-5" />
          Finalizar Venda
        </Button>

        {!isRegisterOpen && (
          <p className="text-xs text-center text-warning bg-warning/10 py-2 rounded-xl">
            Abra o caixa para realizar vendas
          </p>
        )}
      </div>
    </div>
  );
}
