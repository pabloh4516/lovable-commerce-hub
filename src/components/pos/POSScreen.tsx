import { useState, useMemo, useCallback } from 'react';
import { ProductSearch } from './ProductSearch';
import { QuickCategories } from './QuickCategories';
import { ProductGrid } from './ProductGrid';
import { SaleItemsTable } from './SaleItemsTable';
import { LastItemAdded } from './LastItemAdded';
import { TotalsPanel } from './TotalsPanel';
import { ShortcutsBar } from './ShortcutsBar';
import { SidePanel } from './SidePanel';
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
import { products, categories, quickProducts } from '@/data/mockData';
import { CartItem, Product, PaymentMethod, Customer, POSModalType } from '@/types/pos';
import { useCashRegister } from '@/hooks/useCashRegister';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutGrid, List } from 'lucide-react';

export function POSScreen() {
  const { register, isOpen, openRegister, closeRegister, addSale, addWithdrawal, addDeposit } = useCashRegister();
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerCpf, setCustomerCpf] = useState<string | undefined>();
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [totalDiscountType, setTotalDiscountType] = useState<'percent' | 'value'>('percent');
  const [saleNumber, setSaleNumber] = useState(1);
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<'items' | 'products'>('items');

  // Modal states
  const [activeModal, setActiveModal] = useState<POSModalType | null>(null);
  const [movementType, setMovementType] = useState<'withdrawal' | 'deposit'>('withdrawal');

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products;
    const category = categories.find((c) => c.id === selectedCategory);
    return products.filter((p) => p.category === category?.name);
  }, [selectedCategory]);

  const lastItem = useMemo(() => {
    return cartItems.length > 0 ? cartItems[cartItems.length - 1] : null;
  }, [cartItems]);

  const closeModal = useCallback(() => {
    setActiveModal(null);
    setPendingProduct(null);
  }, []);

  const addToCart = useCallback((product: Product) => {
    if (!isOpen) {
      toast.error('Abra o caixa para iniciar vendas');
      return;
    }

    if (product.isWeighted) {
      setPendingProduct(product);
      setActiveModal('weight');
      return;
    }

    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * product.price * (1 - item.discount / 100),
              }
            : item
        );
      }
      return [
        ...prev,
        {
          id: Date.now().toString(),
          product,
          quantity: 1,
          discount: 0,
          discountType: 'percent',
          subtotal: product.price,
        },
      ];
    });
    toast.success(`${product.name} adicionado`, { duration: 1500, position: 'bottom-right' });
  }, [isOpen]);

  const addWeightedProduct = useCallback((weight: number) => {
    if (!pendingProduct) return;

    const subtotal = weight * pendingProduct.price;
    setCartItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        product: pendingProduct,
        quantity: 1,
        weight,
        discount: 0,
        discountType: 'percent',
        subtotal,
      },
    ]);
    toast.success(`${pendingProduct.name} - ${weight.toFixed(3)}kg adicionado`, { duration: 1500, position: 'bottom-right' });
    closeModal();
  }, [pendingProduct, closeModal]);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity,
              subtotal: quantity * item.product.price * (1 - item.discount / 100),
            }
          : item
      )
    );
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    setSelectedItem(null);
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setSelectedItem(null);
    setCustomer(null);
    setCustomerCpf(undefined);
    setTotalDiscount(0);
  }, []);

  const handleCheckout = useCallback(() => {
    if (cartItems.length === 0) return;
    setActiveModal('payment');
  }, [cartItems.length]);

  const handlePaymentConfirm = useCallback((payments: { method: PaymentMethod; amount: number }[]) => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    const discountValue = totalDiscountType === 'percent' ? (subtotal * totalDiscount / 100) : totalDiscount;
    const total = subtotal - discountValue;

    const sale = {
      id: Date.now().toString(),
      number: saleNumber,
      items: cartItems,
      subtotal,
      discount: totalDiscount,
      discountType: totalDiscountType,
      total,
      payments,
      customerId: customer?.id,
      customerName: customer?.name,
      customerCpf: customer?.cpf || customerCpf,
      operatorId: '1',
      operatorName: 'Operador',
      registerId: register?.id || '',
      createdAt: new Date(),
      status: 'completed' as const,
      isFiado: payments.some(p => p.method === 'fiado'),
    };

    addSale(sale);
    closeModal();
    clearCart();
    setSaleNumber((prev) => prev + 1);
    toast.success('Venda realizada com sucesso!', { duration: 3000 });
  }, [cartItems, totalDiscount, totalDiscountType, customer, customerCpf, register, saleNumber, addSale, closeModal, clearCart]);

  const handleOpenRegister = useCallback((amount: number) => {
    openRegister(amount, '1', 'Operador');
    closeModal();
    toast.success(`Caixa aberto com R$ ${amount.toFixed(2).replace('.', ',')}`, { duration: 3000 });
  }, [openRegister, closeModal]);

  const handleCloseRegister = useCallback((closingBalance: number) => {
    const result = closeRegister(closingBalance);
    closeModal();
    if (result) {
      const diff = result.difference || 0;
      if (diff === 0) {
        toast.success('Caixa fechado - Valores conferem!', { duration: 3000 });
      } else if (diff > 0) {
        toast.warning(`Caixa fechado - Sobra de R$ ${diff.toFixed(2)}`, { duration: 5000 });
      } else {
        toast.error(`Caixa fechado - Falta de R$ ${Math.abs(diff).toFixed(2)}`, { duration: 5000 });
      }
    }
  }, [closeRegister, closeModal]);

  const handleWithdrawal = useCallback((amount: number, reason: string) => {
    addWithdrawal(amount, reason, '1', 'Operador');
    closeModal();
    toast.success(`Sangria de R$ ${amount.toFixed(2).replace('.', ',')} realizada`, { duration: 3000 });
  }, [addWithdrawal, closeModal]);

  const handleDeposit = useCallback((amount: number, reason: string) => {
    addDeposit(amount, reason, '1', 'Operador');
    closeModal();
    toast.success(`Suprimento de R$ ${amount.toFixed(2).replace('.', ',')} realizado`, { duration: 3000 });
  }, [addDeposit, closeModal]);

  const handleSelectCustomer = useCallback((selectedCustomer: Customer | null, cpf?: string) => {
    setCustomer(selectedCustomer);
    setCustomerCpf(selectedCustomer?.cpf || cpf);
    closeModal();
  }, [closeModal]);

  const handleItemDiscount = useCallback((discount: number, type: 'percent' | 'value') => {
    if (!selectedItem) return;
    
    const discountAmount = type === 'percent' 
      ? (selectedItem.product.price * selectedItem.quantity * discount / 100)
      : discount;
    const subtotal = selectedItem.product.price * selectedItem.quantity - discountAmount;

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === selectedItem.id
          ? { ...item, discount, discountType: type, subtotal: Math.max(0, subtotal) }
          : item
      )
    );
    closeModal();
    setSelectedItem(null);
  }, [selectedItem, closeModal]);

  const handleTotalDiscount = useCallback((discount: number, type: 'percent' | 'value') => {
    setTotalDiscount(discount);
    setTotalDiscountType(type);
    closeModal();
  }, [closeModal]);

  const handleQuantityChange = useCallback((quantity: number) => {
    if (!selectedItem) return;
    updateQuantity(selectedItem.id, quantity);
    closeModal();
    setSelectedItem(null);
  }, [selectedItem, updateQuantity, closeModal]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onF1: () => setActiveModal('shortcuts'),
    onF2: () => setActiveModal('priceCheck'),
    onF3: () => selectedItem && setActiveModal('quantity'),
    onF4: () => selectedItem?.product.isWeighted && setActiveModal('weight'),
    onF5: () => selectedItem && setActiveModal('discount'),
    onF6: () => cartItems.length > 0 && setActiveModal('discount'),
    onF7: () => setActiveModal('customer'),
    onF8: () => selectedItem && removeItem(selectedItem.id),
    onF9: () => cartItems.length > 0 && clearCart(),
    onF10: () => isOpen && (setMovementType('withdrawal'), setActiveModal('withdrawal')),
    onF11: () => isOpen && (setMovementType('deposit'), setActiveModal('deposit')),
    onF12: () => cartItems.length > 0 && handleCheckout(),
    onEscape: closeModal,
  }, true);

  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const discountValue = totalDiscountType === 'percent' ? (subtotal * totalDiscount / 100) : totalDiscount;
  const total = subtotal - discountValue;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <POSHeader
        register={register}
        saleNumber={saleNumber}
        onOpenRegister={() => setActiveModal('openRegister')}
        onCloseRegister={() => setActiveModal('closeRegister')}
        onWithdrawal={() => { setMovementType('withdrawal'); setActiveModal('withdrawal'); }}
        onDeposit={() => { setMovementType('deposit'); setActiveModal('deposit'); }}
        onPriceCheck={() => setActiveModal('priceCheck')}
        onShowShortcuts={() => setActiveModal('shortcuts')}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left side - Main Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search Bar */}
          <div className="p-4 pb-2 border-b border-border">
            <ProductSearch products={products} onSelectProduct={addToCart} />
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
              {/* Last Item Added */}
              <div className="p-4 pb-2">
                <LastItemAdded item={lastItem} />
              </div>

              {/* Sale Items Table */}
              <div className="flex-1 overflow-hidden">
                <SaleItemsTable
                  items={cartItems}
                  selectedItemId={selectedItem?.id || null}
                  onSelectItem={setSelectedItem}
                  onRemoveItem={removeItem}
                />
              </div>

              {/* Totals Panel */}
              <div className="p-4 pt-2">
                <TotalsPanel
                  items={cartItems}
                  totalDiscount={totalDiscount}
                  totalDiscountType={totalDiscountType}
                />
              </div>
            </TabsContent>

            <TabsContent value="products" className="flex-1 overflow-y-auto m-0 p-4">
              <ProductGrid products={filteredProducts} onSelectProduct={addToCart} />
            </TabsContent>
          </Tabs>

          {/* Shortcuts Bar */}
          <div className="border-t border-border bg-card">
            <ShortcutsBar
              onF1={() => setActiveModal('shortcuts')}
              onF2={() => setActiveModal('priceCheck')}
              onF3={() => selectedItem && setActiveModal('quantity')}
              onF4={() => selectedItem?.product.isWeighted && setActiveModal('weight')}
              onF5={() => selectedItem && setActiveModal('discount')}
              onF6={() => cartItems.length > 0 && setActiveModal('discount')}
              onF7={() => setActiveModal('customer')}
              onF8={() => selectedItem && removeItem(selectedItem.id)}
              onF9={() => cartItems.length > 0 && clearCart()}
              onF10={() => isOpen && (setMovementType('withdrawal'), setActiveModal('withdrawal'))}
              onF11={() => isOpen && (setMovementType('deposit'), setActiveModal('deposit'))}
              onF12={handleCheckout}
              disabled={{
                F3: !selectedItem,
                F4: !selectedItem?.product.isWeighted,
                F5: !selectedItem,
                F6: cartItems.length === 0,
                F8: !selectedItem,
                F9: cartItems.length === 0,
                F10: !isOpen,
                F11: !isOpen,
                F12: cartItems.length === 0,
              }}
            />
          </div>
        </div>

        {/* Right side - Side Panel */}
        <div className="w-[340px] hidden lg:block">
          <SidePanel
            customer={customer}
            customerCpf={customerCpf}
            categories={categories}
            quickProducts={quickProducts}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onSelectProduct={addToCart}
            onOpenCustomer={() => setActiveModal('customer')}
            onOpenDiscount={() => setActiveModal('discount')}
            onCheckout={handleCheckout}
            total={total}
            itemCount={cartItems.length}
            isRegisterOpen={isOpen}
          />
        </div>

        {/* Mobile Cart Button */}
        {cartItems.length > 0 && (
          <button
            onClick={handleCheckout}
            className="fixed bottom-4 left-4 right-4 lg:hidden h-16 bg-primary text-primary-foreground rounded-lg flex items-center justify-between px-6 font-semibold shadow-lg"
          >
            <span className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary-foreground/20 flex items-center justify-center font-bold tabular-nums">
                {cartItems.length}
              </span>
              <span>itens</span>
            </span>
            <span className="text-xl font-bold tabular-nums">
              R$ {total.toFixed(2).replace('.', ',')}
            </span>
          </button>
        )}
      </div>

      {/* Modals */}
      <OpenRegisterModal
        isOpen={activeModal === 'openRegister'}
        onClose={closeModal}
        onConfirm={handleOpenRegister}
      />

      {register && (
        <CloseRegisterModal
          isOpen={activeModal === 'closeRegister'}
          onClose={closeModal}
          onConfirm={handleCloseRegister}
          register={register}
        />
      )}

      <CashMovementModal
        isOpen={activeModal === 'withdrawal' || activeModal === 'deposit'}
        onClose={closeModal}
        onConfirm={movementType === 'withdrawal' ? handleWithdrawal : handleDeposit}
        type={movementType}
      />

      <CustomerModal
        isOpen={activeModal === 'customer'}
        onClose={closeModal}
        onSelect={handleSelectCustomer}
        currentCustomer={customer}
      />

      <WeightModal
        isOpen={activeModal === 'weight'}
        onClose={closeModal}
        onConfirm={addWeightedProduct}
        product={pendingProduct}
      />

      <QuantityModal
        isOpen={activeModal === 'quantity'}
        onClose={closeModal}
        onConfirm={handleQuantityChange}
        item={selectedItem}
      />

      <DiscountModal
        isOpen={activeModal === 'discount'}
        onClose={closeModal}
        onConfirm={selectedItem ? handleItemDiscount : handleTotalDiscount}
        item={selectedItem}
        currentTotal={subtotal}
        isItemDiscount={!!selectedItem}
      />

      <PriceCheckModal
        isOpen={activeModal === 'priceCheck'}
        onClose={closeModal}
      />

      <ShortcutsModal
        isOpen={activeModal === 'shortcuts'}
        onClose={closeModal}
      />

      <PaymentModal
        isOpen={activeModal === 'payment'}
        onClose={closeModal}
        total={total}
        customer={customer}
        onConfirm={handlePaymentConfirm}
      />
    </div>
  );
}
