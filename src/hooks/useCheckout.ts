import { useCallback } from 'react';
import { useSaleMutations } from '@/hooks/useSales';
import { CartItem, PaymentMethod, Customer } from '@/types/pos';
import { toast } from 'sonner';

interface CheckoutParams {
  registerId: string;
  cartItems: CartItem[];
  customer: Customer | null;
  customerCpf?: string;
  totalDiscount: number;
  totalDiscountType: 'percent' | 'value';
  subtotal: number;
  total: number;
}

interface UseCheckoutOptions {
  onSuccess: () => void;
  onShowReceipt: (data: {
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
  }) => void;
}

export function useCheckout({ onSuccess, onShowReceipt }: UseCheckoutOptions) {
  const { createSale } = useSaleMutations();

  const processPayment = useCallback((
    payments: { method: PaymentMethod; amount: number }[],
    params: CheckoutParams,
    saleNumber: number,
    operatorName: string,
    storeSettings?: {
      name?: string;
      address?: string | null;
      cnpj?: string | null;
      phone?: string | null;
    }
  ) => {
    const receiptData = {
      saleNumber,
      items: [...params.cartItems],
      payments,
      subtotal: params.subtotal,
      discount: params.totalDiscount,
      discountType: params.totalDiscountType,
      total: params.total,
      customer: params.customer,
      customerCpf: params.customerCpf,
      operatorName,
      storeName: storeSettings?.name || 'Minha Loja',
      storeAddress: storeSettings?.address || undefined,
      storeCnpj: storeSettings?.cnpj || undefined,
      storePhone: storeSettings?.phone || undefined,
      createdAt: new Date(),
    };

    createSale.mutate({
      registerId: params.registerId,
      customerId: params.customer?.id,
      items: params.cartItems,
      payments,
      subtotal: params.subtotal,
      discount: params.totalDiscount,
      discountType: params.totalDiscountType,
      total: params.total,
      isFiado: payments.some(p => p.method === 'fiado'),
    }, {
      onSuccess: () => {
        onShowReceipt(receiptData);
        onSuccess();
        toast.success('Venda realizada com sucesso!', { duration: 3000 });
      },
    });
  }, [createSale, onSuccess, onShowReceipt]);

  return {
    processPayment,
    isProcessing: createSale.isPending,
  };
}
