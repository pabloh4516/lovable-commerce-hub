import { useState, useCallback, useMemo } from 'react';
import { CartItem, Product, Customer } from '@/types/pos';
import { toast } from 'sonner';

interface UseCartOptions {
  isRegisterOpen: boolean;
  onWeightedProduct?: (product: Product) => void;
}

export function useCart({ isRegisterOpen, onWeightedProduct }: UseCartOptions) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerCpf, setCustomerCpf] = useState<string | undefined>();
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [totalDiscountType, setTotalDiscountType] = useState<'percent' | 'value'>('percent');

  const addToCart = useCallback((product: Product) => {
    if (!isRegisterOpen) {
      toast.error('Abra o caixa para iniciar vendas');
      return;
    }

    if (product.isWeighted) {
      onWeightedProduct?.(product);
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
          discountType: 'percent' as const,
          subtotal: product.price,
        },
      ];
    });
    toast.success(`${product.name} adicionado`, { duration: 1500, position: 'bottom-right' });
  }, [isRegisterOpen, onWeightedProduct]);

  const addWeightedProduct = useCallback((product: Product, weight: number) => {
    const subtotal = weight * product.price;
    setCartItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        product,
        quantity: 1,
        weight,
        discount: 0,
        discountType: 'percent' as const,
        subtotal,
      },
    ]);
    toast.success(`${product.name} - ${weight.toFixed(3)}kg adicionado`, { duration: 1500, position: 'bottom-right' });
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
      if (selectedItem?.id === itemId) setSelectedItem(null);
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
  }, [selectedItem?.id]);

  const removeItem = useCallback((itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    if (selectedItem?.id === itemId) setSelectedItem(null);
  }, [selectedItem?.id]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setSelectedItem(null);
    setCustomer(null);
    setCustomerCpf(undefined);
    setTotalDiscount(0);
    setTotalDiscountType('percent');
  }, []);

  const applyItemDiscount = useCallback((itemId: string, discount: number, type: 'percent' | 'value') => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const discountAmount = type === 'percent' 
          ? (item.product.price * item.quantity * discount / 100)
          : discount;
        const subtotal = item.product.price * item.quantity - discountAmount;
        return { ...item, discount, discountType: type, subtotal: Math.max(0, subtotal) };
      })
    );
    setSelectedItem(null);
  }, []);

  const setDiscount = useCallback((discount: number, type: 'percent' | 'value') => {
    setTotalDiscount(discount);
    setTotalDiscountType(type);
  }, []);

  const selectCustomer = useCallback((selectedCustomer: Customer | null, cpf?: string) => {
    setCustomer(selectedCustomer);
    setCustomerCpf(selectedCustomer?.cpf || cpf);
  }, []);

  const lastItem = useMemo(() => {
    return cartItems.length > 0 ? cartItems[cartItems.length - 1] : null;
  }, [cartItems]);

  const subtotal = useMemo(() => 
    cartItems.reduce((sum, item) => sum + item.subtotal, 0)
  , [cartItems]);

  const discountValue = useMemo(() => 
    totalDiscountType === 'percent' ? (subtotal * totalDiscount / 100) : totalDiscount
  , [subtotal, totalDiscount, totalDiscountType]);

  const total = useMemo(() => subtotal - discountValue, [subtotal, discountValue]);

  return {
    // State
    cartItems,
    selectedItem,
    customer,
    customerCpf,
    totalDiscount,
    totalDiscountType,
    lastItem,
    subtotal,
    discountValue,
    total,
    
    // Actions
    setSelectedItem,
    addToCart,
    addWeightedProduct,
    updateQuantity,
    removeItem,
    clearCart,
    applyItemDiscount,
    setDiscount,
    selectCustomer,
  };
}
