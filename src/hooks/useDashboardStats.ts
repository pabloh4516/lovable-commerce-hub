import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';
import { DashboardStats } from '@/types/pos';

export function useDashboardStats() {
  const today = new Date();
  const todayStart = startOfDay(today).toISOString();
  const todayEnd = endOfDay(today).toISOString();
  const yesterdayStart = startOfDay(subDays(today, 1)).toISOString();
  const yesterdayEnd = endOfDay(subDays(today, 1)).toISOString();

  // Fetch today's sales
  const { data: todaySales, isLoading: loadingTodaySales } = useQuery({
    queryKey: ['dashboard-today-sales', todayStart],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          id,
          total,
          subtotal,
          status,
          created_at,
          payments(method, amount),
          sale_items(quantity, weight)
        `)
        .eq('status', 'completed')
        .gte('created_at', todayStart)
        .lte('created_at', todayEnd);
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch yesterday's sales for comparison
  const { data: yesterdaySales } = useQuery({
    queryKey: ['dashboard-yesterday-sales', yesterdayStart],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select('id, total')
        .eq('status', 'completed')
        .gte('created_at', yesterdayStart)
        .lte('created_at', yesterdayEnd);
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch top products
  const { data: topProducts } = useQuery({
    queryKey: ['dashboard-top-products', todayStart],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sale_items')
        .select(`
          product_id,
          quantity,
          subtotal,
          products(name)
        `)
        .gte('created_at', todayStart)
        .lte('created_at', todayEnd);
      
      if (error) throw error;
      
      // Aggregate by product
      const productMap = new Map<string, { name: string; quantity: number; revenue: number }>();
      
      data?.forEach(item => {
        const productId = item.product_id;
        const productName = (item.products as any)?.name || 'Produto';
        const existing = productMap.get(productId);
        
        if (existing) {
          existing.quantity += Number(item.quantity);
          existing.revenue += Number(item.subtotal);
        } else {
          productMap.set(productId, {
            name: productName,
            quantity: Number(item.quantity),
            revenue: Number(item.subtotal),
          });
        }
      });
      
      return Array.from(productMap.entries())
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
    },
  });

  // Fetch hourly sales data for chart
  const { data: hourlySales } = useQuery({
    queryKey: ['dashboard-hourly-sales', todayStart],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select('created_at, total')
        .eq('status', 'completed')
        .gte('created_at', todayStart)
        .lte('created_at', todayEnd)
        .order('created_at');
      
      if (error) throw error;
      
      // Group by hour
      const hourlyMap = new Map<number, { sales: number; revenue: number }>();
      
      // Initialize all hours
      for (let h = 0; h < 24; h++) {
        hourlyMap.set(h, { sales: 0, revenue: 0 });
      }
      
      data?.forEach(sale => {
        const hour = new Date(sale.created_at).getHours();
        const existing = hourlyMap.get(hour)!;
        existing.sales += 1;
        existing.revenue += Number(sale.total);
      });
      
      return Array.from(hourlyMap.entries())
        .filter(([hour]) => hour >= 6 && hour <= 23) // Only show 6am to 11pm
        .map(([hour, data]) => ({
          hour: `${hour}h`,
          sales: data.sales,
          revenue: data.revenue,
        }));
    },
  });

  // Calculate stats
  const stats = useMemo((): DashboardStats => {
    const totalSalesCount = todaySales?.length || 0;
    const totalRevenue = todaySales?.reduce((sum, sale) => sum + Number(sale.total), 0) || 0;
    const averageTicket = totalSalesCount > 0 ? totalRevenue / totalSalesCount : 0;
    
    const yesterdayRevenue = yesterdaySales?.reduce((sum, sale) => sum + Number(sale.total), 0) || 0;
    const yesterdayCount = yesterdaySales?.length || 0;
    
    // Calculate products sold
    const productsSold = todaySales?.reduce((sum, sale) => {
      return sum + ((sale.sale_items as any[])?.reduce((itemSum, item) => {
        return itemSum + (Number(item.weight) || Number(item.quantity) || 0);
      }, 0) || 0);
    }, 0) || 0;

    // Calculate sales by payment method
    const paymentMethods: Record<string, number> = {
      cash: 0,
      pix: 0,
      credit: 0,
      debit: 0,
      fiado: 0,
    };
    
    todaySales?.forEach(sale => {
      (sale.payments as any[])?.forEach(payment => {
        if (payment.method in paymentMethods) {
          paymentMethods[payment.method] += Number(payment.amount);
        }
      });
    });

    // Calculate change percentages
    const revenueChange = yesterdayRevenue > 0 
      ? ((totalRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 
      : 0;
    const salesChange = yesterdayCount > 0 
      ? ((totalSalesCount - yesterdayCount) / yesterdayCount) * 100 
      : 0;

    return {
      todaySales: totalSalesCount,
      todayRevenue: totalRevenue,
      averageTicket,
      productsSold: Math.round(productsSold),
      revenueChange,
      salesChange,
      salesByPaymentMethod: paymentMethods,
      topProducts: topProducts?.map((p, index) => ({
        id: p.id,
        name: p.name,
        quantity: p.quantity,
        revenue: p.revenue,
        rank: index + 1,
      })) || [],
    };
  }, [todaySales, yesterdaySales, topProducts]);

  return {
    stats,
    hourlyData: hourlySales || [],
    isLoading: loadingTodaySales,
  };
}
