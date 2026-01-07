import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CartItem, Payment } from '@/types/pos';

interface CreateSaleParams {
  registerId: string;
  shiftId?: string;
  sellerId?: string;
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
          seller:profiles!sales_seller_id_fkey(name, code),
          sale_items(*),
          payments(*)
        `)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) {
        // Fallback without seller join if relationship doesn't exist
        const { data: salesOnly, error: salesError } = await supabase
          .from('sales')
          .select(`
            *,
            customer:customers(name, cpf),
            sale_items(*),
            payments(*)
          `)
          .order('created_at', { ascending: false })
          .limit(100);
        
        if (salesError) throw salesError;
        return salesOnly;
      }
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

      // Create sale with seller_id and shift_id
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          register_id: params.registerId,
          shift_id: params.shiftId || null,
          seller_id: params.sellerId || null,
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

      // Calculate payment amounts by method
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

      // Update register totals
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

      // Update shift totals if shift exists
      if (params.shiftId) {
        const { data: shift } = await supabase
          .from('register_shifts')
          .select('*')
          .eq('id', params.shiftId)
          .single();

        if (shift) {
          await supabase
            .from('register_shifts')
            .update({
              sales_count: (shift.sales_count || 0) + 1,
              sales_total: (shift.sales_total || 0) + params.total,
              cash_total: (shift.cash_total || 0) + cashAmount,
              pix_total: (shift.pix_total || 0) + pixAmount,
              credit_total: (shift.credit_total || 0) + creditAmount,
              debit_total: (shift.debit_total || 0) + debitAmount,
              fiado_total: (shift.fiado_total || 0) + fiadoAmount,
            })
            .eq('id', params.shiftId);
        }
      }

      // Create commission if seller exists
      if (params.sellerId) {
        const { data: sellerProfile } = await supabase
          .from('profiles')
          .select('commission_percent')
          .eq('user_id', params.sellerId)
          .maybeSingle();

        const commissionPercent = sellerProfile?.commission_percent || 0;
        if (commissionPercent > 0) {
          const commissionAmount = (params.total * commissionPercent) / 100;
          await supabase
            .from('commissions')
            .insert({
              seller_id: params.sellerId,
              sale_id: sale.id,
              sale_total: params.total,
              commission_percent: commissionPercent,
              commission_amount: commissionAmount,
              status: 'pending',
            });
        }
      }

      return sale;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['cash_registers'] });
      queryClient.invalidateQueries({ queryKey: ['active_shift'] });
      queryClient.invalidateQueries({ queryKey: ['seller_commissions'] });
      queryClient.invalidateQueries({ queryKey: ['pending_commissions'] });
    },
    onError: (error) => {
      console.error('Error creating sale:', error);
      toast.error('Erro ao finalizar venda');
    },
  });

  return { createSale };
}
