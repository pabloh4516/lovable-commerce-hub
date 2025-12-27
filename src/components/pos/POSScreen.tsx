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
import { ReceiptModal } from './ReceiptModal';
import { useProducts, useCategories, DbProduct, DbCategory } from '@/hooks/useProducts';
import { useOpenRegister, useCashRegisterMutations, DbCashRegister } from '@/hooks/useCashRegisterDb';
import { useSaleMutations } from '@/hooks/useSales';
import { useAuth } from '@/hooks/useAuth';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { CartItem, Product, PaymentMethod, Customer, POSModalType } from '@/types/pos';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutGrid, List, Loader2 } from 'lucide-react';

// Convert DB product to app Product type
function toProduct(dbProduct: DbProduct): Product {
  return {
    id: dbProduct.id,
    code: dbProduct.code,
    barcode: dbProduct.barcode || undefined,
    name: dbProduct.name,
    category: dbProduct.category_id || '',
    price: Number(dbProduct.price),
    cost: Number(dbProduct.cost),
    stock: Number(dbProduct.stock),
    minStock: Number(dbProduct.min_stock),
    unit: dbProduct.unit,
    isWeighted: dbProduct.is_weighted,
  };
}

export function POSScreen() {
  const { profile } = useAuth();
  const { data: dbProducts = [], isLoading: loadingProducts } = useProducts();
  const { data: dbCategories = [], isLoading: loadingCategories } = useCategories();
  const { data: openRegister, isLoading: loadingRegister } = useOpenRegister();
  const { data: storeSettings } = useStoreSettings();
  const { openRegister: openRegisterMutation, closeRegister: closeRegisterMutation, createMovement } = useCashRegisterMutations();
  const { createSale } = useSaleMutations();
  
  const products = useMemo(() => dbProducts.map(toProduct), [dbProducts]);
  const categories = useMemo(() => dbCategories.map((c: DbCategory) => ({
    id: c.id,
    name: c.name,
    icon: c.icon,
    color: c.color,
  })), [dbCategories]);

  const quickProducts = useMemo(() => products.slice(0, 8), [products]);
  
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
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSaleData, setLastSaleData] = useState<{
    saleNumber: number;
    items: CartItem[];
    payments: { method: PaymentMethod; amount: number }[];
    subtotal: number;
    discount: number;
    discountType: 'percent' | 'value';
    total: number;
    customer?: Customer | null;
    customerCpf?: string;
    operatorName: string;
    storeName: string;
    storeAddress?: string;
    storeCnpj?: string;
    storePhone?: string;
    createdAt: Date;
  } | null>(null);

  // Check if register is open
  const isOpen = !!openRegister && openRegister.status === 'open';

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [selectedCategory, products]);

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
    if (!openRegister) return;

    const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    const discountValue = totalDiscountType === 'percent' ? (subtotal * totalDiscount / 100) : totalDiscount;
    const total = subtotal - discountValue;

    // Save sale data for receipt before clearing
    const saleDataForReceipt = {
      saleNumber,
      items: [...cartItems],
      payments,
      subtotal,
      discount: totalDiscount,
      discountType: totalDiscountType,
      total,
      customer,
      customerCpf,
      operatorName: profile?.name || 'Operador',
      storeName: storeSettings?.name || 'Minha Loja',
      storeAddress: storeSettings?.address || undefined,
      storeCnpj: storeSettings?.cnpj || undefined,
      storePhone: storeSettings?.phone || undefined,
      createdAt: new Date(),
    };

    createSale.mutate({
      registerId: openRegister.id,
      customerId: customer?.id,
      items: cartItems,
      payments,
      subtotal,
      discount: totalDiscount,
      discountType: totalDiscountType,
      total,
      isFiado: payments.some(p => p.method === 'fiado'),
    }, {
      onSuccess: () => {
        closeModal();
        setLastSaleData(saleDataForReceipt);
        setShowReceipt(true);
        clearCart();
        setSaleNumber((prev) => prev + 1);
        toast.success('Venda realizada com sucesso!', { duration: 3000 });
      },
    });
  }, [cartItems, totalDiscount, totalDiscountType, customer, customerCpf, openRegister, createSale, closeModal, clearCart, saleNumber, profile]);

  const handleOpenRegister = useCallback((amount: number) => {
    openRegisterMutation.mutate({ openingBalance: amount, registerNumber: 1 }, {
      onSuccess: () => {
        closeModal();
      },
    });
  }, [openRegisterMutation, closeModal]);

  const handleCloseRegister = useCallback((closingBalance: number) => {
    if (!openRegister) return;
    closeRegisterMutation.mutate({ registerId: openRegister.id, closingBalance }, {
      onSuccess: () => {
        closeModal();
      },
    });
  }, [openRegister, closeRegisterMutation, closeModal]);

  const handleWithdrawal = useCallback((amount: number, reason: string) => {
    if (!openRegister) return;
    createMovement.mutate({ registerId: openRegister.id, type: 'withdrawal', amount, reason }, {
      onSuccess: () => {
        closeModal();
      },
    });
  }, [openRegister, createMovement, closeModal]);

  const handleDeposit = useCallback((amount: number, reason: string) => {
    if (!openRegister) return;
    createMovement.mutate({ registerId: openRegister.id, type: 'deposit', amount, reason }, {
      onSuccess: () => {
        closeModal();
      },
    });
  }, [openRegister, createMovement, closeModal]);

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

  // Create a mock register for header display
  const registerForHeader = openRegister ? {
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
  } : null;

  if (loadingProducts || loadingCategories || loadingRegister) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <POSHeader
        register={registerForHeader}
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

      {registerForHeader && (
        <CloseRegisterModal
          isOpen={activeModal === 'closeRegister'}
          onClose={closeModal}
          onConfirm={handleCloseRegister}
          register={registerForHeader}
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

      <ReceiptModal
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
        saleData={lastSaleData}
      />
    </div>
  );
}
