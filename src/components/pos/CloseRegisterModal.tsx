import { useState } from 'react';
import { X, Lock, DollarSign, CreditCard, Smartphone, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CashRegister } from '@/types/pos';

interface CloseRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (closingBalance: number) => void;
  register: CashRegister;
}

export function CloseRegisterModal({ isOpen, onClose, onConfirm, register }: CloseRegisterModalProps) {
  const [closingBalance, setClosingBalance] = useState('');

  const expectedCash = register.openingBalance + 
    register.totalCash - 
    register.openingBalance - // Remove o saldo inicial que já está no totalCash
    register.withdrawals.reduce((sum, w) => sum + w.amount, 0) +
    register.deposits.reduce((sum, d) => sum + d.amount, 0);

  const cashInRegister = register.totalCash;
  const difference = closingBalance ? parseFloat(closingBalance) - cashInRegister : 0;

  const handleNumpadClick = (value: string) => {
    if (value === 'C') {
      setClosingBalance('');
    } else if (value === '⌫') {
      setClosingBalance((prev) => prev.slice(0, -1));
    } else if (value === '.') {
      if (!closingBalance.includes('.')) {
        setClosingBalance((prev) => prev + '.');
      }
    } else {
      setClosingBalance((prev) => prev + value);
    }
  };

  const handleConfirm = () => {
    const numAmount = parseFloat(closingBalance) || 0;
    onConfirm(numAmount);
    setClosingBalance('');
  };

  const numpadButtons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'];

  const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-warning" />
              Fechamento de Caixa
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          {/* Left - Summary */}
          <div className="space-y-4">
            <div className="p-4 bg-secondary rounded-xl space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground">RESUMO DO CAIXA</h3>
              
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm">Abertura</span>
                <span className="font-medium">{formatCurrency(register.openingBalance)}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-success" />
                  <span className="text-sm">Dinheiro</span>
                </div>
                <span className="font-medium text-success">{formatCurrency(register.totalCash - register.openingBalance)}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-primary" />
                  <span className="text-sm">PIX</span>
                </div>
                <span className="font-medium">{formatCurrency(register.totalPix)}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  <span className="text-sm">Crédito</span>
                </div>
                <span className="font-medium">{formatCurrency(register.totalCredit)}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-warning" />
                  <span className="text-sm">Débito</span>
                </div>
                <span className="font-medium">{formatCurrency(register.totalDebit)}</span>
              </div>

              {register.withdrawals.length > 0 && (
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-destructive">Sangrias</span>
                  <span className="font-medium text-destructive">
                    - {formatCurrency(register.withdrawals.reduce((sum, w) => sum + w.amount, 0))}
                  </span>
                </div>
              )}

              {register.deposits.length > 0 && (
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-success">Suprimentos</span>
                  <span className="font-medium text-success">
                    + {formatCurrency(register.deposits.reduce((sum, d) => sum + d.amount, 0))}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between py-2 pt-4">
                <span className="font-semibold">Total Vendas</span>
                <span className="text-xl font-bold text-primary">{formatCurrency(register.totalSales)}</span>
              </div>

              <div className="flex items-center justify-between py-2 bg-success/10 rounded-lg px-3">
                <span className="font-semibold">Esperado em Dinheiro</span>
                <span className="text-lg font-bold text-success">{formatCurrency(cashInRegister)}</span>
              </div>
            </div>
          </div>

          {/* Right - Input */}
          <div className="space-y-4">
            <div className="text-center p-4 bg-secondary rounded-xl">
              <p className="text-sm text-muted-foreground mb-2">Valor contado no caixa</p>
              <p className="text-4xl font-bold">
                R$ {closingBalance ? parseFloat(closingBalance).toFixed(2).replace('.', ',') : '0,00'}
              </p>
            </div>

            {closingBalance && (
              <div className={`text-center p-3 rounded-xl border ${
                difference === 0 
                  ? 'bg-success/10 border-success/30' 
                  : difference > 0 
                    ? 'bg-primary/10 border-primary/30' 
                    : 'bg-destructive/10 border-destructive/30'
              }`}>
                <p className="text-sm text-muted-foreground">Diferença</p>
                <p className={`text-xl font-bold ${
                  difference === 0 
                    ? 'text-success' 
                    : difference > 0 
                      ? 'text-primary' 
                      : 'text-destructive'
                }`}>
                  {difference >= 0 ? '+' : ''}{formatCurrency(difference)}
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

            <Button
              variant="warning"
              size="xl"
              className="w-full bg-warning text-warning-foreground hover:bg-warning/90"
              onClick={handleConfirm}
              disabled={!closingBalance}
            >
              Fechar Caixa
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
