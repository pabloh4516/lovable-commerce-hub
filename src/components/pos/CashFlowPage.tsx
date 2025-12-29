import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from './PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Wallet, 
  CreditCard, 
  Banknote, 
  Smartphone,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function CashFlowPage() {
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [activeTab, setActiveTab] = useState('summary');

  // Fetch sales data
  const { data: salesData } = useQuery({
    queryKey: ['cashflow-sales', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          id,
          total,
          discount,
          created_at,
          payments (method, amount)
        `)
        .gte('created_at', `${startDate}T00:00:00`)
        .lte('created_at', `${endDate}T23:59:59`)
        .eq('status', 'completed');
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch cash movements (withdrawals/deposits)
  const { data: cashMovements } = useQuery({
    queryKey: ['cashflow-movements', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cash_movements')
        .select('*')
        .gte('created_at', `${startDate}T00:00:00`)
        .lte('created_at', `${endDate}T23:59:59`);
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch financial transactions (accounts payable/receivable)
  const { data: financialTransactions } = useQuery({
    queryKey: ['cashflow-financial', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .gte('paid_date', startDate)
        .lte('paid_date', endDate)
        .eq('status', 'paid');
      
      if (error) throw error;
      return data;
    },
  });

  // Calculate summaries
  const salesByMethod = {
    cash: 0,
    pix: 0,
    credit: 0,
    debit: 0,
    fiado: 0,
  };

  let totalSales = 0;
  let totalDiscounts = 0;

  salesData?.forEach(sale => {
    totalSales += sale.total;
    totalDiscounts += sale.discount;
    sale.payments?.forEach((payment: { method: string; amount: number }) => {
      if (payment.method in salesByMethod) {
        salesByMethod[payment.method as keyof typeof salesByMethod] += payment.amount;
      }
    });
  });

  // Cash movements summary
  const deposits = cashMovements?.filter(m => m.type === 'deposit').reduce((sum, m) => sum + m.amount, 0) || 0;
  const withdrawals = cashMovements?.filter(m => m.type === 'withdrawal').reduce((sum, m) => sum + m.amount, 0) || 0;

  // Financial transactions summary
  const receivables = financialTransactions?.filter(t => t.type === 'receivable').reduce((sum, t) => sum + (t.paid_amount || 0), 0) || 0;
  const payables = financialTransactions?.filter(t => t.type === 'payable').reduce((sum, t) => sum + (t.paid_amount || 0), 0) || 0;

  // Total entries and exits
  const totalEntries = totalSales + deposits + receivables;
  const totalExits = withdrawals + payables;
  const balance = totalEntries - totalExits;

  // Build detailed flow
  const detailedFlow: { date: Date; description: string; entry: number; exit: number; type: string }[] = [];

  // Add sales
  salesData?.forEach(sale => {
    detailedFlow.push({
      date: new Date(sale.created_at),
      description: `Venda #${sale.id.slice(0, 8)}`,
      entry: sale.total,
      exit: 0,
      type: 'sale',
    });
  });

  // Add cash movements
  cashMovements?.forEach(movement => {
    detailedFlow.push({
      date: new Date(movement.created_at),
      description: `${movement.type === 'deposit' ? 'Suprimento' : 'Sangria'}: ${movement.reason}`,
      entry: movement.type === 'deposit' ? movement.amount : 0,
      exit: movement.type === 'withdrawal' ? movement.amount : 0,
      type: movement.type,
    });
  });

  // Add financial transactions
  financialTransactions?.forEach(transaction => {
    detailedFlow.push({
      date: transaction.paid_date ? new Date(transaction.paid_date) : new Date(transaction.created_at || ''),
      description: transaction.description,
      entry: transaction.type === 'receivable' ? (transaction.paid_amount || 0) : 0,
      exit: transaction.type === 'payable' ? (transaction.paid_amount || 0) : 0,
      type: transaction.type,
    });
  });

  // Sort by date
  detailedFlow.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Quick date filters
  const setToday = () => {
    const today = new Date();
    setStartDate(format(today, 'yyyy-MM-dd'));
    setEndDate(format(today, 'yyyy-MM-dd'));
  };

  const setThisWeek = () => {
    const today = new Date();
    setStartDate(format(startOfWeek(today, { locale: ptBR }), 'yyyy-MM-dd'));
    setEndDate(format(endOfWeek(today, { locale: ptBR }), 'yyyy-MM-dd'));
  };

  const setThisMonth = () => {
    const today = new Date();
    setStartDate(format(startOfMonth(today), 'yyyy-MM-dd'));
    setEndDate(format(endOfMonth(today), 'yyyy-MM-dd'));
  };

  return (
    <div className="flex-1 overflow-auto">
      <PageHeader
        title="Fluxo de Caixa"
        subtitle="Resumo de entradas e saídas"
        showPDVButton={false}
      />

      <div className="p-6 space-y-6">
        {/* Date Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-40"
                />
                <span className="text-muted-foreground">até</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-40"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={setToday}>Hoje</Button>
                <Button variant="outline" size="sm" onClick={setThisWeek}>Semana</Button>
                <Button variant="outline" size="sm" onClick={setThisMonth}>Mês</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="summary">Resumo</TabsTrigger>
            <TabsTrigger value="detailed">Detalhado</TabsTrigger>
          </TabsList>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Cash Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Resumo de Caixa
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm">Vendas em Dinheiro</span>
                    <span className="font-medium text-success">{formatCurrency(salesByMethod.cash)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm">(+) Suprimentos</span>
                    <span className="font-medium text-success">{formatCurrency(deposits)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm">(+) Recebimentos</span>
                    <span className="font-medium text-success">{formatCurrency(receivables)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm">(-) Sangrias</span>
                    <span className="font-medium text-destructive">{formatCurrency(withdrawals)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm">(-) Pagamentos</span>
                    <span className="font-medium text-destructive">{formatCurrency(payables)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Sales by Payment Method */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Vendas por Forma de Pagamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm flex items-center gap-2">
                      <Banknote className="h-4 w-4 text-success" /> Dinheiro
                    </span>
                    <span className="font-medium">{formatCurrency(salesByMethod.cash)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-primary" /> PIX
                    </span>
                    <span className="font-medium">{formatCurrency(salesByMethod.pix)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-primary" /> Crédito
                    </span>
                    <span className="font-medium">{formatCurrency(salesByMethod.credit)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-warning" /> Débito
                    </span>
                    <span className="font-medium">{formatCurrency(salesByMethod.debit)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-destructive" /> A Prazo
                    </span>
                    <span className="font-medium">{formatCurrency(salesByMethod.fiado)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 font-bold">
                    <span>Total Vendas</span>
                    <span className="text-primary">{formatCurrency(totalSales)}</span>
                  </div>
                  {totalDiscounts > 0 && (
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>Descontos</span>
                      <span className="text-destructive">-{formatCurrency(totalDiscounts)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Total Balance */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Balanço do Período
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-success/10 rounded-lg">
                    <div className="flex items-center gap-2 text-success mb-1">
                      <ArrowUpCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">Total Entradas</span>
                    </div>
                    <p className="text-2xl font-bold text-success">{formatCurrency(totalEntries)}</p>
                  </div>
                  
                  <div className="p-4 bg-destructive/10 rounded-lg">
                    <div className="flex items-center gap-2 text-destructive mb-1">
                      <ArrowDownCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">Total Saídas</span>
                    </div>
                    <p className="text-2xl font-bold text-destructive">{formatCurrency(totalExits)}</p>
                  </div>
                  
                  <div className={`p-4 rounded-lg ${balance >= 0 ? 'bg-success/20' : 'bg-destructive/20'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {balance >= 0 ? (
                        <TrendingUp className="h-5 w-5 text-success" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-destructive" />
                      )}
                      <span className="text-sm font-medium">Saldo</span>
                    </div>
                    <p className={`text-3xl font-bold ${balance >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {formatCurrency(balance)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Detailed Tab */}
          <TabsContent value="detailed">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fluxo Detalhado</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right text-success">Entradas</TableHead>
                      <TableHead className="text-right text-destructive">Saídas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailedFlow.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          Nenhuma movimentação no período
                        </TableCell>
                      </TableRow>
                    ) : (
                      <>
                        {detailedFlow.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-mono text-sm">
                              {format(item.date, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </TableCell>
                            <TableCell>{item.description}</TableCell>
                            <TableCell className="text-right">
                              {item.entry > 0 && (
                                <span className="text-success font-medium">{formatCurrency(item.entry)}</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.exit > 0 && (
                                <span className="text-destructive font-medium">{formatCurrency(item.exit)}</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                        {/* Totals Row */}
                        <TableRow className="bg-muted/50 font-bold">
                          <TableCell colSpan={2}>TOTAL</TableCell>
                          <TableCell className="text-right text-success">
                            {formatCurrency(detailedFlow.reduce((sum, i) => sum + i.entry, 0))}
                          </TableCell>
                          <TableCell className="text-right text-destructive">
                            {formatCurrency(detailedFlow.reduce((sum, i) => sum + i.exit, 0))}
                          </TableCell>
                        </TableRow>
                      </>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}