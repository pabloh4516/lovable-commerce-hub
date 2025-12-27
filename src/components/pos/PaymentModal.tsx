import { useState } from 'react';
import { X, Banknote, Smartphone, CreditCard, Check, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PaymentMethod, Customer } from '@/types/pos';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  customer: Customer | null;
  onConfirm: (payments: { method: PaymentMethod; amount: number }[]) => void;
}

const paymentMethods: { method: PaymentMethod; label: string; icon: React.ReactNode; color: string }[] = [
  { method: 'cash', label: 'Dinheiro', icon: <Banknote className="h-6 w-6" />, color: 'text-success' },
  { method: 'pix', label: 'PIX', icon: <Smartphone className="h-6 w-6" />, color: 'text-primary' },
  { method: 'credit', label: 'Crédito', icon: <CreditCard className="h-6 w-6" />, color: 'text-primary' },
  { method: 'debit', label: 'Débito', icon: <CreditCard className="h-6 w-6" />, color: 'text-warning' },
  { method: 'fiado', label: 'Fiado', icon: <Wallet className="h-6 w-6" />, color: 'text-destructive' },
];

export function PaymentModal({ isOpen, onClose, total, customer, onConfirm }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('pix');
  const [receivedAmount, setReceivedAmount] = useState<string>(total.toFixed(2));
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const received = parseFloat(receivedAmount) || 0;
  const change = received - total;

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

  const handleConfirm = () => {
    if (selectedMethod === 'fiado' && !customer) {
      return; // Can't use fiado without customer
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
      setTimeout(() => {
        onConfirm([{ method: selectedMethod, amount: total }]);
        setIsComplete(false);
        setReceivedAmount(total.toFixed(2));
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card border-border p-0 overflow-hidden">
        {isComplete ? (
          <div className="flex flex-col items-center justify-center h-96 animate-scale-in">
            <div className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center mb-6">
              <Check className="w-12 h-12 text-success" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Venda Concluída!</h2>
            {selectedMethod === 'cash' && change > 0 && (
              <p className="text-xl text-muted-foreground">
                Troco: <span className="font-bold text-warning">R$ {change.toFixed(2).replace('.', ',')}</span>
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

            <div className="grid grid-cols-2 gap-6 p-6">
              {/* Left side - Payment methods */}
              <div className="space-y-4">
                <div className="text-center p-4 bg-secondary rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">Total a pagar</p>
                  <p className="text-3xl font-bold text-primary">
                    R$ {total.toFixed(2).replace('.', ',')}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map(({ method, label, icon, color }) => {
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

              {/* Right side - Numpad (for cash) */}
              <div className="space-y-4">
                {selectedMethod === 'cash' && (
                  <>
                    <div className="text-center p-4 bg-secondary rounded-xl">
                      <p className="text-sm text-muted-foreground mb-1">Valor recebido</p>
                      <p className="text-3xl font-bold">
                        R$ {parseFloat(receivedAmount || '0').toFixed(2).replace('.', ',')}
                      </p>
                    </div>

                    {change >= 0 && received > 0 && (
                      <div className="text-center p-3 bg-warning/10 rounded-xl border border-warning/30">
                        <p className="text-sm text-muted-foreground">Troco</p>
                        <p className="text-2xl font-bold text-warning">
                          R$ {change.toFixed(2).replace('.', ',')}
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

                {selectedMethod !== 'cash' && selectedMethod !== 'fiado' && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                        {paymentMethods.find((p) => p.method === selectedMethod)?.icon}
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
                        <p className="font-bold">R$ {customer.creditLimit.toFixed(2).replace('.', ',')}</p>
                      </div>
                      <div className="p-3 bg-secondary rounded-xl text-center">
                        <p className="text-xs text-muted-foreground">Débito atual</p>
                        <p className="font-bold text-warning">R$ {customer.currentDebt.toFixed(2).replace('.', ',')}</p>
                      </div>
                    </div>
                    <div className="p-3 bg-success/10 border border-success/30 rounded-xl text-center">
                      <p className="text-xs text-muted-foreground">Disponível</p>
                      <p className="font-bold text-success">
                        R$ {(customer.creditLimit - customer.currentDebt).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 pt-0">
              <Button
                variant="success"
                size="xl"
                className="w-full"
                onClick={handleConfirm}
                disabled={
                  (selectedMethod === 'cash' && received < total) ||
                  (selectedMethod === 'fiado' && !canUseFiado)
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
