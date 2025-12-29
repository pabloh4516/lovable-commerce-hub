import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Quote {
  id: string;
  number: number;
  customer_id: string | null;
  seller_id: string;
  store_id: string | null;
  subtotal: number;
  discount: number;
  discount_type: string;
  total: number;
  status: 'pending' | 'approved' | 'converted' | 'cancelled' | 'expired';
  valid_until: string | null;
  notes: string | null;
  converted_sale_id: string | null;
  created_at: string;
  updated_at: string;
  customer?: { name: string; phone: string | null };
  seller?: { name: string };
}

export interface QuoteItem {
  id: string;
  quote_id: string;
  product_id: string;
  variation_id: string | null;
  quantity: number;
  unit_price: number;
  discount: number;
  discount_type: string;
  subtotal: number;
  created_at: string;
  product?: { name: string; code: string };
}

export function useQuotes(filters?: { status?: string }) {
  return useQuery({
    queryKey: ['quotes', filters],
    queryFn: async () => {
      let query = supabase
        .from('quotes')
        .select(`
          *,
          customer:customers(name, phone)
        `)
        .order('created_at', { ascending: false });
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as unknown as Quote[];
    },
  });
}

export function useQuoteItems(quoteId: string) {
  return useQuery({
    queryKey: ['quote_items', quoteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quote_items')
        .select(`
          *,
          product:products(name, code)
        `)
        .eq('quote_id', quoteId)
        .order('created_at');
      
      if (error) throw error;
      return data as QuoteItem[];
    },
    enabled: !!quoteId,
  });
}

export function useQuoteMutations() {
  const queryClient = useQueryClient();

  const createQuote = useMutation({
    mutationFn: async (quote: Omit<Quote, 'id' | 'number' | 'created_at' | 'updated_at' | 'customer' | 'seller'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('quotes')
        .insert({ ...quote, seller_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('Orçamento criado!');
    },
    onError: () => {
      toast.error('Erro ao criar orçamento');
    },
  });

  const updateQuote = useMutation({
    mutationFn: async ({ id, ...quote }: Partial<Quote> & { id: string }) => {
      const { data, error } = await supabase
        .from('quotes')
        .update(quote)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('Orçamento atualizado!');
    },
    onError: () => {
      toast.error('Erro ao atualizar orçamento');
    },
  });

  const addQuoteItem = useMutation({
    mutationFn: async (item: Omit<QuoteItem, 'id' | 'created_at' | 'product'>) => {
      const { data, error } = await supabase
        .from('quote_items')
        .insert(item)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quote_items', variables.quote_id] });
    },
    onError: () => {
      toast.error('Erro ao adicionar item');
    },
  });

  const removeQuoteItem = useMutation({
    mutationFn: async ({ id, quote_id }: { id: string; quote_id: string }) => {
      const { error } = await supabase
        .from('quote_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quote_items', variables.quote_id] });
    },
    onError: () => {
      toast.error('Erro ao remover item');
    },
  });

  const convertToSale = useMutation({
    mutationFn: async (quoteId: string) => {
      // Get quote with items
      const { data: quote } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', quoteId)
        .single();

      if (!quote) throw new Error('Orçamento não encontrado');

      // Update quote status
      const { error } = await supabase
        .from('quotes')
        .update({ status: 'converted' })
        .eq('id', quoteId);

      if (error) throw error;

      return quote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('Orçamento convertido em venda!');
    },
    onError: () => {
      toast.error('Erro ao converter orçamento');
    },
  });

  return { createQuote, updateQuote, addQuoteItem, removeQuoteItem, convertToSale };
}
