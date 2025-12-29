import { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Eye, 
  CheckCircle, 
  User,
  FileText,
  Mail,
  Calculator,
  AlertTriangle,
  Clock,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useFinancialTransactions } from '@/hooks/useFinancial';
import { useCustomers } from '@/hooks/useCustomers';
import { formatCurrency } from '@/lib/utils';
import { format, differenceInDays, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

export function AccountsReceivablePage() {
  const { data: transactions, isLoading } = useFinancialTransactions({ type: 'receivable' });
  const { customers } = useCustomers();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [customerFilter, setCustomerFilter] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showPayModal, setShowPayModal] = useState(false);
  const [paymentData, setPaymentData] = useState({ amount: 0, discount: 0, interest: 0 });

  // Calculate overdue status
  const enrichedTransactions = useMemo(() => {
    return transactions?.map(t => {
      const dueDate = new Date(t.due_date);
      const today = new Date();
      const daysOverdue = isPast(dueDate) && t.status !== 'paid' ? differenceInDays(today, dueDate) : 0;
      const actualStatus = daysOverdue > 0 ? 'overdue' : t.status;
      return { ...t, daysOverdue, actualStatus };
    }) || [];
  }, [transactions]);

  const filtered = useMemo(() => {
    return enrichedTransactions.filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
        t.number.toString().includes(search);
      const matchesStatus = statusFilter === 'all' || t.actualStatus === statusFilter;
      const matchesCustomer = customerFilter === 'all' || t.customer_id === customerFilter;
      return matchesSearch && matchesStatus && matchesCustomer;
    });
  }, [enrichedTransactions, search, statusFilter, customerFilter]);

  // Stats
  const totalPending = enrichedTransactions.filter(t => t.actualStatus === 'pending').reduce((sum, t) => sum + t.amount, 0);
  const totalReceived = enrichedTransactions.filter(t => t.actualStatus === 'paid').reduce((sum, t) => sum + (t.paid_amount || 0), 0);
  const totalOverdue = enrichedTransactions.filter(t => t.actualStatus === 'overdue').reduce((sum, t) => sum + t.amount, 0);
  const countOverdue = enrichedTransactions.filter(t => t.actualStatus === 'overdue').length;

  const getStatusBadge = (status: string, daysOverdue: number = 0) => {
    const variants: Record<string, { label: string; className: string }> = {
      pending: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
      paid: { label: 'Recebido', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
      partial: { label: 'Parcial', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
      overdue: { label: `Vencido ${daysOverdue}d`, className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
      cancelled: { label: 'Cancelado', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' },
    };
    const variant = variants[status] || { label: status, className: '' };
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const toggleItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    const pendingIds = filtered.filter(t => t.actualStatus !== 'paid').map(t => t.id);
    setSelectedItems(pendingIds);
  };

  const handleBulkPay = () => {
    if (selectedItems.length === 0) return;
    const total = filtered
      .filter(t => selectedItems.includes(t.id))
      .reduce((sum, t) => sum + t.amount, 0);
    setPaymentData({ amount: total, discount: 0, interest: 0 });
    setShowPayModal(true);
  };

  const confirmPayment = () => {
    toast.success(`${selectedItems.length} título(s) quitado(s)`);
    setSelectedItems([]);
    setShowPayModal(false);
  };

  const sendCollectionLetter = (level: number) => {
    toast.success(`Carta de cobrança nível ${level} enviada`);
  };

  // Group by customer for customer view
  const customerTotals = useMemo(() => {
    const totals: Record<string, { name: string; pending: number; overdue: number; count: number }> = {};
    enrichedTransactions.forEach(t => {
      if (t.customer_id && t.actualStatus !== 'paid') {
        if (!totals[t.customer_id]) {
          totals[t.customer_id] = { name: t.customer?.name || '', pending: 0, overdue: 0, count: 0 };
        }
        totals[t.customer_id].count++;
        if (t.actualStatus === 'overdue') {
          totals[t.customer_id].overdue += t.amount;
        } else {
          totals[t.customer_id].pending += t.amount;
        }
      }
    });
    return Object.entries(totals).sort((a, b) => (b[1].overdue + b[1].pending) - (a[1].overdue + a[1].pending));
  }, [enrichedTransactions]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="h-7 w-7 text-green-600" />
            Contas a Receber
          </h1>
          <p className="text-muted-foreground">Gerencie seus recebimentos e parcelas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => sendCollectionLetter(1)} disabled={selectedItems.length === 0}>
            <Mail className="h-4 w-4 mr-2" />
            Carta Cobrança
          </Button>
          <Button onClick={handleBulkPay} disabled={selectedItems.length === 0}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Quitar Selecionados ({selectedItems.length})
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="icon-box">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalPending + totalOverdue)}</p>
                <p className="text-sm text-muted-foreground">Total a Receber</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="icon-box-success">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-success">{formatCurrency(totalReceived)}</p>
                <p className="text-sm text-muted-foreground">Recebido</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="icon-box-warning">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-warning">{formatCurrency(totalPending)}</p>
                <p className="text-sm text-muted-foreground">A Vencer</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card border-destructive/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-destructive/10">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-destructive">{formatCurrency(totalOverdue)}</p>
                <p className="text-sm text-muted-foreground">Vencidos ({countOverdue})</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-muted">
                <FileText className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{filtered.length}</p>
                <p className="text-sm text-muted-foreground">Títulos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content with Tabs */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Todos os Títulos</TabsTrigger>
          <TabsTrigger value="pending">Em Aberto</TabsTrigger>
          <TabsTrigger value="overdue" className="text-destructive">Vencidos ({countOverdue})</TabsTrigger>
          <TabsTrigger value="paid">Recebidos</TabsTrigger>
          <TabsTrigger value="customers">Por Cliente</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              {/* Filters */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nº, descrição ou cliente..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={customerFilter} onValueChange={setCustomerFilter}>
                  <SelectTrigger className="w-[200px]">
                    <User className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Clientes</SelectItem>
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="paid">Recebidos</SelectItem>
                    <SelectItem value="overdue">Vencidos</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={selectAll}>
                  Selecionar Abertos
                </Button>
              </div>

              {/* Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>Nº Venda</TableHead>
                    <TableHead>Parcela</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-center">Dias Atraso</TableHead>
                    <TableHead className="text-right">Recebido</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                        Nenhuma conta encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((transaction) => (
                      <TableRow key={transaction.id} className={transaction.actualStatus === 'overdue' ? 'bg-destructive/5' : ''}>
                        <TableCell>
                          {transaction.actualStatus !== 'paid' && (
                            <Checkbox
                              checked={selectedItems.includes(transaction.id)}
                              onCheckedChange={() => toggleItem(transaction.id)}
                            />
                          )}
                        </TableCell>
                        <TableCell className="font-mono font-medium">
                          #{transaction.sale_id ? transaction.number : '-'}
                        </TableCell>
                        <TableCell>
                          {transaction.installment_number && transaction.total_installments 
                            ? `${transaction.installment_number}/${transaction.total_installments}`
                            : '1/1'
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {format(new Date(transaction.due_date), "dd/MM/yyyy", { locale: ptBR })}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {transaction.customer?.name || '-'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell className="text-center">
                          {transaction.daysOverdue > 0 ? (
                            <Badge variant="destructive">{transaction.daysOverdue} dias</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-success font-medium">
                          {formatCurrency(transaction.paid_amount || 0)}
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(transaction.actualStatus, transaction.daysOverdue)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" title="Detalhes">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {transaction.actualStatus !== 'paid' && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-success" 
                                title="Quitar"
                                onClick={() => {
                                  setSelectedItems([transaction.id]);
                                  setPaymentData({ amount: transaction.amount, discount: 0, interest: 0 });
                                  setShowPayModal(true);
                                }}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrichedTransactions.filter(t => t.actualStatus === 'pending').map(t => (
                    <TableRow key={t.id}>
                      <TableCell>{t.customer?.name || '-'}</TableCell>
                      <TableCell>{format(new Date(t.due_date), "dd/MM/yyyy")}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(t.amount)}</TableCell>
                      <TableCell className="text-center">{getStatusBadge(t.actualStatus)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue">
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Títulos Vencidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead className="text-center">Dias Atraso</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrichedTransactions.filter(t => t.actualStatus === 'overdue').map(t => (
                    <TableRow key={t.id} className="bg-destructive/5">
                      <TableCell className="font-medium">{t.customer?.name || '-'}</TableCell>
                      <TableCell>{format(new Date(t.due_date), "dd/MM/yyyy")}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="destructive">{t.daysOverdue} dias</Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold text-destructive">{formatCurrency(t.amount)}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => sendCollectionLetter(1)}>
                          <Mail className="h-4 w-4 mr-1" />
                          Cobrar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paid">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Data Pagamento</TableHead>
                    <TableHead className="text-right">Valor Pago</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrichedTransactions.filter(t => t.actualStatus === 'paid').map(t => (
                    <TableRow key={t.id}>
                      <TableCell>{t.customer?.name || '-'}</TableCell>
                      <TableCell>{t.paid_date ? format(new Date(t.paid_date), "dd/MM/yyyy") : '-'}</TableCell>
                      <TableCell className="text-right font-medium text-success">{formatCurrency(t.paid_amount || t.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers">
          <div className="grid gap-4">
            {customerTotals.map(([customerId, data]) => (
              <Card key={customerId} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCustomerFilter(customerId)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{data.name}</p>
                        <p className="text-sm text-muted-foreground">{data.count} título(s) em aberto</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {data.overdue > 0 && (
                        <p className="text-lg font-bold text-destructive">{formatCurrency(data.overdue)} vencido</p>
                      )}
                      <p className="text-lg font-bold text-warning">{formatCurrency(data.pending + data.overdue)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Payment Modal */}
      <Dialog open={showPayModal} onOpenChange={setShowPayModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quitar Título(s)</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex justify-between text-lg">
              <span>Valor Original:</span>
              <span className="font-bold">{formatCurrency(paymentData.amount)}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Desconto (R$)</Label>
                <Input
                  type="number"
                  value={paymentData.discount}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label>Juros/Multa (R$)</Label>
                <Input
                  type="number"
                  value={paymentData.interest}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, interest: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <div className="flex justify-between text-xl border-t pt-4">
              <span>Total a Receber:</span>
              <span className="font-bold text-success">
                {formatCurrency(paymentData.amount - paymentData.discount + paymentData.interest)}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayModal(false)}>Cancelar</Button>
            <Button onClick={confirmPayment}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirmar Recebimento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
