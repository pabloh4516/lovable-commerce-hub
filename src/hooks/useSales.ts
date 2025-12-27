import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CartItem, Payment } from '@/types/pos';

interface CreateSaleParams {
  registerId: string;
  customerId?: string;
  items: CartItem[];
  payments: Payment[];
  subtotal: number;
  discount: number;
  discountType: 'percent' | 'value';
  total: number;
  isFiado?: boolean;
}

export function useSales() {
  return useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          customer:customers(name, cpf),
          sale_items(*),
          payments(*)
        `)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    },
  });
}

export function useSaleMutations() {
  const queryClient = useQueryClient();

  const createSale = useMutation({
    mutationFn: async (params: CreateSaleParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Create sale
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          register_id: params.registerId,
          customer_id: params.customerId || null,
          operator_id: user.id,
          subtotal: params.subtotal,
          discount: params.discount,
          discount_type: params.discountType,
          total: params.total,
          status: 'completed',
          is_fiado: params.isFiado || false,
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Create sale items
      const saleItems = params.items.map(item => ({
        sale_id: sale.id,
        product_id: item.product.id,
        quantity: item.quantity,
        weight: item.weight || null,
        unit_price: item.product.price,
        discount: item.discount,
        discount_type: item.discountType,
        subtotal: item.subtotal,
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) throw itemsError;

      // Create payments
      const paymentRecords = params.payments.map(payment => ({
        sale_id: sale.id,
        method: payment.method,
        amount: payment.amount,
      }));

      const { error: paymentsError } = await supabase
        .from('payments')
        .insert(paymentRecords);

      if (paymentsError) throw paymentsError;

      // Update stock for each product
      for (const item of params.items) {
        const quantityToDeduct = item.weight || item.quantity;
        const { error: stockError } = await supabase
          .from('products')
          .update({
            stock: item.product.stock - quantityToDeduct,
          })
          .eq('id', item.product.id);

        if (stockError) console.error('Error updating stock:', stockError);
      }

      // Update register totals
      const cashAmount = params.payments
        .filter(p => p.method === 'cash')
        .reduce((sum, p) => sum + p.amount, 0);
      const pixAmount = params.payments
        .filter(p => p.method === 'pix')
        .reduce((sum, p) => sum + p.amount, 0);
      const creditAmount = params.payments
        .filter(p => p.method === 'credit')
        .reduce((sum, p) => sum + p.amount, 0);
      const debitAmount = params.payments
        .filter(p => p.method === 'debit')
        .reduce((sum, p) => sum + p.amount, 0);
      const fiadoAmount = params.payments
        .filter(p => p.method === 'fiado')
        .reduce((sum, p) => sum + p.amount, 0);

      // Get current register values
      const { data: register } = await supabase
        .from('cash_registers')
        .select('*')
        .eq('id', params.registerId)
        .single();

      if (register) {
        await supabase
          .from('cash_registers')
          .update({
            total_sales: (register.total_sales || 0) + params.total,
            total_cash: (register.total_cash || 0) + cashAmount,
            total_pix: (register.total_pix || 0) + pixAmount,
            total_credit: (register.total_credit || 0) + creditAmount,
            total_debit: (register.total_debit || 0) + debitAmount,
            total_fiado: (register.total_fiado || 0) + fiadoAmount,
          })
          .eq('id', params.registerId);
      }

      return sale;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['cash_registers'] });
    },
    onError: (error) => {
      console.error('Error creating sale:', error);
      toast.error('Erro ao finalizar venda');
    },
  });

  return { createSale };
}
