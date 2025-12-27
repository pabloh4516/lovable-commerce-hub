import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCurrentStore } from './useStores';

export type PromotionType = 'percentage' | 'fixed' | 'buy_x_get_y' | 'combo' | 'progressive' | 'happy_hour';

export interface Promotion {
  id: string;
  code?: string;
  name: string;
  description?: string;
  type: PromotionType;
  value?: number;
  buy_quantity?: number;
  get_quantity?: number;
  min_quantity?: number;
  min_value?: number;
  max_discount?: number;
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  days_of_week?: number[];
  applies_to: string;
  is_cumulative: boolean;
  priority: number;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface PromotionProduct {
  id: string;
  promotion_id: string;
  product_id?: string;
  category_id?: string;
}

export interface AppliedPromotion {
  promotion: Promotion;
  discount: number;
  description: string;
}

export function usePromotions() {
  return useQuery({
    queryKey: ['promotions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('priority', { ascending: false });

      if (error) throw error;
      return data as Promotion[];
    },
  });
}

export function useActivePromotions() {
  const { data: currentStore } = useCurrentStore();

  return useQuery({
    queryKey: ['active-promotions', currentStore?.id],
    queryFn: async () => {
      const now = new Date().toISOString();
      
      let query = supabase
        .from('promotions')
        .select(`
          *,
          promotion_products(*),
          promotion_stores(store_id)
        `)
        .eq('is_active', true)
        .lte('start_date', now)
        .gte('end_date', now);

      const { data, error } = await query;
      if (error) throw error;

      // Filter by current store if available
      const promotions = data?.filter((promo: any) => {
        // If no store restriction, promotion is available everywhere
        if (!promo.promotion_stores?.length) return true;
        // If store restriction exists, check if current store is included
        if (currentStore?.id) {
          return promo.promotion_stores.some((ps: any) => ps.store_id === currentStore.id);
        }
        return true;
      });

      return promotions as (Promotion & { 
        promotion_products: PromotionProduct[];
        promotion_stores: { store_id: string }[];
      })[];
    },
    enabled: true,
  });
}

export function usePromotionCalculator() {
  const { data: activePromotions } = useActivePromotions();

  const calculateProductDiscount = (
    productId: string,
    categoryId: string | undefined,
    quantity: number,
    unitPrice: number
  ): AppliedPromotion | null => {
    if (!activePromotions?.length) return null;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinutes;
    const currentDayOfWeek = now.getDay();

    // Find applicable promotions for this product
    const applicablePromotions = activePromotions
      .filter((promo) => {
        // Check if promotion applies to this product
        const appliesToProduct = promo.promotion_products?.some(
          (pp) => pp.product_id === productId || pp.category_id === categoryId
        );
        
        // If no specific products defined, applies to all
        const appliesToAll = !promo.promotion_products?.length && promo.applies_to === 'all';

        if (!appliesToProduct && !appliesToAll) return false;

        // Check time restrictions (happy hour)
        if (promo.start_time && promo.end_time) {
          const [startH, startM] = promo.start_time.split(':').map(Number);
          const [endH, endM] = promo.end_time.split(':').map(Number);
          const startMinutes = startH * 60 + startM;
          const endMinutes = endH * 60 + endM;
          
          if (currentTimeMinutes < startMinutes || currentTimeMinutes > endMinutes) {
            return false;
          }
        }

        // Check day of week restrictions
        if (promo.days_of_week?.length) {
          if (!promo.days_of_week.includes(currentDayOfWeek)) {
            return false;
          }
        }

        // Check minimum quantity
        if (promo.min_quantity && quantity < promo.min_quantity) {
          return false;
        }

        return true;
      })
      .sort((a, b) => b.priority - a.priority);

    if (!applicablePromotions.length) return null;

    // Apply the highest priority promotion
    const promo = applicablePromotions[0];
    let discount = 0;
    let description = promo.name;

    const totalValue = quantity * unitPrice;

    switch (promo.type) {
      case 'percentage':
        discount = totalValue * ((promo.value || 0) / 100);
        description = `${promo.name} (-${promo.value}%)`;
        break;

      case 'fixed':
        discount = Math.min(promo.value || 0, totalValue);
        description = `${promo.name} (-R$ ${promo.value?.toFixed(2)})`;
        break;

      case 'buy_x_get_y':
        if (promo.buy_quantity && promo.get_quantity) {
          const sets = Math.floor(quantity / (promo.buy_quantity + promo.get_quantity));
          discount = sets * promo.get_quantity * unitPrice;
          description = `${promo.name} (Leve ${promo.buy_quantity + promo.get_quantity} Pague ${promo.buy_quantity})`;
        }
        break;

      case 'progressive':
        // Progressive discount based on quantity
        if (promo.min_quantity && quantity >= promo.min_quantity) {
          const progressiveRate = Math.min(
            (promo.value || 0) + (quantity - promo.min_quantity) * 2,
            promo.max_discount || 50
          );
          discount = totalValue * (progressiveRate / 100);
          description = `${promo.name} (-${progressiveRate.toFixed(0)}%)`;
        }
        break;

      case 'happy_hour':
        discount = totalValue * ((promo.value || 0) / 100);
        description = `🕐 ${promo.name} (-${promo.value}%)`;
        break;

      default:
        break;
    }

    // Apply max discount limit
    if (promo.max_discount && discount > promo.max_discount) {
      discount = promo.max_discount;
    }

    if (discount <= 0) return null;

    return {
      promotion: promo,
      discount: Math.round(discount * 100) / 100,
      description,
    };
  };

  return { calculateProductDiscount, activePromotions };
}

export function usePromotionMutations() {
  const queryClient = useQueryClient();

  const createPromotion = useMutation({
    mutationFn: async ({
      promotion,
      productIds,
      categoryIds,
      storeIds,
    }: {
      promotion: Partial<Promotion>;
      productIds?: string[];
      categoryIds?: string[];
      storeIds?: string[];
    }) => {
      const { data: promoData, error: promoError } = await supabase
        .from('promotions')
        .insert([{
          code: promotion.code,
          name: promotion.name!,
          description: promotion.description,
          type: promotion.type!,
          value: promotion.value,
          buy_quantity: promotion.buy_quantity,
          get_quantity: promotion.get_quantity,
          min_quantity: promotion.min_quantity,
          min_value: promotion.min_value,
          max_discount: promotion.max_discount,
          start_date: promotion.start_date!,
          end_date: promotion.end_date!,
          start_time: promotion.start_time,
          end_time: promotion.end_time,
          days_of_week: promotion.days_of_week,
          applies_to: promotion.applies_to ?? 'product',
          is_cumulative: promotion.is_cumulative ?? false,
          priority: promotion.priority ?? 0,
          is_active: promotion.is_active ?? true,
        }])
        .select()
        .single();

      if (promoError) throw promoError;

      // Add product/category associations
      if (productIds?.length || categoryIds?.length) {
        const items = [
          ...(productIds?.map((id) => ({ promotion_id: promoData.id, product_id: id })) || []),
          ...(categoryIds?.map((id) => ({ promotion_id: promoData.id, category_id: id })) || []),
        ];

        if (items.length) {
          const { error } = await supabase.from('promotion_products').insert(items);
          if (error) throw error;
        }
      }

      // Add store associations
      if (storeIds?.length) {
        const storeItems = storeIds.map((storeId) => ({
          promotion_id: promoData.id,
          store_id: storeId,
        }));

        const { error } = await supabase.from('promotion_stores').insert(storeItems);
        if (error) throw error;
      }

      return promoData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      queryClient.invalidateQueries({ queryKey: ['active-promotions'] });
      toast.success('Promoção criada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao criar promoção: ' + error.message);
    },
  });

  const updatePromotion = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Promotion> & { id: string }) => {
      const { data, error } = await supabase
        .from('promotions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      queryClient.invalidateQueries({ queryKey: ['active-promotions'] });
      toast.success('Promoção atualizada!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar promoção: ' + error.message);
    },
  });

  const deletePromotion = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('promotions')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      queryClient.invalidateQueries({ queryKey: ['active-promotions'] });
      toast.success('Promoção removida!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao remover promoção: ' + error.message);
    },
  });

  return { createPromotion, updatePromotion, deletePromotion };
}
