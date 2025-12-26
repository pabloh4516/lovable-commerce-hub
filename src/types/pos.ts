export interface Product {
  id: string;
  code: string;
  barcode?: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  unit: string;
  image?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  discount: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  payments: Payment[];
  customerId?: string;
  customerName?: string;
  operatorId: string;
  operatorName: string;
  createdAt: Date;
  status: 'completed' | 'cancelled' | 'pending';
}

export interface Payment {
  method: PaymentMethod;
  amount: number;
}

export type PaymentMethod = 'cash' | 'pix' | 'credit' | 'debit';

export interface CashRegister {
  id: string;
  openedAt: Date;
  closedAt?: Date;
  openingBalance: number;
  closingBalance?: number;
  sales: Sale[];
  withdrawals: CashMovement[];
  deposits: CashMovement[];
  operatorId: string;
  status: 'open' | 'closed';
}

export interface CashMovement {
  id: string;
  type: 'withdrawal' | 'deposit';
  amount: number;
  reason: string;
  createdAt: Date;
  operatorId: string;
}

export interface DashboardStats {
  todaySales: number;
  todayRevenue: number;
  averageTicket: number;
  topProducts: { product: Product; quantity: number }[];
  salesByPaymentMethod: { method: PaymentMethod; total: number }[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}
