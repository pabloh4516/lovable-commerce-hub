import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import { useCurrentStore } from './useStores';
import { useAudit } from './useAuditLog';

export type StockMovementType =
  | 'entrada'
  | 'saida'
  | 'ajuste'
  | 'transferencia_entrada'
  | 'transferencia_saida'
  | 'perda'
  | 'venda'
  | 'devolucao'
  | 'inventario';

export interface StockMovement {
  id: string;
  store_id: string;
  product_id: string;
  type: StockMovementType;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  unit_cost?: number;
  total_cost?: number;
  reason?: string;
  reference_type?: string;
  reference_id?: string;
  batch_number?: string;
  expiry_date?: string;
  operator_id: string;
  supervisor_id?: string;
  notes?: string;
  created_at: string;
}

export interface StockTransfer {
  id: string;
  number: number;
  from_store_id: string;
  to_store_id: string;
  status: 'pending' | 'approved' | 'in_transit' | 'received' | 'partial' | 'cancelled';
  requested_at: string;
  approved_at?: string;
  approved_by?: string;
  shipped_at?: string;
  shipped_by?: string;
  received_at?: string;
  received_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface StockTransferItem {
  id: string;
  transfer_id: string;
  product_id: string;
  requested_quantity: number;
  shipped_quantity?: number;
  received_quantity?: number;
  notes?: string;
}

export function useStockMovements(filters?: {
  storeId?: string;
  productId?: string;
  type?: StockMovementType;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}) {
  const { data: currentStore } = useCurrentStore();

  return useQuery({
    queryKey: ['stock-movements', filters, currentStore?.id],
    queryFn: async () => {
      let query = supabase
        .from('stock_movements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(filters?.limit || 100);

      const storeId = filters?.storeId || currentStore?.id;
      if (storeId) {
        query = query.eq('store_id', storeId);
      }
      if (filters?.productId) {
        query = query.eq('product_id', filters.productId);
      }
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString());
      }
      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as StockMovement[];
    },
    enabled: !!currentStore?.id || !!filters?.storeId,
  });
}

export function useStockTransfers(filters?: {
  storeId?: string;
  status?: StockTransfer['status'];
  limit?: number;
}) {
  const { data: currentStore } = useCurrentStore();

  return useQuery({
    queryKey: ['stock-transfers', filters, currentStore?.id],
    queryFn: async () => {
      let query = supabase
        .from('stock_transfers')
        .select(`
          *,
          items:stock_transfer_items(*)
        `)
        .order('created_at', { ascending: false })
        .limit(filters?.limit || 50);

      const storeId = filters?.storeId || currentStore?.id;
      if (storeId) {
        query = query.or(`from_store_id.eq.${storeId},to_store_id.eq.${storeId}`);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as (StockTransfer & { items: StockTransferItem[] })[];
    },
    enabled: !!currentStore?.id || !!filters?.storeId,
  });
}

export function useStockMutations() {
  const { user } = useAuth();
  const { data: currentStore } = useCurrentStore();
  const queryClient = useQueryClient();
  const { log } = useAudit();

  const createMovement = useMutation({
    mutationFn: async ({
      productId,
      type,
      quantity,
      reason,
      unitCost,
      batchNumber,
      expiryDate,
      notes,
      supervisorId,
      storeId,
    }: {
      productId: string;
      type: StockMovementType;
      quantity: number;
      reason?: string;
      unitCost?: number;
      batchNumber?: string;
      expiryDate?: string;
      notes?: string;
      supervisorId?: string;
      storeId?: string;
    }) => {
      const targetStoreId = storeId || currentStore?.id;
      if (!targetStoreId) throw new Error('Nenhuma loja selecionada');
      if (!user?.id) throw new Error('Usuário não autenticado');

      // Get current stock from store_products
      const { data: storeProduct, error: spError } = await supabase
        .from('store_products')
        .select('stock')
        .eq('store_id', targetStoreId)
        .eq('product_id', productId)
        .maybeSingle();

      const previousStock = storeProduct?.stock || 0;
      
      // Calculate new stock based on movement type
      let stockChange = quantity;
      if (['saida', 'perda', 'venda', 'transferencia_saida'].includes(type)) {
        stockChange = -quantity;
      }
      const newStock = previousStock + stockChange;

      // Create movement record
      const { data: movement, error: movError } = await supabase
        .from('stock_movements')
        .insert({
          store_id: targetStoreId,
          product_id: productId,
          type,
          quantity,
          previous_stock: previousStock,
          new_stock: newStock,
          unit_cost: unitCost,
          total_cost: unitCost ? unitCost * quantity : undefined,
          reason,
          batch_number: batchNumber,
          expiry_date: expiryDate,
          operator_id: user.id,
          supervisor_id: supervisorId,
          notes,
        })
        .select()
        .single();

      if (movError) throw movError;

      // Update stock in store_products
      if (storeProduct) {
        await supabase
          .from('store_products')
          .update({ stock: newStock })
          .eq('store_id', targetStoreId)
          .eq('product_id', productId);
      } else {
        // Create store_product if doesn't exist
        const { data: product } = await supabase
          .from('products')
          .select('price, cost')
          .eq('id', productId)
          .single();

        await supabase.from('store_products').insert({
          store_id: targetStoreId,
          product_id: productId,
          stock: newStock,
          price: product?.price || 0,
          cost: product?.cost || 0,
        });
      }

      // Also update main products table for backward compatibility
      await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', productId);

      return movement;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['store-products'] });
      
      log('stock.adjust', 'stock_movement', {
        entityId: data.id,
        newValues: {
          type: variables.type,
          quantity: variables.quantity,
          reason: variables.reason,
        },
      });

      const typeLabels: Record<StockMovementType, string> = {
        entrada: 'Entrada',
        saida: 'Saída',
        ajuste: 'Ajuste',
        transferencia_entrada: 'Transferência (entrada)',
        transferencia_saida: 'Transferência (saída)',
        perda: 'Perda',
        venda: 'Venda',
        devolucao: 'Devolução',
        inventario: 'Inventário',
      };

      toast.success(`${typeLabels[variables.type]} registrada com sucesso!`);
    },
    onError: (error: Error) => {
      toast.error('Erro ao registrar movimentação: ' + error.message);
    },
  });

  const createTransfer = useMutation({
    mutationFn: async ({
      fromStoreId,
      toStoreId,
      items,
      notes,
    }: {
      fromStoreId: string;
      toStoreId: string;
      items: { productId: string; quantity: number }[];
      notes?: string;
    }) => {
      const { data: transfer, error: transferError } = await supabase
        .from('stock_transfers')
        .insert({
          from_store_id: fromStoreId,
          to_store_id: toStoreId,
          status: 'pending',
          notes,
        })
        .select()
        .single();

      if (transferError) throw transferError;

      const transferItems = items.map((item) => ({
        transfer_id: transfer.id,
        product_id: item.productId,
        requested_quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('stock_transfer_items')
        .insert(transferItems);

      if (itemsError) throw itemsError;

      return transfer;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['stock-transfers'] });
      
      log('stock.transfer', 'stock_transfer', {
        entityId: data.id,
        newValues: { status: 'pending' },
      });

      toast.success('Transferência criada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao criar transferência: ' + error.message);
    },
  });

  const updateTransferStatus = useMutation({
    mutationFn: async ({
      transferId,
      status,
      receivedItems,
    }: {
      transferId: string;
      status: StockTransfer['status'];
      receivedItems?: { itemId: string; receivedQuantity: number }[];
    }) => {
      const updates: Partial<StockTransfer> = { status };
      
      if (status === 'approved') {
        updates.approved_at = new Date().toISOString();
        updates.approved_by = user?.id;
      } else if (status === 'in_transit') {
        updates.shipped_at = new Date().toISOString();
        updates.shipped_by = user?.id;
      } else if (status === 'received' || status === 'partial') {
        updates.received_at = new Date().toISOString();
        updates.received_by = user?.id;
      }

      const { data, error } = await supabase
        .from('stock_transfers')
        .update(updates)
        .eq('id', transferId)
        .select()
        .single();

      if (error) throw error;

      // Update received quantities if provided
      if (receivedItems?.length) {
        for (const item of receivedItems) {
          await supabase
            .from('stock_transfer_items')
            .update({ received_quantity: item.receivedQuantity })
            .eq('id', item.itemId);
        }
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['stock-transfers'] });
      toast.success('Status da transferência atualizado!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar transferência: ' + error.message);
    },
  });

  return { createMovement, createTransfer, updateTransferStatus };
}
