import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type ServiceOrderStatus = 
  | 'received' 
  | 'waiting_approval' 
  | 'approved' 
  | 'in_progress' 
  | 'waiting_parts' 
  | 'completed' 
  | 'delivered' 
  | 'cancelled';

export interface ServiceOrder {
  id: string;
  number: number;
  customer_id: string;
  store_id: string | null;
  technician_id: string | null;
  receptionist_id: string;
  equipment_type: string;
  equipment_brand: string | null;
  equipment_model: string | null;
  equipment_serial: string | null;
  equipment_color: string | null;
  equipment_accessories: string | null;
  equipment_condition: string | null;
  defect_reported: string;
  defect_found: string | null;
  solution: string | null;
  technical_report: string | null;
  status: ServiceOrderStatus;
  priority: string;
  estimated_value: number | null;
  final_value: number | null;
  parts_value: number;
  labor_value: number;
  discount: number;
  warranty_until: string | null;
  estimated_date: string | null;
  completed_date: string | null;
  delivered_date: string | null;
  internal_notes: string | null;
  customer_notes: string | null;
  checklist: Record<string, boolean> | null;
  images: string[] | null;
  created_at: string;
  updated_at: string;
  customer?: {
    name: string;
    phone: string | null;
    email: string | null;
  };
  technician?: {
    name: string;
  };
}

export interface ServiceOrderItem {
  id: string;
  service_order_id: string;
  product_id: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  discount: number;
  subtotal: number;
  type: 'part' | 'labor' | 'other';
  created_at: string;
}

export interface ServiceOrderPayment {
  id: string;
  service_order_id: string;
  payment_method_id: string | null;
  method: string;
  amount: number;
  installments: number;
  type: 'advance' | 'partial' | 'final';
  notes: string | null;
  operator_id: string;
  created_at: string;
}

export function useServiceOrders(filters?: { status?: ServiceOrderStatus; technician_id?: string }) {
  return useQuery({
    queryKey: ['service_orders', filters],
    queryFn: async () => {
      let query = supabase
        .from('service_orders')
        .select(`
          *,
          customer:customers(name, phone, email)
        `)
        .order('created_at', { ascending: false });
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.technician_id) {
        query = query.eq('technician_id', filters.technician_id);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as unknown as ServiceOrder[];
    },
  });
}

export function useServiceOrderItems(serviceOrderId: string) {
  return useQuery({
    queryKey: ['service_order_items', serviceOrderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_order_items')
        .select('*')
        .eq('service_order_id', serviceOrderId)
        .order('created_at');
      
      if (error) throw error;
      return data as ServiceOrderItem[];
    },
    enabled: !!serviceOrderId,
  });
}

export function useServiceOrderPayments(serviceOrderId: string) {
  return useQuery({
    queryKey: ['service_order_payments', serviceOrderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_order_payments')
        .select('*')
        .eq('service_order_id', serviceOrderId)
        .order('created_at');
      
      if (error) throw error;
      return data as ServiceOrderPayment[];
    },
    enabled: !!serviceOrderId,
  });
}

export function useServiceOrderMutations() {
  const queryClient = useQueryClient();

  const createServiceOrder = useMutation({
    mutationFn: async (order: Omit<ServiceOrder, 'id' | 'number' | 'created_at' | 'updated_at' | 'customer' | 'technician'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('service_orders')
        .insert({ ...order, receptionist_id: user.id })
        .select()
        .single();
      
      if (error) throw error;

      // Log history
      await supabase.from('service_order_history').insert({
        service_order_id: data.id,
        user_id: user.id,
        action: 'created',
        new_status: 'received',
        description: 'Ordem de serviço criada'
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service_orders'] });
      toast.success('OS criada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao criar OS');
    },
  });

  const updateServiceOrder = useMutation({
    mutationFn: async ({ id, ...order }: Partial<ServiceOrder> & { id: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Get current status
      const { data: current } = await supabase
        .from('service_orders')
        .select('status')
        .eq('id', id)
        .single();

      const { data, error } = await supabase
        .from('service_orders')
        .update(order)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;

      // Log status change
      if (order.status && current?.status !== order.status) {
        await supabase.from('service_order_history').insert({
          service_order_id: id,
          user_id: user.id,
          action: 'status_changed',
          old_status: current?.status,
          new_status: order.status,
          description: `Status alterado de ${current?.status} para ${order.status}`
        });
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service_orders'] });
      toast.success('OS atualizada!');
    },
    onError: () => {
      toast.error('Erro ao atualizar OS');
    },
  });

  const addServiceOrderItem = useMutation({
    mutationFn: async (item: Omit<ServiceOrderItem, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('service_order_items')
        .insert(item)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['service_order_items', variables.service_order_id] });
      toast.success('Item adicionado!');
    },
    onError: () => {
      toast.error('Erro ao adicionar item');
    },
  });

  const addServiceOrderPayment = useMutation({
    mutationFn: async (payment: Omit<ServiceOrderPayment, 'id' | 'created_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('service_order_payments')
        .insert({ ...payment, operator_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['service_order_payments', variables.service_order_id] });
      toast.success('Pagamento registrado!');
    },
    onError: () => {
      toast.error('Erro ao registrar pagamento');
    },
  });

  return { createServiceOrder, updateServiceOrder, addServiceOrderItem, addServiceOrderPayment };
}
