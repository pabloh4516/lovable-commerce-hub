import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BarChart3, DollarSign, TrendingUp, Package, Loader2, Calendar, Download } from 'lucide-react';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ModernPageHeader, ModernStatCard, ModernCard, ModernEmptyState } from './common';

export function ReportsPage() {
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const { data: salesData, isLoading: loadingSales } = useQuery({
    queryKey: ['sales_report', startDate, endDate],
    queryFn: async () => {
      const start = startOfDay(new Date(startDate)).toISOString();
      const end = endOfDay(new Date(endDate)).toISOString();

      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          payments(method, amount)
        `)
        .eq('status', 'completed')
        .gte('created_at', start)
        .lte('created_at', end);

      if (error) throw error;
      return data;
    },
  });

  const { data: topProducts, isLoading: loadingProducts } = useQuery({
    queryKey: ['top_products', startDate, endDate],
    queryFn: async () => {
      const start = startOfDay(new Date(startDate)).toISOString();
      const end = endOfDay(new Date(endDate)).toISOString();

      const { data, error } = await supabase
        .from('sale_items')
        .select(`
          product_id,
          quantity,
          subtotal,
          products(name, code)
        `)
        .gte('created_at', start)
        .lte('created_at', end);

      if (error) throw error;

      // Aggregate by product
      const productMap = new Map<string, { name: string; code: string; quantity: number; total: number }>();
      
      data?.forEach((item: any) => {
        const productId = item.product_id;
        const existing = productMap.get(productId);
        
        if (existing) {
          existing.quantity += Number(item.quantity);
          existing.total += Number(item.subtotal);
        } else {
          productMap.set(productId, {
            name: item.products?.name || 'Produto',
            code: item.products?.code || '-',
            quantity: Number(item.quantity),
            total: Number(item.subtotal),
          });
        }
      });

      return Array.from(productMap.values())
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);
    },
  });

  // Calculate totals
  const totalSales = salesData?.length || 0;
  const totalRevenue = salesData?.reduce((sum, sale) => sum + Number(sale.total), 0) || 0;
  const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

  const paymentTotals = salesData?.reduce((acc, sale) => {
    sale.payments?.forEach((payment: any) => {
      acc[payment.method] = (acc[payment.method] || 0) + Number(payment.amount);
    });
    return acc;
  }, {} as Record<string, number>) || {};

  const paymentMethodNames: Record<string, string> = {
    cash: 'Dinheiro',
    pix: 'PIX',
    credit: 'Crédito',
    debit: 'Débito',
    fiado: 'Fiado',
  };

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in h-full overflow-auto">
      <ModernPageHeader
        title="Relatórios"
        subtitle="Análise de vendas e desempenho"
        icon={BarChart3}
        actions={
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        }
      />

      {/* Date Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/30 rounded-xl border border-border/50">
        <Calendar className="h-5 w-5 text-muted-foreground" />
        <div className="flex items-center gap-2">
          <Label htmlFor="startDate" className="text-sm whitespace-nowrap text-muted-foreground">De:</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="endDate" className="text-sm whitespace-nowrap text-muted-foreground">Até:</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-40"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ModernStatCard
          title="Total de Vendas"
          value={totalSales}
          icon={BarChart3}
          variant="blue"
        />
        <ModernStatCard
          title="Faturamento"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          variant="green"
        />
        <ModernStatCard
          title="Ticket Médio"
          value={formatCurrency(averageTicket)}
          icon={TrendingUp}
          variant="purple"
        />
        <ModernStatCard
          title="Produtos Vendidos"
          value={topProducts?.reduce((sum, p) => sum + p.quantity, 0).toFixed(0) || '0'}
          icon={Package}
          variant="amber"
        />
      </div>

      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="payments">Por Forma de Pagamento</TabsTrigger>
          <TabsTrigger value="products">Produtos Mais Vendidos</TabsTrigger>
        </TabsList>

        <TabsContent value="payments">
          <ModernCard noPadding>
            <div className="p-4 border-b border-border/50">
              <h3 className="font-semibold text-foreground">Vendas por Forma de Pagamento</h3>
            </div>
            {loadingSales ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left p-4 font-medium text-muted-foreground text-sm">Forma de Pagamento</th>
                      <th className="text-right p-4 font-medium text-muted-foreground text-sm">Total</th>
                      <th className="text-right p-4 font-medium text-muted-foreground text-sm">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(paymentTotals).map(([method, total], index) => (
                      <tr 
                        key={method} 
                        className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <td className="p-4">
                          <Badge variant="secondary">{paymentMethodNames[method] || method}</Badge>
                        </td>
                        <td className="p-4 text-right tabular-nums font-medium">
                          {formatCurrency(total)}
                        </td>
                        <td className="p-4 text-right tabular-nums text-muted-foreground">
                          {totalRevenue > 0 ? ((total / totalRevenue) * 100).toFixed(1) : 0}%
                        </td>
                      </tr>
                    ))}
                    {Object.keys(paymentTotals).length === 0 && (
                      <tr>
                        <td colSpan={3}>
                          <ModernEmptyState
                            icon={DollarSign}
                            title="Nenhuma venda no período"
                          />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </ModernCard>
        </TabsContent>

        <TabsContent value="products">
          <ModernCard noPadding>
            <div className="p-4 border-b border-border/50">
              <h3 className="font-semibold text-foreground">Top 10 Produtos Mais Vendidos</h3>
            </div>
            {loadingProducts ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left p-4 font-medium text-muted-foreground text-sm">#</th>
                      <th className="text-left p-4 font-medium text-muted-foreground text-sm">Código</th>
                      <th className="text-left p-4 font-medium text-muted-foreground text-sm">Produto</th>
                      <th className="text-right p-4 font-medium text-muted-foreground text-sm">Quantidade</th>
                      <th className="text-right p-4 font-medium text-muted-foreground text-sm">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts?.map((product, index) => (
                      <tr 
                        key={product.code} 
                        className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <td className="p-4">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center">
                            {index + 1}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-sm text-muted-foreground">{product.code}</td>
                        <td className="p-4 font-medium">{product.name}</td>
                        <td className="p-4 text-right tabular-nums">
                          {product.quantity.toFixed(product.quantity % 1 !== 0 ? 3 : 0)}
                        </td>
                        <td className="p-4 text-right tabular-nums font-medium">
                          {formatCurrency(product.total)}
                        </td>
                      </tr>
                    ))}
                    {(!topProducts || topProducts.length === 0) && (
                      <tr>
                        <td colSpan={5}>
                          <ModernEmptyState
                            icon={Package}
                            title="Nenhuma venda no período"
                          />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </ModernCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
