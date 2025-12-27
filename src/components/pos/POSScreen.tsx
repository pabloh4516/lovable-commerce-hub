import { useState, useCallback, useMemo } from 'react';
import { ProductSearch } from './ProductSearch';
import { QuickCategories } from './QuickCategories';
import { ProductGrid } from './ProductGrid';
import { SaleItemsTable } from './SaleItemsTable';
import { LastItemAdded } from './LastItemAdded';
import { TotalsPanel } from './TotalsPanel';
import { ShortcutsBar } from './ShortcutsBar';
import { CartPanel } from './CartPanel';
import { POSLayout } from './POSLayout';
import { PaymentModal } from './PaymentModal';
import { POSHeader } from './POSHeader';
import { OpenRegisterModal } from './OpenRegisterModal';
import { CloseRegisterModal } from './CloseRegisterModal';
import { CashMovementModal } from './CashMovementModal';
import { CustomerModal } from './CustomerModal';
import { WeightModal } from './WeightModal';
import { QuantityModal } from './QuantityModal';
import { DiscountModal } from './DiscountModal';
import { PriceCheckModal } from './PriceCheckModal';
import { ShortcutsModal } from './ShortcutsModal';
import { ReceiptModal } from './ReceiptModal';
import { useOpenRegister, useCashRegisterMutations } from '@/hooks/useCashRegisterDb';
import { useAuth } from '@/hooks/useAuth';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useCart } from '@/hooks/useCart';
import { usePOSModals } from '@/hooks/usePOSModals';
import { useCheckout } from '@/hooks/useCheckout';
import { usePOSProducts } from '@/hooks/usePOSProducts';
import { PaymentMethod } from '@/types/pos';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutGrid, List, ShoppingCart } from 'lucide-react';

export function POSScreen() {
  const { profile } = useAuth();
  const { data: openRegister, isLoading: loadingRegister } = useOpenRegister();
  const { data: storeSettings } = useStoreSettings();
  const { openRegister: openRegisterMutation, closeRegister: closeRegisterMutation, createMovement } = useCashRegisterMutations();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'items' | 'products'>('items');
  const [saleNumber, setSaleNumber] = useState(1);

  const isOpen = !!openRegister && openRegister.status === 'open';

  // Custom Hooks
  const { products, categories, filteredProducts, quickProducts, isLoading: loadingProducts } = usePOSProducts(selectedCategory);
  
  const modals = usePOSModals();
  
  const cart = useCart({
    isRegisterOpen: isOpen,
    onWeightedProduct: modals.openWeightModal,
  });

  const checkout = useCheckout({
    onSuccess: () => {
      modals.closeModal();
      cart.clearCart();
      setSaleNumber((prev) => prev + 1);
    },
    onShowReceipt: modals.showReceiptModal,
  });

  // Handlers
  const handlePaymentConfirm = useCallback((payments: { method: PaymentMethod; amount: number }[]) => {
    if (!openRegister) return;
    checkout.processPayment(
      payments,
      {
        registerId: openRegister.id,
        cartItems: cart.cartItems,
        customer: cart.customer,
        customerCpf: cart.customerCpf,
        totalDiscount: cart.totalDiscount,
        totalDiscountType: cart.totalDiscountType,
        subtotal: cart.subtotal,
        total: cart.total,
      },
      saleNumber,
      profile?.name || 'Operador',
      storeSettings || undefined
    );
  }, [openRegister, checkout, cart, saleNumber, profile?.name, storeSettings]);

  const handleOpenRegister = useCallback((amount: number) => {
    openRegisterMutation.mutate({ openingBalance: amount, registerNumber: 1 }, {
      onSuccess: modals.closeModal,
    });
  }, [openRegisterMutation, modals.closeModal]);

  const handleCloseRegister = useCallback((closingBalance: number) => {
    if (!openRegister) return;
    closeRegisterMutation.mutate({ registerId: openRegister.id, closingBalance }, {
      onSuccess: modals.closeModal,
    });
  }, [openRegister, closeRegisterMutation, modals.closeModal]);

  const handleCashMovement = useCallback((amount: number, reason: string) => {
    if (!openRegister) return;
    createMovement.mutate({ 
      registerId: openRegister.id, 
      type: modals.movementType, 
      amount, 
      reason 
    }, {
      onSuccess: modals.closeModal,
    });
  }, [openRegister, createMovement, modals.movementType, modals.closeModal]);

  const handleSelectCustomer = useCallback((selectedCustomer: typeof cart.customer, cpf?: string) => {
    cart.selectCustomer(selectedCustomer, cpf);
    modals.closeModal();
  }, [cart, modals]);

  const handleItemDiscount = useCallback((discount: number, type: 'percent' | 'value') => {
    if (!cart.selectedItem) return;
    cart.applyItemDiscount(cart.selectedItem.id, discount, type);
    modals.closeModal();
  }, [cart, modals]);

  const handleTotalDiscount = useCallback((discount: number, type: 'percent' | 'value') => {
    cart.setDiscount(discount, type);
    modals.closeModal();
  }, [cart, modals]);

  const handleQuantityChange = useCallback((quantity: number) => {
    if (!cart.selectedItem) return;
    cart.updateQuantity(cart.selectedItem.id, quantity);
    cart.setSelectedItem(null);
    modals.closeModal();
  }, [cart, modals]);

  const handleWeightConfirm = useCallback((weight: number) => {
    if (!modals.pendingProduct) return;
    cart.addWeightedProduct(modals.pendingProduct, weight);
    modals.closeModal();
  }, [modals.pendingProduct, cart, modals]);

  const handleCheckout = useCallback(() => {
    if (cart.cartItems.length === 0) return;
    modals.openModal('payment');
  }, [cart.cartItems.length, modals]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onF1: () => modals.openModal('shortcuts'),
    onF2: () => modals.openModal('priceCheck'),
    onF3: () => cart.selectedItem && modals.openModal('quantity'),
    onF4: () => cart.selectedItem?.product.isWeighted && modals.openWeightModal(cart.selectedItem.product),
    onF5: () => cart.selectedItem && modals.openModal('discount'),
    onF6: () => cart.cartItems.length > 0 && modals.openModal('discount'),
    onF7: () => modals.openModal('customer'),
    onF8: () => cart.selectedItem && cart.removeItem(cart.selectedItem.id),
    onF9: () => cart.cartItems.length > 0 && cart.clearCart(),
    onF10: () => isOpen && modals.openWithdrawal(),
    onF11: () => isOpen && modals.openDeposit(),
    onF12: handleCheckout,
    onEscape: modals.closeModal,
  }, true);

  // Register data for header
  const registerForHeader = useMemo(() => openRegister ? {
    id: openRegister.id,
    number: openRegister.number,
    openedAt: new Date(openRegister.opened_at),
    closedAt: openRegister.closed_at ? new Date(openRegister.closed_at) : undefined,
    openingBalance: Number(openRegister.opening_balance),
    closingBalance: openRegister.closing_balance ? Number(openRegister.closing_balance) : undefined,
    expectedBalance: openRegister.expected_balance ? Number(openRegister.expected_balance) : undefined,
    difference: openRegister.difference ? Number(openRegister.difference) : undefined,
    sales: [],
    withdrawals: [],
    deposits: [],
    operatorId: openRegister.operator_id,
    operatorName: profile?.name || 'Operador',
    status: openRegister.status as 'open' | 'closed',
    totalSales: Number(openRegister.total_sales),
    totalCash: Number(openRegister.total_cash),
    totalPix: Number(openRegister.total_pix),
    totalCredit: Number(openRegister.total_credit),
    totalDebit: Number(openRegister.total_debit),
    totalFiado: Number(openRegister.total_fiado),
  } : null, [openRegister, profile?.name]);

  return (
    <POSLayout
      isLoading={loadingProducts || loadingRegister}
      header={
        <POSHeader
          register={registerForHeader}
          saleNumber={saleNumber}
          onOpenRegister={() => modals.openModal('openRegister')}
          onCloseRegister={() => modals.openModal('closeRegister')}
          onWithdrawal={modals.openWithdrawal}
          onDeposit={modals.openDeposit}
          onPriceCheck={() => modals.openModal('priceCheck')}
          onShowShortcuts={() => modals.openModal('shortcuts')}
        />
      }
      leftPanel={
        <>
          {/* Search Bar */}
          <div className="p-4 pb-2 border-b border-border">
            <ProductSearch products={products} onSelectProduct={cart.addToCart} />
          </div>

          {/* View Tabs */}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'items' | 'products')} className="flex-1 flex flex-col overflow-hidden">
            <div className="px-4 py-2 border-b border-border flex items-center justify-between">
              <TabsList className="h-9">
                <TabsTrigger value="items" className="gap-2">
                  <List className="w-4 h-4" />
                  Itens da Venda
                </TabsTrigger>
                <TabsTrigger value="products" className="gap-2">
                  <LayoutGrid className="w-4 h-4" />
                  Produtos
                </TabsTrigger>
              </TabsList>
              
              {viewMode === 'products' && (
                <QuickCategories
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />
              )}
            </div>

            <TabsContent value="items" className="flex-1 flex flex-col overflow-hidden m-0 p-0">
              <div className="p-4 pb-2">
                <LastItemAdded item={cart.lastItem} />
              </div>
              <div className="flex-1 overflow-hidden">
                <SaleItemsTable
                  items={cart.cartItems}
                  selectedItemId={cart.selectedItem?.id || null}
                  onSelectItem={cart.setSelectedItem}
                  onRemoveItem={cart.removeItem}
                />
              </div>
              <div className="p-4 pt-2">
                <TotalsPanel
                  items={cart.cartItems}
                  totalDiscount={cart.totalDiscount}
                  totalDiscountType={cart.totalDiscountType}
                />
              </div>
            </TabsContent>

            <TabsContent value="products" className="flex-1 overflow-y-auto m-0 p-4">
              <ProductGrid products={filteredProducts} onSelectProduct={cart.addToCart} />
            </TabsContent>
          </Tabs>

          {/* Shortcuts Bar */}
          <div className="border-t border-border bg-card">
            <ShortcutsBar
              onF1={() => modals.openModal('shortcuts')}
              onF2={() => modals.openModal('priceCheck')}
              onF3={() => cart.selectedItem && modals.openModal('quantity')}
              onF4={() => cart.selectedItem?.product.isWeighted && modals.openWeightModal(cart.selectedItem.product)}
              onF5={() => cart.selectedItem && modals.openModal('discount')}
              onF6={() => cart.cartItems.length > 0 && modals.openModal('discount')}
              onF7={() => modals.openModal('customer')}
              onF8={() => cart.selectedItem && cart.removeItem(cart.selectedItem.id)}
              onF9={() => cart.cartItems.length > 0 && cart.clearCart()}
              onF10={() => isOpen && modals.openWithdrawal()}
              onF11={() => isOpen && modals.openDeposit()}
              onF12={handleCheckout}
              disabled={{
                F3: !cart.selectedItem,
                F4: !cart.selectedItem?.product.isWeighted,
                F5: !cart.selectedItem,
                F6: cart.cartItems.length === 0,
                F8: !cart.selectedItem,
                F9: cart.cartItems.length === 0,
                F10: !isOpen,
                F11: !isOpen,
                F12: cart.cartItems.length === 0,
              }}
            />
          </div>
        </>
      }
      rightPanel={
        <CartPanel
          items={cart.cartItems}
          selectedItemId={cart.selectedItem?.id || null}
          customer={cart.customer}
          customerCpf={cart.customerCpf}
          subtotal={cart.subtotal}
          discountValue={cart.discountValue}
          total={cart.total}
          totalDiscount={cart.totalDiscount}
          totalDiscountType={cart.totalDiscountType}
          isRegisterOpen={isOpen}
          onSelectItem={cart.setSelectedItem}
          onUpdateQuantity={cart.updateQuantity}
          onRemoveItem={cart.removeItem}
          onOpenCustomer={() => modals.openModal('customer')}
          onOpenDiscount={() => modals.openModal('discount')}
          onCheckout={handleCheckout}
        />
      }
      mobileCheckout={
        cart.cartItems.length > 0 ? (
          <button
            onClick={handleCheckout}
            className="fixed bottom-4 left-4 right-4 lg:hidden h-16 bg-primary text-primary-foreground rounded-xl flex items-center justify-between px-6 font-semibold shadow-lg active:scale-[0.98] transition-transform"
          >
            <span className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5" />
              </span>
              <span className="text-lg">{cart.cartItems.length} {cart.cartItems.length === 1 ? 'item' : 'itens'}</span>
            </span>
            <span className="text-xl font-bold tabular-nums">
              R$ {cart.total.toFixed(2).replace('.', ',')}
            </span>
          </button>
        ) : null
      }
      modals={
        <>
          <OpenRegisterModal
            isOpen={modals.activeModal === 'openRegister'}
            onClose={modals.closeModal}
            onConfirm={handleOpenRegister}
          />

          {registerForHeader && (
            <CloseRegisterModal
              isOpen={modals.activeModal === 'closeRegister'}
              onClose={modals.closeModal}
              onConfirm={handleCloseRegister}
              register={registerForHeader}
            />
          )}

          <CashMovementModal
            isOpen={modals.activeModal === 'withdrawal' || modals.activeModal === 'deposit'}
            onClose={modals.closeModal}
            onConfirm={handleCashMovement}
            type={modals.movementType}
          />

          <CustomerModal
            isOpen={modals.activeModal === 'customer'}
            onClose={modals.closeModal}
            onSelect={handleSelectCustomer}
            currentCustomer={cart.customer}
          />

          <WeightModal
            isOpen={modals.activeModal === 'weight'}
            onClose={modals.closeModal}
            onConfirm={handleWeightConfirm}
            product={modals.pendingProduct}
          />

          <QuantityModal
            isOpen={modals.activeModal === 'quantity'}
            onClose={modals.closeModal}
            onConfirm={handleQuantityChange}
            item={cart.selectedItem}
          />

          <DiscountModal
            isOpen={modals.activeModal === 'discount'}
            onClose={modals.closeModal}
            onConfirm={cart.selectedItem ? handleItemDiscount : handleTotalDiscount}
            item={cart.selectedItem}
            currentTotal={cart.subtotal}
            isItemDiscount={!!cart.selectedItem}
          />

          <PriceCheckModal
            isOpen={modals.activeModal === 'priceCheck'}
            onClose={modals.closeModal}
          />

          <ShortcutsModal
            isOpen={modals.activeModal === 'shortcuts'}
            onClose={modals.closeModal}
          />

          <PaymentModal
            isOpen={modals.activeModal === 'payment'}
            onClose={modals.closeModal}
            total={cart.total}
            customer={cart.customer}
            onConfirm={handlePaymentConfirm}
          />

          <ReceiptModal
            isOpen={modals.showReceipt}
            onClose={modals.closeReceiptModal}
            saleData={modals.lastSaleData}
          />
        </>
      }
    />
  );
}
