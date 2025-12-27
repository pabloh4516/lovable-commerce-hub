import { useCallback } from 'react';
import { QuickModeSearch } from './QuickModeSearch';
import { QuickModeItemList } from './QuickModeItemList';
import { QuickModeTotals } from './QuickModeTotals';
import { QuickModeShortcuts } from './QuickModeShortcuts';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Product, Customer } from '@/types/pos';
import { CartItemWithPromotion } from '@/hooks/useCartWithPromotions';
import { User } from 'lucide-react';

interface POSQuickModeProps {
  // Products
  products: Product[];
  
  // Cart
  cartItems: CartItemWithPromotion[];
  selectedItem: CartItemWithPromotion | null;
  setSelectedItem: (item: CartItemWithPromotion | null) => void;
  addToCart: (product: Product) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  
  // Customer
  customer: Customer | null;
  customerCpf?: string;
  
  // Totals
  subtotal: number;
  discountValue: number;
  total: number;
  
  // Register
  isRegisterOpen: boolean;
  
  // Modals
  openCustomerModal: () => void;
  openPaymentModal: () => void;
  openShortcutsModal: () => void;
  openPriceCheckModal: () => void;
  openDiscountModal: () => void;
  openQuantityModal: () => void;
}

export function POSQuickMode({
  products,
  cartItems,
  selectedItem,
  setSelectedItem,
  addToCart,
  removeItem,
  clearCart,
  customer,
  subtotal,
  discountValue,
  total,
  isRegisterOpen,
  openCustomerModal,
  openPaymentModal,
  openShortcutsModal,
  openPriceCheckModal,
  openDiscountModal,
  openQuantityModal,
}: POSQuickModeProps) {
  const handleCheckout = useCallback(() => {
    if (cartItems.length === 0 || !isRegisterOpen) return;
    openPaymentModal();
  }, [cartItems.length, isRegisterOpen, openPaymentModal]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onF1: openShortcutsModal,
    onF2: openPriceCheckModal,
    onF3: () => selectedItem && openQuantityModal(),
    onF5: () => selectedItem && openDiscountModal(),
    onF6: () => cartItems.length > 0 && openDiscountModal(),
    onF7: openCustomerModal,
    onF8: () => selectedItem && removeItem(selectedItem.id),
    onF9: () => cartItems.length > 0 && clearCart(),
    onF12: handleCheckout,
  }, true);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      {/* Customer indicator */}
      {customer && (
        <div className="px-4 py-2 bg-primary/10 border-b border-primary/20 flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">{customer.name}</span>
          {customer.cpf && (
            <span className="text-xs text-muted-foreground">CPF: {customer.cpf}</span>
          )}
        </div>
      )}

      {/* Search */}
      <div className="p-4">
        <QuickModeSearch
          products={products}
          onSelectProduct={addToCart}
          disabled={!isRegisterOpen}
        />
      </div>

      {/* Items List */}
      <QuickModeItemList
        items={cartItems}
        selectedItemId={selectedItem?.id || null}
        onSelectItem={setSelectedItem}
      />

      {/* Totals */}
      <QuickModeTotals
        items={cartItems}
        subtotal={subtotal}
        discountValue={discountValue}
        total={total}
      />

      {/* Shortcuts */}
      <QuickModeShortcuts
        onF7={openCustomerModal}
        onF9={() => cartItems.length > 0 && clearCart()}
        onF12={handleCheckout}
        hasItems={cartItems.length > 0}
        isRegisterOpen={isRegisterOpen}
      />
    </div>
  );
}
