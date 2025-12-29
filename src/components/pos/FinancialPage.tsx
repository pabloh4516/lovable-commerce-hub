import { useState } from 'react';
import { 
  Plus, 
  Search, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  CreditCard,
  Loader2,
  Check,
  AlertCircle,
  Building,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  useFinancialTransactions, 
  useBankAccounts, 
  useFinancialCategories,
  useFinancialMutations 
} from '@/hooks/useFinancial';
import { useCustomers } from '@/hooks/useCustomers';
import { useSuppliers } from '@/hooks/useSuppliers';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendente', color: 'bg-yellow-500' },
  partial: { label: 'Parcial', color: 'bg-blue-500' },
  paid: { label: 'Pago', color: 'bg-success' },
  overdue: { label: 'Vencido', color: 'bg-destructive' },
  cancelled: { label: 'Cancelado', color: 'bg-muted' },
};

export function FinancialPage() {
  const [activeTab, setActiveTab] = useState('receivable');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  
  const today = new Date();
  const { data: transactions, isLoading } = useFinancialTransactions({
    type: activeTab as 'payable' | 'receivable',
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });
  const { data: bankAccounts } = useBankAccounts();
  const { data: categories } = useFinancialCategories();
  const { customers } = useCustomers();
  const { data: suppliers } = useSuppliers();
  const { createTransaction, payTransaction } = useFinancialMutations();

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    due_date: format(today, 'yyyy-MM-dd'),
    category_id: '',
    customer_id: '',
    supplier_id: '',
    document_number: '',
    installments: '1',
    notes: '',
  });

  const [payData, setPayData] = useState({
    amount: '',
    bank_account_id: '',
  });

  // Stats
  const totalReceivable = transactions?.filter(t => t.type === 'receivable' && t.status !== 'paid')
    .reduce((sum, t) => sum + t.amount - t.paid_amount, 0) || 0;
  const totalPayable = transactions?.filter(t => t.type === 'payable' && t.status !== 'paid')
    .reduce((sum, t) => sum + t.amount - t.paid_amount, 0) || 0;
  const overdueCount = transactions?.filter(t => t.status === 'overdue').length || 0;
  const totalBalance = bankAccounts?.reduce((sum, a) => sum + a.current_balance, 0) || 0;

  const filteredTransactions = transactions?.filter(t => {
    const matchesSearch = 
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.supplier?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  }) || [];

  const incomeCategories = categories?.filter(c => c.type === 'income') || [];
  const expenseCategories = categories?.filter(c => c.type === 'expense') || [];

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      due_date: format(today, 'yyyy-MM-dd'),
      category_id: '',
      customer_id: '',
      supplier_id: '',
      document_number: '',
      installments: '1',
      notes: '',
    });
  };

  const handleSave = async () => {
    if (!formData.description || !formData.amount || !formData.due_date) return;

    const installments = parseInt(formData.installments) || 1;
    const amount = parseFloat(formData.amount) / installments;

    for (let i = 0; i < installments; i++) {
      const dueDate = new Date(formData.due_date);
      dueDate.setMonth(dueDate.getMonth() + i);

      await createTransaction.mutateAsync({
        type: activeTab as 'payable' | 'receivable',
        description: installments > 1 ? `${formData.description} (${i + 1}/${installments})` : formData.description,
        amount,
        paid_amount: 0,
        due_date: format(dueDate, 'yyyy-MM-dd'),
        paid_date: null,
        status: 'pending',
        category_id: formData.category_id || null,
        customer_id: formData.customer_id || null,
        supplier_id: formData.supplier_id || null,
        document_number: formData.document_number || null,
        installment_number: installments > 1 ? i + 1 : null,
        total_installments: installments > 1 ? installments : null,
        notes: formData.notes || null,
        bank_account_id: null,
        sale_id: null,
        service_order_id: null,
        purchase_order_id: null,
        payment_method: null,
        barcode: null,
        created_by: '',
      });
    }

    setShowModal(false);
    resetForm();
  };

  const handlePay = async () => {
    if (!selectedTransaction || !payData.amount) return;

    await payTransaction.mutateAsync({
      id: selectedTransaction.id,
      paid_amount: parseFloat(payData.amount),
      bank_account_id: payData.bank_account_id || undefined,
    });

    setShowPayModal(false);
    setSelectedTransaction(null);
    setPayData({ amount: '', bank_account_id: '' });
  };

  const openPayModal = (transaction: any) => {
    setSelectedTransaction(transaction);
    setPayData({
      amount: (transaction.amount - transaction.paid_amount).toFixed(2),
      bank_account_id: '',
    });
    setShowPayModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Financeiro</h1>
          <p className="text-muted-foreground">Controle de contas a pagar e receber</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Lançamento
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <ArrowUpRight className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-success">
                  R$ {totalReceivable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-muted-foreground">A Receber</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <ArrowDownRight className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-destructive">
                  R$ {totalPayable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-muted-foreground">A Pagar</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  R$ {totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-muted-foreground">Saldo Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <AlertCircle className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-500">{overdueCount}</p>
                <p className="text-sm text-muted-foreground">Vencidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="receivable" className="gap-2">
            <ArrowUpRight className="w-4 h-4" />
            A Receber
          </TabsTrigger>
          <TabsTrigger value="payable" className="gap-2">
            <ArrowDownRight className="w-4 h-4" />
            A Pagar
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por descrição, cliente ou fornecedor..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>{activeTab === 'receivable' ? 'Cliente' : 'Fornecedor'}</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Pago</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Nenhum lançamento encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((transaction) => {
                      const status = statusConfig[transaction.status];
                      const isOverdue = new Date(transaction.due_date) < today && transaction.status === 'pending';
                      
                      return (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              {transaction.document_number && (
                                <p className="text-xs text-muted-foreground">Doc: {transaction.document_number}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {transaction.customer?.name || transaction.supplier?.name || '-'}
                          </TableCell>
                          <TableCell>
                            <span className={isOverdue ? 'text-destructive font-medium' : ''}>
                              {format(new Date(transaction.due_date), 'dd/MM/yyyy')}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium">
                            R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell>
                            R$ {transaction.paid_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell>
                            <Badge className={isOverdue ? 'bg-destructive' : status.color}>
                              {isOverdue ? 'Vencido' : status.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {transaction.status !== 'paid' && transaction.status !== 'cancelled' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openPayModal(transaction)}
                                className="gap-1"
                              >
                                <Check className="w-4 h-4" />
                                Baixar
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Transaction Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Novo {activeTab === 'receivable' ? 'Recebimento' : 'Pagamento'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <Label>Descrição *</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição do lançamento"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Valor Total *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="R$ 0,00"
                />
              </div>
              <div>
                <Label>Vencimento *</Label>
                <Input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Categoria</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {(activeTab === 'receivable' ? incomeCategories : expenseCategories).map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Parcelas</Label>
                <Select
                  value={formData.installments}
                  onValueChange={(value) => setFormData({ ...formData, installments: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                      <SelectItem key={n} value={n.toString()}>{n}x</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {activeTab === 'receivable' ? (
              <div>
                <Label>Cliente</Label>
                <Select
                  value={formData.customer_id}
                  onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers?.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div>
                <Label>Fornecedor</Label>
                <Select
                  value={formData.supplier_id}
                  onValueChange={(value) => setFormData({ ...formData, supplier_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o fornecedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers?.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>{supplier.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Número do Documento</Label>
              <Input
                value={formData.document_number}
                onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                placeholder="NF, boleto, etc."
              />
            </div>

            <div>
              <Label>Observações</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!formData.description || !formData.amount || !formData.due_date}
            >
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pay Modal */}
      <Dialog open={showPayModal} onOpenChange={setShowPayModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Baixar Lançamento</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="font-medium">{selectedTransaction?.description}</p>
              <p className="text-sm text-muted-foreground">
                Valor: R$ {selectedTransaction?.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-muted-foreground">
                Pendente: R$ {(selectedTransaction?.amount - selectedTransaction?.paid_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div>
              <Label>Valor a Pagar *</Label>
              <Input
                type="number"
                step="0.01"
                value={payData.amount}
                onChange={(e) => setPayData({ ...payData, amount: e.target.value })}
              />
            </div>

            <div>
              <Label>Conta Bancária</Label>
              <Select
                value={payData.bank_account_id}
                onValueChange={(value) => setPayData({ ...payData, bank_account_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts?.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} - R$ {account.current_balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowPayModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handlePay} disabled={!payData.amount}>
              Confirmar Baixa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
