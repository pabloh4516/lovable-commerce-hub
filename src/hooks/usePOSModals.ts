import { useState, useCallback } from 'react';
import { POSModalType, Product, PaymentMethod, Customer, CartItem } from '@/types/pos';

interface ReceiptData {
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
}

export function usePOSModals() {
  const [activeModal, setActiveModal] = useState<POSModalType | null>(null);
  const [movementType, setMovementType] = useState<'withdrawal' | 'deposit'>('withdrawal');
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSaleData, setLastSaleData] = useState<ReceiptData | null>(null);

  const openModal = useCallback((modal: POSModalType) => {
    setActiveModal(modal);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
    setPendingProduct(null);
  }, []);

  const openWeightModal = useCallback((product: Product) => {
    setPendingProduct(product);
    setActiveModal('weight');
  }, []);

  const openWithdrawal = useCallback(() => {
    setMovementType('withdrawal');
    setActiveModal('withdrawal');
  }, []);

  const openDeposit = useCallback(() => {
    setMovementType('deposit');
    setActiveModal('deposit');
  }, []);

  const showReceiptModal = useCallback((data: ReceiptData) => {
    setLastSaleData(data);
    setShowReceipt(true);
  }, []);

  const closeReceiptModal = useCallback(() => {
    setShowReceipt(false);
  }, []);

  return {
    // State
    activeModal,
    movementType,
    pendingProduct,
    showReceipt,
    lastSaleData,
    
    // Actions
    openModal,
    closeModal,
    openWeightModal,
    openWithdrawal,
    openDeposit,
    showReceiptModal,
    closeReceiptModal,
    setMovementType,
  };
}
