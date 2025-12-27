import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BarChart3, DollarSign, TrendingUp, Package, Loader2 } from 'lucide-react';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Relatórios</h1>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="startDate" className="text-sm whitespace-nowrap">De:</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-40"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="endDate" className="text-sm whitespace-nowrap">Até:</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-40"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales}</div>
            <p className="text-xs text-muted-foreground">vendas no período</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalRevenue.toFixed(2).replace('.', ',')}
            </div>
            <p className="text-xs text-muted-foreground">total no período</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {averageTicket.toFixed(2).replace('.', ',')}
            </div>
            <p className="text-xs text-muted-foreground">por venda</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Produtos Vendidos</CardTitle>
            <Package className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {topProducts?.reduce((sum, p) => sum + p.quantity, 0).toFixed(0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">unidades</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payments">Por Forma de Pagamento</TabsTrigger>
          <TabsTrigger value="products">Produtos Mais Vendidos</TabsTrigger>
        </TabsList>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Vendas por Forma de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSales ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Forma de Pagamento</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(paymentTotals).map(([method, total]) => (
                      <TableRow key={method}>
                        <TableCell>{paymentMethodNames[method] || method}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          R$ {total.toFixed(2).replace('.', ',')}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {totalRevenue > 0 ? ((total / totalRevenue) * 100).toFixed(1) : 0}%
                        </TableCell>
                      </TableRow>
                    ))}
                    {Object.keys(paymentTotals).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                          Nenhuma venda no período
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Produtos Mais Vendidos</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingProducts ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-right">Quantidade</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topProducts?.map((product, index) => (
                      <TableRow key={product.code}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-mono">{product.code}</TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {product.quantity.toFixed(product.quantity % 1 !== 0 ? 3 : 0)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          R$ {product.total.toFixed(2).replace('.', ',')}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!topProducts || topProducts.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          Nenhuma venda no período
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
