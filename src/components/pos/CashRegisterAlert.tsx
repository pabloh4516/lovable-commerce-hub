import { Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CashRegisterAlertProps {
  onOpenRegister: () => void;
}

export function CashRegisterAlert({ onOpenRegister }: CashRegisterAlertProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-alert-banner border border-alert-border">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-alert-icon flex items-center justify-center">
          <Receipt className="w-5 h-5 text-alert-text" />
        </div>
        <div>
          <p className="font-medium text-alert-text">Caixa não aberto</p>
          <p className="text-sm text-alert-text/70">Você precisa abrir o caixa para iniciar as vendas</p>
        </div>
      </div>
      <Button 
        onClick={onOpenRegister}
        className="bg-alert-button hover:bg-alert-button/90 text-alert-button-text"
      >
        Abrir Caixa
      </Button>
    </div>
  );
}