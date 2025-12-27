import { useState, useCallback, useMemo } from 'react';
import { CartItem, Product, Customer } from '@/types/pos';
import { toast } from 'sonner';
import { usePromotionCalculator, AppliedPromotion } from './usePromotions';

interface UseCartOptions {
  isRegisterOpen: boolean;
  onWeightedProduct?: (product: Product) => void;
}

export interface CartItemWithPromotion extends CartItem {
  appliedPromotion?: AppliedPromotion | null;
  originalSubtotal: number;
}

export function useCartWithPromotions({ isRegisterOpen, onWeightedProduct }: UseCartOptions) {
  const [cartItems, setCartItems] = useState<CartItemWithPromotion[]>([]);
  const [selectedItem, setSelectedItem] = useState<CartItemWithPromotion | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerCpf, setCustomerCpf] = useState<string | undefined>();
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [totalDiscountType, setTotalDiscountType] = useState<'percent' | 'value'>('percent');
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0);
  const [loyaltyPointsUsed, setLoyaltyPointsUsed] = useState(0);

  const { calculateProductDiscount, activePromotions } = usePromotionCalculator();

  // Calcular promoção para um item
  const calculateItemPromotion = useCallback((product: Product, quantity: number): AppliedPromotion | null => {
    return calculateProductDiscount(
      product.id,
      product.category,
      quantity,
      product.price
    );
  }, [calculateProductDiscount]);

  // Recalcular promoções de todos os itens
  const recalculatePromotions = useCallback((items: CartItemWithPromotion[]): CartItemWithPromotion[] => {
    return items.map((item) => {
      const promotion = calculateItemPromotion(item.product, item.quantity);
      const originalSubtotal = item.quantity * item.product.price;
      const promotionDiscount = promotion?.discount || 0;
      const manualDiscount = item.discountType === 'percent'
        ? (originalSubtotal * item.discount / 100)
        : item.discount;
      
      // Aplicar maior desconto (promoção ou manual)
      const bestDiscount = Math.max(promotionDiscount, manualDiscount);
      const subtotal = Math.max(0, originalSubtotal - bestDiscount);

      return {
        ...item,
        appliedPromotion: promotionDiscount >= manualDiscount ? promotion : null,
        originalSubtotal,
        subtotal,
      };
    });
  }, [calculateItemPromotion]);

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
      let newItems: CartItemWithPromotion[];

      if (existing) {
        newItems = prev.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      } else {
        newItems = [
          ...prev,
          {
            id: Date.now().toString(),
            product,
            quantity: 1,
            discount: 0,
            discountType: 'percent' as const,
            subtotal: product.price,
            originalSubtotal: product.price,
            appliedPromotion: null,
          },
        ];
      }

      return recalculatePromotions(newItems);
    });

    toast.success(`${product.name} adicionado`, { duration: 1500, position: 'bottom-right' });
  }, [isRegisterOpen, onWeightedProduct, recalculatePromotions]);

  const addWeightedProduct = useCallback((product: Product, weight: number) => {
    const subtotal = weight * product.price;
    setCartItems((prev) => {
      const newItems: CartItemWithPromotion[] = [
        ...prev,
        {
          id: Date.now().toString(),
          product,
          quantity: 1,
          weight,
          discount: 0,
          discountType: 'percent' as const,
          subtotal,
          originalSubtotal: subtotal,
          appliedPromotion: null,
        },
      ];
      return recalculatePromotions(newItems);
    });
    toast.success(`${product.name} - ${weight.toFixed(3)}kg adicionado`, { duration: 1500, position: 'bottom-right' });
  }, [recalculatePromotions]);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
      if (selectedItem?.id === itemId) setSelectedItem(null);
      return;
    }
    setCartItems((prev) => {
      const newItems = prev.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      );
      return recalculatePromotions(newItems);
    });
  }, [selectedItem?.id, recalculatePromotions]);

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
    setLoyaltyDiscount(0);
    setLoyaltyPointsUsed(0);
  }, []);

  const applyItemDiscount = useCallback((itemId: string, discount: number, type: 'percent' | 'value') => {
    setCartItems((prev) => {
      const newItems = prev.map((item) => {
        if (item.id !== itemId) return item;
        return { ...item, discount, discountType: type };
      });
      return recalculatePromotions(newItems);
    });
    setSelectedItem(null);
  }, [recalculatePromotions]);

  const setDiscount = useCallback((discount: number, type: 'percent' | 'value') => {
    setTotalDiscount(discount);
    setTotalDiscountType(type);
  }, []);

  const applyLoyaltyDiscount = useCallback((points: number, discountValue: number) => {
    setLoyaltyPointsUsed(points);
    setLoyaltyDiscount(discountValue);
  }, []);

  const selectCustomer = useCallback((selectedCustomer: Customer | null, cpf?: string) => {
    setCustomer(selectedCustomer);
    setCustomerCpf(selectedCustomer?.cpf || cpf);
    // Reset loyalty quando trocar cliente
    if (!selectedCustomer) {
      setLoyaltyDiscount(0);
      setLoyaltyPointsUsed(0);
    }
  }, []);

  const lastItem = useMemo(() => {
    return cartItems.length > 0 ? cartItems[cartItems.length - 1] : null;
  }, [cartItems]);

  // Soma das promoções automáticas
  const promotionsDiscount = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      if (item.appliedPromotion) {
        return sum + item.appliedPromotion.discount;
      }
      return sum;
    }, 0);
  }, [cartItems]);

  const subtotal = useMemo(() => 
    cartItems.reduce((sum, item) => sum + item.originalSubtotal, 0)
  , [cartItems]);

  const subtotalWithPromotions = useMemo(() => 
    cartItems.reduce((sum, item) => sum + item.subtotal, 0)
  , [cartItems]);

  const discountValue = useMemo(() => 
    totalDiscountType === 'percent' 
      ? (subtotalWithPromotions * totalDiscount / 100) 
      : totalDiscount
  , [subtotalWithPromotions, totalDiscount, totalDiscountType]);

  const total = useMemo(() => 
    Math.max(0, subtotalWithPromotions - discountValue - loyaltyDiscount)
  , [subtotalWithPromotions, discountValue, loyaltyDiscount]);

  // Itens com promoções ativas
  const itemsWithPromotions = useMemo(() => 
    cartItems.filter((item) => item.appliedPromotion)
  , [cartItems]);

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
    subtotalWithPromotions,
    promotionsDiscount,
    discountValue,
    loyaltyDiscount,
    loyaltyPointsUsed,
    total,
    itemsWithPromotions,
    activePromotions,
    
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
    applyLoyaltyDiscount,
  };
}
