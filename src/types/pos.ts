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
  isWeighted?: boolean;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  weight?: number;
  discount: number;
  discountType: 'percent' | 'value';
  subtotal: number;
}

export interface Sale {
  id: string;
  number: number;
  items: CartItem[];
  subtotal: number;
  discount: number;
  discountType: 'percent' | 'value';
  total: number;
  payments: Payment[];
  customerId?: string;
  customerName?: string;
  customerCpf?: string;
  operatorId: string;
  operatorName: string;
  registerId: string;
  createdAt: Date;
  status: 'completed' | 'cancelled' | 'pending';
  isFiado?: boolean;
}

export interface Payment {
  method: PaymentMethod;
  amount: number;
}

export type PaymentMethod = 'cash' | 'pix' | 'credit' | 'debit' | 'fiado';

export interface CashRegister {
  id: string;
  number: number;
  openedAt: Date;
  closedAt?: Date;
  openingBalance: number;
  closingBalance?: number;
  expectedBalance?: number;
  difference?: number;
  sales: Sale[];
  withdrawals: CashMovement[];
  deposits: CashMovement[];
  operatorId: string;
  operatorName: string;
  status: 'open' | 'closed';
  totalSales: number;
  totalCash: number;
  totalPix: number;
  totalCredit: number;
  totalDebit: number;
  totalFiado: number;
}

export interface CashMovement {
  id: string;
  type: 'withdrawal' | 'deposit';
  amount: number;
  reason: string;
  createdAt: Date;
  operatorId: string;
  operatorName: string;
  supervisorId?: string;
  supervisorName?: string;
}

export interface DashboardStats {
  todaySales: number;
  todayRevenue: number;
  averageTicket: number;
  productsSold?: number;
  revenueChange?: number;
  salesChange?: number;
  topProducts: { id?: string; name?: string; product?: Product; quantity: number; revenue?: number; rank?: number }[];
  salesByPaymentMethod: { method: PaymentMethod; total: number }[] | Record<string, number>;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Customer {
  id: string;
  name: string;
  cpf?: string;
  phone?: string;
  email?: string;
  address?: string;
  creditLimit: number;
  currentDebt: number;
}

export interface Operator {
  id: string;
  name: string;
  code: string;
  role: 'operator' | 'supervisor' | 'admin';
  isActive: boolean;
}

export type POSModalType = 
  | 'payment'
  | 'openRegister'
  | 'closeRegister'
  | 'withdrawal'
  | 'deposit'
  | 'customer'
  | 'discount'
  | 'quantity'
  | 'weight'
  | 'priceCheck'
  | 'cancelItem'
  | 'cancelSale'
  | 'supervisor'
  | 'shortcuts';
