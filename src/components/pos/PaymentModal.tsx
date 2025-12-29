import { useState, useEffect } from 'react';
import { X, Banknote, Smartphone, CreditCard, Wallet, Check, Plus, Trash2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PaymentMethod, Customer } from '@/types/pos';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { formatCurrency } from '@/lib/utils';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PaymentEntry {
  id: string;
  method: PaymentMethod;
  amount: number;
  installments: number;
  firstDueDate: Date;
}

interface Installment {
  number: number;
  dueDate: Date;
  amount: number;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  customer: Customer | null;
  onConfirm: (payments: { method: PaymentMethod; amount: number; installments?: Installment[] }[]) => void;
}

const paymentMethodsConfig: { method: PaymentMethod; label: string; icon: React.ReactNode; color: string; allowsInstallments: boolean }[] = [
  { method: 'cash', label: 'Dinheiro', icon: <Banknote className="h-5 w-5" />, color: 'text-success', allowsInstallments: false },
  { method: 'pix', label: 'PIX', icon: <Smartphone className="h-5 w-5" />, color: 'text-primary', allowsInstallments: false },
  { method: 'credit', label: 'Crédito', icon: <CreditCard className="h-5 w-5" />, color: 'text-primary', allowsInstallments: true },
  { method: 'debit', label: 'Débito', icon: <CreditCard className="h-5 w-5" />, color: 'text-warning', allowsInstallments: false },
  { method: 'fiado', label: 'A Prazo', icon: <Wallet className="h-5 w-5" />, color: 'text-destructive', allowsInstallments: true },
];

export function PaymentModal({ isOpen, onClose, total, customer, onConfirm }: PaymentModalProps) {
  const [payments, setPayments] = useState<PaymentEntry[]>([]);
  const [receivedAmount, setReceivedAmount] = useState<string>('0');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [activeTab, setActiveTab] = useState<'simple' | 'multiple'>('simple');
  
  // Simple mode state
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('pix');
  const [installmentCount, setInstallmentCount] = useState(1);
  const [firstDueDate, setFirstDueDate] = useState<Date>(new Date());
  const [intervalDays, setIntervalDays] = useState(30);

  const { paymentMethods: dbPaymentMethods } = usePaymentMethods();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPayments([]);
      setReceivedAmount('0');
      setSelectedMethod('pix');
      setInstallmentCount(1);
      setFirstDueDate(new Date());
      setIntervalDays(30);
      setIsComplete(false);
      setActiveTab('simple');
    }
  }, [isOpen]);

  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = total - totalPayments;
  const received = parseFloat(receivedAmount) || 0;
  const change = selectedMethod === 'cash' ? received - total : 0;

  // Generate installments for preview
  const generateInstallments = (amount: number, count: number, startDate: Date, interval: number): Installment[] => {
    const installmentAmount = amount / count;
    return Array.from({ length: count }, (_, i) => ({
      number: i + 1,
      dueDate: addDays(startDate, i * interval),
      amount: i === count - 1 ? amount - (installmentAmount * (count - 1)) : installmentAmount, // Last installment handles rounding
    }));
  };

  const installmentsPreview = selectedMethod === 'fiado' || selectedMethod === 'credit' 
    ? generateInstallments(total, installmentCount, firstDueDate, intervalDays)
    : [];

  const handleNumpadClick = (value: string) => {
    if (value === 'C') {
      setReceivedAmount('0');
    } else if (value === '⌫') {
      setReceivedAmount((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
    } else if (value === '.') {
      if (!receivedAmount.includes('.')) {
        setReceivedAmount((prev) => prev + '.');
      }
    } else {
      setReceivedAmount((prev) => (prev === '0' ? value : prev + value));
    }
  };

  const handleQuickAmount = (amount: number) => {
    setReceivedAmount(amount.toFixed(2));
  };

  const addPayment = () => {
    if (remaining <= 0) return;
    const newPayment: PaymentEntry = {
      id: crypto.randomUUID(),
      method: 'pix',
      amount: remaining,
      installments: 1,
      firstDueDate: new Date(),
    };
    setPayments([...payments, newPayment]);
  };

  const updatePayment = (id: string, field: keyof PaymentEntry, value: any) => {
    setPayments(payments.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const removePayment = (id: string) => {
    setPayments(payments.filter(p => p.id !== id));
  };

  const handleConfirm = () => {
    if (selectedMethod === 'fiado' && !customer) {
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
      
      setTimeout(() => {
        if (activeTab === 'simple') {
          const installments = (selectedMethod === 'fiado' || selectedMethod === 'credit') && installmentCount > 1
            ? generateInstallments(total, installmentCount, firstDueDate, intervalDays)
            : undefined;
          
          onConfirm([{ method: selectedMethod, amount: total, installments }]);
        } else {
          const formattedPayments = payments.map(p => {
            const methodConfig = paymentMethodsConfig.find(m => m.method === p.method);
            const installments = methodConfig?.allowsInstallments && p.installments > 1
              ? generateInstallments(p.amount, p.installments, p.firstDueDate, intervalDays)
              : undefined;
            return { method: p.method, amount: p.amount, installments };
          });
          onConfirm(formattedPayments);
        }
        
        setIsComplete(false);
        setReceivedAmount('0');
        setSelectedMethod('pix');
      }, 1500);
    }, 800);
  };

  const canUseFiado = customer && customer.creditLimit - customer.currentDebt >= total;
  const numpadButtons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'];

  const getQuickAmounts = () => {
    const amounts = [];
    const rounded = Math.ceil(total / 10) * 10;
    amounts.push(rounded);
    amounts.push(rounded + 10);
    amounts.push(rounded + 20);
    amounts.push(Math.ceil(total / 50) * 50);
    amounts.push(100);
    amounts.push(200);
    return [...new Set(amounts)].slice(0, 6);
  };

  const methodConfig = paymentMethodsConfig.find(m => m.method === selectedMethod);
  const showInstallments = methodConfig?.allowsInstallments && (selectedMethod === 'fiado' || selectedMethod === 'credit');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-card border-border p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        {isComplete ? (
          <div className="flex flex-col items-center justify-center h-96 animate-scale-in">
            <div className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center mb-6">
              <Check className="w-12 h-12 text-success" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Venda Concluída!</h2>
            {selectedMethod === 'cash' && change > 0 && (
              <p className="text-xl text-muted-foreground">
                Troco: <span className="font-bold text-warning">{formatCurrency(change)}</span>
              </p>
            )}
          </div>
        ) : (
          <>
            <DialogHeader className="p-6 pb-0">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl">Pagamento</DialogTitle>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'simple' | 'multiple')} className="w-full">
              <div className="px-6 pt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="simple">Pagamento Simples</TabsTrigger>
                  <TabsTrigger value="multiple">Múltiplas Formas</TabsTrigger>
                </TabsList>
              </div>

              {/* Simple Payment Tab */}
              <TabsContent value="simple" className="m-0">
                <div className="grid grid-cols-2 gap-6 p-6">
                  {/* Left side - Payment methods */}
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-secondary rounded-xl">
                      <p className="text-sm text-muted-foreground mb-1">Total a pagar</p>
                      <p className="text-3xl font-bold text-primary">
                        {formatCurrency(total)}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {paymentMethodsConfig.map(({ method, label, icon, color }) => {
                        const isDisabled = method === 'fiado' && !canUseFiado;
                        return (
                          <button
                            key={method}
                            onClick={() => !isDisabled && setSelectedMethod(method)}
                            disabled={isDisabled}
                            className={`payment-btn ${selectedMethod === method ? 'selected' : ''} ${
                              isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <span className={color}>{icon}</span>
                            <span>{label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {selectedMethod === 'fiado' && !customer && (
                      <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-xl text-center">
                        <p className="text-sm text-destructive">Identifique o cliente para usar fiado</p>
                      </div>
                    )}

                    {/* Installments Section */}
                    {showInstallments && (
                      <div className="space-y-4 p-4 bg-secondary/50 rounded-xl border border-border">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Parcelamento
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs">Parcelas</Label>
                            <Select value={installmentCount.toString()} onValueChange={(v) => setInstallmentCount(parseInt(v))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                                  <SelectItem key={n} value={n.toString()}>
                                    {n}x de {formatCurrency(total / n)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-1.5">
                            <Label className="text-xs">Intervalo (dias)</Label>
                            <Select value={intervalDays.toString()} onValueChange={(v) => setIntervalDays(parseInt(v))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="7">7 dias</SelectItem>
                                <SelectItem value="14">14 dias</SelectItem>
                                <SelectItem value="15">15 dias</SelectItem>
                                <SelectItem value="30">30 dias</SelectItem>
                                <SelectItem value="45">45 dias</SelectItem>
                                <SelectItem value="60">60 dias</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs">1ª Parcela</Label>
                          <Input
                            type="date"
                            value={format(firstDueDate, 'yyyy-MM-dd')}
                            onChange={(e) => setFirstDueDate(new Date(e.target.value))}
                          />
                        </div>

                        {installmentCount > 1 && (
                          <div className="max-h-32 overflow-y-auto rounded-lg border border-border">
                            <table className="w-full text-sm">
                              <thead className="bg-muted/50 sticky top-0">
                                <tr>
                                  <th className="px-2 py-1 text-left">#</th>
                                  <th className="px-2 py-1 text-left">Vencimento</th>
                                  <th className="px-2 py-1 text-right">Valor</th>
                                </tr>
                              </thead>
                              <tbody>
                                {installmentsPreview.map((inst) => (
                                  <tr key={inst.number} className="border-t border-border">
                                    <td className="px-2 py-1">{inst.number}</td>
                                    <td className="px-2 py-1">{format(inst.dueDate, 'dd/MM/yyyy', { locale: ptBR })}</td>
                                    <td className="px-2 py-1 text-right font-medium">{formatCurrency(inst.amount)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}

                    {selectedMethod === 'cash' && (
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">Valores rápidos</p>
                        <div className="grid grid-cols-3 gap-2">
                          {getQuickAmounts().map((amount) => (
                            <Button
                              key={amount}
                              variant="secondary"
                              size="sm"
                              onClick={() => handleQuickAmount(amount)}
                            >
                              R$ {amount.toFixed(0)}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right side - Numpad/Info */}
                  <div className="space-y-4">
                    {selectedMethod === 'cash' && (
                      <>
                        <div className="text-center p-4 bg-secondary rounded-xl">
                          <p className="text-sm text-muted-foreground mb-1">Valor recebido</p>
                          <p className="text-3xl font-bold">
                            {formatCurrency(parseFloat(receivedAmount || '0'))}
                          </p>
                        </div>

                        {change >= 0 && received > 0 && (
                          <div className="text-center p-3 bg-warning/10 rounded-xl border border-warning/30">
                            <p className="text-sm text-muted-foreground">Troco</p>
                            <p className="text-2xl font-bold text-warning">
                              {formatCurrency(change)}
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-3 gap-2">
                          {numpadButtons.map((btn) => (
                            <Button
                              key={btn}
                              variant="numpad"
                              size="numpad"
                              onClick={() => handleNumpadClick(btn)}
                            >
                              {btn}
                            </Button>
                          ))}
                        </div>
                      </>
                    )}

                    {selectedMethod !== 'cash' && selectedMethod !== 'fiado' && !showInstallments && (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                            {paymentMethodsConfig.find((p) => p.method === selectedMethod)?.icon}
                          </div>
                          <p className="text-muted-foreground">
                            {selectedMethod === 'pix' && 'Aguardando pagamento PIX...'}
                            {selectedMethod === 'credit' && 'Passe o cartão de crédito'}
                            {selectedMethod === 'debit' && 'Passe o cartão de débito'}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedMethod === 'fiado' && customer && (
                      <div className="space-y-4">
                        <div className="p-4 bg-secondary rounded-xl">
                          <p className="text-sm text-muted-foreground mb-2">Cliente</p>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">{customer.cpf}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-secondary rounded-xl text-center">
                            <p className="text-xs text-muted-foreground">Limite</p>
                            <p className="font-bold">{formatCurrency(customer.creditLimit)}</p>
                          </div>
                          <div className="p-3 bg-secondary rounded-xl text-center">
                            <p className="text-xs text-muted-foreground">Débito atual</p>
                            <p className="font-bold text-warning">{formatCurrency(customer.currentDebt)}</p>
                          </div>
                        </div>
                        <div className="p-3 bg-success/10 border border-success/30 rounded-xl text-center">
                          <p className="text-xs text-muted-foreground">Disponível</p>
                          <p className="font-bold text-success">
                            {formatCurrency(customer.creditLimit - customer.currentDebt)}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedMethod === 'credit' && showInstallments && (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                            <CreditCard className="h-8 w-8 text-primary" />
                          </div>
                          <p className="text-muted-foreground">Passe o cartão de crédito</p>
                          {installmentCount > 1 && (
                            <p className="text-sm text-primary mt-2">
                              {installmentCount}x de {formatCurrency(total / installmentCount)}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Multiple Payments Tab */}
              <TabsContent value="multiple" className="m-0 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total a pagar</p>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(total)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Restante</p>
                    <p className={`text-2xl font-bold ${remaining > 0 ? 'text-warning' : 'text-success'}`}>
                      {formatCurrency(remaining)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {payments.map((payment, index) => (
                    <div key={payment.id} className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                      <span className="text-sm font-medium text-muted-foreground w-8">#{index + 1}</span>
                      
                      <Select value={payment.method} onValueChange={(v) => updatePayment(payment.id, 'method', v as PaymentMethod)}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentMethodsConfig.map((m) => (
                            <SelectItem key={m.method} value={m.method} disabled={m.method === 'fiado' && !canUseFiado}>
                              <span className="flex items-center gap-2">
                                <span className={m.color}>{m.icon}</span>
                                {m.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Input
                        type="number"
                        value={payment.amount}
                        onChange={(e) => updatePayment(payment.id, 'amount', parseFloat(e.target.value) || 0)}
                        className="w-32"
                        step="0.01"
                      />

                      {paymentMethodsConfig.find(m => m.method === payment.method)?.allowsInstallments && (
                        <Select value={payment.installments.toString()} onValueChange={(v) => updatePayment(payment.id, 'installments', parseInt(v))}>
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                              <SelectItem key={n} value={n.toString()}>{n}x</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      <Button variant="ghost" size="icon" onClick={() => removePayment(payment.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>

                {remaining > 0 && (
                  <Button variant="outline" className="w-full" onClick={addPayment}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Forma de Pagamento ({formatCurrency(remaining)})
                  </Button>
                )}
              </TabsContent>
            </Tabs>

            <div className="p-6 pt-0">
              <Button
                variant="success"
                size="xl"
                className="w-full"
                onClick={handleConfirm}
                disabled={
                  (activeTab === 'simple' && selectedMethod === 'cash' && received < total) ||
                  (activeTab === 'simple' && selectedMethod === 'fiado' && !canUseFiado) ||
                  (activeTab === 'multiple' && remaining > 0.01)
                }
              >
                {isProcessing ? (
                  <span className="animate-pulse">Processando...</span>
                ) : (
                  'Confirmar Pagamento'
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}