import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface FinancialCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  parent_id: string | null;
  color: string;
  is_active: boolean;
  created_at: string;
}

export interface BankAccount {
  id: string;
  name: string;
  bank_name: string | null;
  bank_code: string | null;
  agency: string | null;
  account_number: string | null;
  account_type: 'checking' | 'savings' | 'cash';
  initial_balance: number;
  current_balance: number;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface FinancialTransaction {
  id: string;
  number: number;
  type: 'payable' | 'receivable';
  category_id: string | null;
  bank_account_id: string | null;
  customer_id: string | null;
  supplier_id: string | null;
  sale_id: string | null;
  service_order_id: string | null;
  purchase_order_id: string | null;
  description: string;
  amount: number;
  paid_amount: number;
  due_date: string;
  paid_date: string | null;
  status: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  payment_method: string | null;
  installment_number: number | null;
  total_installments: number | null;
  document_number: string | null;
  barcode: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  category?: FinancialCategory;
  customer?: { name: string };
  supplier?: { name: string };
}

export interface Check {
  id: string;
  type: 'received' | 'issued';
  bank_account_id: string | null;
  customer_id: string | null;
  supplier_id: string | null;
  check_number: string;
  bank_name: string | null;
  agency: string | null;
  account: string | null;
  amount: number;
  issue_date: string | null;
  due_date: string;
  compensation_date: string | null;
  status: 'pending' | 'compensated' | 'returned' | 'cancelled';
  notes: string | null;
  created_by: string;
  created_at: string;
}

// Categories
export function useFinancialCategories() {
  return useQuery({
    queryKey: ['financial_categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as FinancialCategory[];
    },
  });
}

// Bank Accounts
export function useBankAccounts() {
  return useQuery({
    queryKey: ['bank_accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as BankAccount[];
    },
  });
}

// Financial Transactions
export function useFinancialTransactions(filters?: { 
  type?: 'payable' | 'receivable';
  status?: string;
  start_date?: string;
  end_date?: string;
}) {
  return useQuery({
    queryKey: ['financial_transactions', filters],
    queryFn: async () => {
      let query = supabase
        .from('financial_transactions')
        .select(`
          *,
          category:financial_categories(name, color),
          customer:customers(name),
          supplier:suppliers(name)
        `)
        .order('due_date', { ascending: true });
      
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.start_date) {
        query = query.gte('due_date', filters.start_date);
      }
      if (filters?.end_date) {
        query = query.lte('due_date', filters.end_date);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as FinancialTransaction[];
    },
  });
}

// Checks
export function useChecks(filters?: { type?: 'received' | 'issued'; status?: string }) {
  return useQuery({
    queryKey: ['checks', filters],
    queryFn: async () => {
      let query = supabase
        .from('checks')
        .select(`
          *,
          customer:customers(name),
          supplier:suppliers(name)
        `)
        .order('due_date', { ascending: true });
      
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Check[];
    },
  });
}

export function useFinancialMutations() {
  const queryClient = useQueryClient();

  // Bank Accounts
  const createBankAccount = useMutation({
    mutationFn: async (account: Omit<BankAccount, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('bank_accounts')
        .insert({ ...account, current_balance: account.initial_balance })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank_accounts'] });
      toast.success('Conta bancária criada!');
    },
    onError: () => {
      toast.error('Erro ao criar conta bancária');
    },
  });

  // Financial Transactions
  const createTransaction = useMutation({
    mutationFn: async (transaction: Omit<FinancialTransaction, 'id' | 'number' | 'created_at' | 'updated_at' | 'category' | 'customer' | 'supplier'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('financial_transactions')
        .insert({ ...transaction, created_by: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial_transactions'] });
      toast.success('Lançamento criado!');
    },
    onError: () => {
      toast.error('Erro ao criar lançamento');
    },
  });

  const updateTransaction = useMutation({
    mutationFn: async ({ id, ...transaction }: Partial<FinancialTransaction> & { id: string }) => {
      const { data, error } = await supabase
        .from('financial_transactions')
        .update(transaction)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial_transactions'] });
      toast.success('Lançamento atualizado!');
    },
    onError: () => {
      toast.error('Erro ao atualizar lançamento');
    },
  });

  const payTransaction = useMutation({
    mutationFn: async ({ id, paid_amount, bank_account_id }: { id: string; paid_amount: number; bank_account_id?: string }) => {
      const { data: transaction } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('id', id)
        .single();

      if (!transaction) throw new Error('Lançamento não encontrado');

      const newPaidAmount = (transaction.paid_amount || 0) + paid_amount;
      const status = newPaidAmount >= transaction.amount ? 'paid' : 'partial';

      const { data, error } = await supabase
        .from('financial_transactions')
        .update({
          paid_amount: newPaidAmount,
          paid_date: status === 'paid' ? new Date().toISOString() : null,
          status,
          bank_account_id
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;

      // Update bank account balance if specified
      if (bank_account_id) {
        const { data: account } = await supabase
          .from('bank_accounts')
          .select('current_balance')
          .eq('id', bank_account_id)
          .single();

        if (account) {
          const newBalance = transaction.type === 'receivable' 
            ? account.current_balance + paid_amount 
            : account.current_balance - paid_amount;

          await supabase
            .from('bank_accounts')
            .update({ current_balance: newBalance })
            .eq('id', bank_account_id);
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['bank_accounts'] });
      toast.success('Pagamento registrado!');
    },
    onError: () => {
      toast.error('Erro ao registrar pagamento');
    },
  });

  // Checks
  const createCheck = useMutation({
    mutationFn: async (check: Omit<Check, 'id' | 'created_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('checks')
        .insert({ ...check, created_by: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checks'] });
      toast.success('Cheque registrado!');
    },
    onError: () => {
      toast.error('Erro ao registrar cheque');
    },
  });

  const updateCheck = useMutation({
    mutationFn: async ({ id, ...check }: Partial<Check> & { id: string }) => {
      const { data, error } = await supabase
        .from('checks')
        .update(check)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checks'] });
      toast.success('Cheque atualizado!');
    },
    onError: () => {
      toast.error('Erro ao atualizar cheque');
    },
  });

  return { 
    createBankAccount, 
    createTransaction, 
    updateTransaction, 
    payTransaction,
    createCheck,
    updateCheck
  };
}
