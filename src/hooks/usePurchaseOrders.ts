import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PurchaseOrder {
  id: string;
  number: number;
  supplier_id: string;
  store_id: string | null;
  operator_id: string;
  subtotal: number;
  discount: number;
  shipping: number;
  other_costs: number;
  total: number;
  status: 'pending' | 'approved' | 'partial' | 'received' | 'cancelled';
  invoice_number: string | null;
  invoice_key: string | null;
  invoice_date: string | null;
  expected_date: string | null;
  received_date: string | null;
  payment_method: string | null;
  payment_condition: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  supplier?: { name: string; fantasy_name: string | null };
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  product_id: string;
  variation_id: string | null;
  quantity: number;
  received_quantity: number;
  unit_cost: number;
  discount: number;
  subtotal: number;
  batch_number: string | null;
  expiry_date: string | null;
  created_at: string;
  product?: { name: string; code: string };
}

export function usePurchaseOrders(filters?: { status?: string; supplier_id?: string }) {
  return useQuery({
    queryKey: ['purchase_orders', filters],
    queryFn: async () => {
      let query = supabase
        .from('purchase_orders')
        .select(`
          *,
          supplier:suppliers(name, fantasy_name)
        `)
        .order('created_at', { ascending: false });
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.supplier_id) {
        query = query.eq('supplier_id', filters.supplier_id);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as PurchaseOrder[];
    },
  });
}

export function usePurchaseOrderItems(orderId: string) {
  return useQuery({
    queryKey: ['purchase_order_items', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_order_items')
        .select(`
          *,
          product:products(name, code)
        `)
        .eq('purchase_order_id', orderId)
        .order('created_at');
      
      if (error) throw error;
      return data as PurchaseOrderItem[];
    },
    enabled: !!orderId,
  });
}

export function usePurchaseOrderMutations() {
  const queryClient = useQueryClient();

  const createPurchaseOrder = useMutation({
    mutationFn: async (order: Omit<PurchaseOrder, 'id' | 'number' | 'created_at' | 'updated_at' | 'supplier'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('purchase_orders')
        .insert({ ...order, operator_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase_orders'] });
      toast.success('Pedido de compra criado!');
    },
    onError: () => {
      toast.error('Erro ao criar pedido de compra');
    },
  });

  const updatePurchaseOrder = useMutation({
    mutationFn: async ({ id, ...order }: Partial<PurchaseOrder> & { id: string }) => {
      const { data, error } = await supabase
        .from('purchase_orders')
        .update(order)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase_orders'] });
      toast.success('Pedido atualizado!');
    },
    onError: () => {
      toast.error('Erro ao atualizar pedido');
    },
  });

  const addPurchaseOrderItem = useMutation({
    mutationFn: async (item: Omit<PurchaseOrderItem, 'id' | 'created_at' | 'product'>) => {
      const { data, error } = await supabase
        .from('purchase_order_items')
        .insert(item)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['purchase_order_items', variables.purchase_order_id] });
    },
    onError: () => {
      toast.error('Erro ao adicionar item');
    },
  });

  const receivePurchaseOrder = useMutation({
    mutationFn: async ({ id, items }: { id: string; items: { id: string; received_quantity: number; batch_number?: string; expiry_date?: string }[] }) => {
      // Update each item's received quantity
      for (const item of items) {
        await supabase
          .from('purchase_order_items')
          .update({
            received_quantity: item.received_quantity,
            batch_number: item.batch_number,
            expiry_date: item.expiry_date
          })
          .eq('id', item.id);
      }

      // Check if all items are received
      const { data: orderItems } = await supabase
        .from('purchase_order_items')
        .select('quantity, received_quantity')
        .eq('purchase_order_id', id);

      const allReceived = orderItems?.every(i => i.received_quantity >= i.quantity);
      const anyReceived = orderItems?.some(i => i.received_quantity > 0);

      // Update order status
      const { error } = await supabase
        .from('purchase_orders')
        .update({
          status: allReceived ? 'received' : anyReceived ? 'partial' : 'approved',
          received_date: allReceived ? new Date().toISOString() : null
        })
        .eq('id', id);

      if (error) throw error;

      // Update product stock
      for (const item of items) {
        if (item.received_quantity > 0) {
          const { data: orderItem } = await supabase
            .from('purchase_order_items')
            .select('product_id')
            .eq('id', item.id)
            .single();

          if (orderItem) {
            const { data: product } = await supabase
              .from('products')
              .select('stock')
              .eq('id', orderItem.product_id)
              .single();

            if (product) {
              await supabase
                .from('products')
                .update({ stock: product.stock + item.received_quantity })
                .eq('id', orderItem.product_id);
            }
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase_orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase_order_items'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Recebimento registrado!');
    },
    onError: () => {
      toast.error('Erro ao registrar recebimento');
    },
  });

  return { createPurchaseOrder, updatePurchaseOrder, addPurchaseOrderItem, receivePurchaseOrder };
}
