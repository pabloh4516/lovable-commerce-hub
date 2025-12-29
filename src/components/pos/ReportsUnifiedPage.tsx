import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  Package, 
  Loader2, 
  Users, 
  PieChart,
  Warehouse,
  FileText
} from 'lucide-react';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';
import { PageHeader, StatCard, DataCard } from '@/components/pos/common';
import { formatCurrency } from '@/lib/utils';

export function ReportsUnifiedPage() {
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
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-6 pb-0">
        <PageHeader 
          title="Relatórios"
          subtitle="Análise completa do seu negócio"
          icon={BarChart3}
          actions={
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="startDate" className="text-sm whitespace-nowrap">De:</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-36"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="endDate" className="text-sm whitespace-nowrap">Até:</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-36"
                />
              </div>
            </div>
          }
        />
      </div>

      <Tabs defaultValue="geral" className="flex-1 flex flex-col overflow-hidden p-6 pt-4">
        <TabsList className="w-full justify-start gap-1 h-auto flex-wrap bg-transparent p-0 mb-4">
          <TabsTrigger value="geral" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <BarChart3 className="w-4 h-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="vendas" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <TrendingUp className="w-4 h-4" />
            Vendas
          </TabsTrigger>
          <TabsTrigger value="produtos" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Package className="w-4 h-4" />
            Produtos
          </TabsTrigger>
          <TabsTrigger value="financeiro" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <DollarSign className="w-4 h-4" />
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="estoque" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Warehouse className="w-4 h-4" />
            Estoque
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          {/* Visão Geral */}
          <TabsContent value="geral" className="mt-0 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total de Vendas"
                value={totalSales.toString()}
                subtitle="vendas no período"
                icon={BarChart3}
              />
              <StatCard
                title="Faturamento"
                value={formatCurrency(totalRevenue)}
                subtitle="total no período"
                icon={DollarSign}
                variant="success"
              />
              <StatCard
                title="Ticket Médio"
                value={formatCurrency(averageTicket)}
                subtitle="por venda"
                icon={TrendingUp}
              />
              <StatCard
                title="Produtos Vendidos"
                value={(topProducts?.reduce((sum, p) => sum + p.quantity, 0) || 0).toFixed(0)}
                subtitle="unidades"
                icon={Package}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DataCard
                title="Vendas por Forma de Pagamento"
                icon={PieChart}
                isLoading={loadingSales}
              >
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
                          {formatCurrency(total)}
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
              </DataCard>

              <DataCard
                title="Top 10 Produtos"
                icon={Package}
                isLoading={loadingProducts}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-right">Qtd</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topProducts?.slice(0, 5).map((product, index) => (
                      <TableRow key={product.code}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{product.name}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {product.quantity.toFixed(0)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatCurrency(product.total)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!topProducts || topProducts.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          Nenhuma venda no período
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </DataCard>
            </div>
          </TabsContent>

          {/* Vendas */}
          <TabsContent value="vendas" className="mt-0 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Vendas Hoje" value="0" subtitle="vendas" icon={BarChart3} />
              <StatCard title="Vendas Esta Semana" value={totalSales.toString()} subtitle="vendas" icon={TrendingUp} />
              <StatCard title="Vendas Este Mês" value="0" subtitle="vendas" icon={BarChart3} />
              <StatCard title="Meta do Mês" value="0%" subtitle="atingido" icon={TrendingUp} />
            </div>
            
            <DataCard
              title="Histórico de Vendas"
              description="Vendas realizadas no período selecionado"
              icon={FileText}
              isLoading={loadingSales}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Itens</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesData?.slice(0, 10).map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-mono">{sale.number}</TableCell>
                      <TableCell>{format(new Date(sale.created_at), 'dd/MM/yyyy HH:mm')}</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell className="text-right tabular-nums font-medium">
                        {formatCurrency(Number(sale.total))}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!salesData || salesData.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        Nenhuma venda no período
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </DataCard>
          </TabsContent>

          {/* Produtos */}
          <TabsContent value="produtos" className="mt-0 space-y-6">
            <DataCard
              title="Produtos Mais Vendidos"
              description="Ranking de produtos por volume de vendas"
              icon={Package}
              isLoading={loadingProducts}
            >
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
                        {formatCurrency(product.total)}
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
            </DataCard>
          </TabsContent>

          {/* Financeiro */}
          <TabsContent value="financeiro" className="mt-0 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard title="Receitas" value={formatCurrency(totalRevenue)} subtitle="no período" icon={TrendingUp} variant="success" />
              <StatCard title="Despesas" value={formatCurrency(0)} subtitle="no período" icon={TrendingUp} variant="destructive" />
              <StatCard title="Lucro" value={formatCurrency(totalRevenue)} subtitle="no período" icon={DollarSign} variant="success" />
            </div>

            <DataCard
              title="Formas de Pagamento"
              icon={PieChart}
              isLoading={loadingSales}
            >
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
                        {formatCurrency(total)}
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
            </DataCard>
          </TabsContent>

          {/* Estoque */}
          <TabsContent value="estoque" className="mt-0 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard title="Produtos em Estoque" value="0" subtitle="itens" icon={Package} />
              <StatCard title="Estoque Baixo" value="0" subtitle="alertas" icon={Warehouse} variant="warning" />
              <StatCard title="Sem Estoque" value="0" subtitle="produtos" icon={Package} variant="destructive" />
            </div>

            <DataCard
              title="Produtos com Estoque Baixo"
              description="Produtos que precisam de reposição"
              icon={Warehouse}
            >
              <div className="text-center text-muted-foreground py-8">
                Nenhum produto com estoque baixo
              </div>
            </DataCard>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
