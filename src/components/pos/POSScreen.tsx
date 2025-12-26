import { useState, useMemo } from 'react';
import { ProductSearch } from './ProductSearch';
import { QuickCategories } from './QuickCategories';
import { ProductGrid } from './ProductGrid';
import { Cart } from './Cart';
import { PaymentModal } from './PaymentModal';
import { products, categories } from '@/data/mockData';
import { CartItem, Product, PaymentMethod } from '@/types/pos';
import { toast } from 'sonner';

export function POSScreen() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products;
    const category = categories.find((c) => c.id === selectedCategory);
    return products.filter((p) => p.category === category?.name);
  }, [selectedCategory]);

  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * product.price,
              }
            : item
        );
      }
      return [
        ...prev,
        {
          product,
          quantity: 1,
          discount: 0,
          subtotal: product.price,
        },
      ];
    });
    toast.success(`${product.name} adicionado`, {
      duration: 1500,
      position: 'bottom-right',
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity,
              subtotal: quantity * item.product.price,
            }
          : item
      )
    );
  };

  const removeItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    setIsPaymentOpen(true);
  };

  const handlePaymentConfirm = (payments: { method: PaymentMethod; amount: number }[]) => {
    setIsPaymentOpen(false);
    setCartItems([]);
    toast.success('Venda realizada com sucesso!', {
      duration: 3000,
    });
  };

  const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <div className="h-screen flex">
      {/* Left side - Products */}
      <div className="flex-1 flex flex-col p-4 lg:p-6 overflow-hidden">
        <div className="mb-4">
          <ProductSearch products={products} onSelectProduct={addToCart} />
        </div>

        <div className="mb-4">
          <QuickCategories
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          <ProductGrid products={filteredProducts} onSelectProduct={addToCart} />
        </div>
      </div>

      {/* Right side - Cart */}
      <div className="w-96 bg-card border-l border-border hidden lg:block">
        <Cart
          items={cartItems}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeItem}
          onClearCart={clearCart}
          onCheckout={handleCheckout}
        />
      </div>

      {/* Mobile Cart Button */}
      {cartItems.length > 0 && (
        <button
          onClick={handleCheckout}
          className="lg:hidden fixed bottom-4 right-4 left-4 bg-primary text-primary-foreground py-4 px-6 rounded-xl shadow-lg flex items-center justify-between animate-slide-in-bottom"
        >
          <span className="font-medium">
            {cartItems.reduce((sum, item) => sum + item.quantity, 0)} itens
          </span>
          <span className="font-bold text-lg">
            R$ {total.toFixed(2).replace('.', ',')}
          </span>
        </button>
      )}

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        total={total}
        onConfirm={handlePaymentConfirm}
      />
    </div>
  );
}
