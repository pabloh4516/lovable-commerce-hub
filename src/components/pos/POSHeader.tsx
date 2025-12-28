import { useState, useEffect } from 'react';
import { 
  Clock, 
  DollarSign, 
  ArrowDownCircle, 
  ArrowUpCircle,
  Lock,
  Keyboard,
  Search,
  ChevronDown,
} from 'lucide-react';
import { CashRegister } from '@/types/pos';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface POSHeaderProps {
  register: CashRegister | null;
  saleNumber: number;
  mode: string;
  onToggleMode: () => void;
  onOpenRegister: () => void;
  onCloseRegister: () => void;
  onWithdrawal: () => void;
  onDeposit: () => void;
  onPriceCheck: () => void;
  onShowShortcuts: () => void;
  isSidebarHidden?: boolean;
  isNativeFullscreen?: boolean;
  onToggleSidebar?: () => void;
  onToggleFullscreen?: () => void;
  onOpenNav?: () => void;
}

export function POSHeader({
  register,
  saleNumber,
  onOpenRegister,
  onCloseRegister,
  onWithdrawal,
  onDeposit,
  onPriceCheck,
  onShowShortcuts,
}: POSHeaderProps) {
  const isOpen = register?.status === 'open';
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;

  return (
    <div className="h-12 bg-card border-b border-border flex items-center justify-between px-4 gap-4">
      {/* Left - Register Status */}
      <div className="flex items-center gap-3">
        {isOpen ? (
          <>
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-success/10 text-success text-sm">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="font-medium">Caixa #{register?.number}</span>
            </div>
            <span className="hidden md:block text-sm text-muted-foreground tabular-nums">
              {formatCurrency(register!.totalCash)}
            </span>
          </>
        ) : (
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-warning/10 text-warning text-sm">
            <Lock className="w-3.5 h-3.5" />
            <span className="font-medium">Caixa Fechado</span>
          </div>
        )}
      </div>

      {/* Center - Sale number & Time */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="tabular-nums text-muted-foreground">{formatTime(currentTime)}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-secondary rounded-lg">
          <span className="text-xs text-muted-foreground">Venda</span>
          <span className="font-semibold tabular-nums">{saleNumber.toString().padStart(6, '0')}</span>
        </div>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPriceCheck}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm hover:bg-secondary transition-colors"
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:block">Consulta</span>
        </button>

        <button
          onClick={onShowShortcuts}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm hover:bg-secondary transition-colors"
        >
          <Keyboard className="w-4 h-4" />
          <span className="hidden sm:block">Atalhos</span>
        </button>

        {isOpen && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm hover:bg-secondary transition-colors">
                <DollarSign className="w-4 h-4" />
                <span className="hidden sm:block">Caixa</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={onWithdrawal} className="gap-2">
                <ArrowDownCircle className="w-4 h-4 text-destructive" />
                Sangria
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDeposit} className="gap-2">
                <ArrowUpCircle className="w-4 h-4 text-success" />
                Suprimento
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onCloseRegister} className="gap-2">
                <Lock className="w-4 h-4 text-warning" />
                Fechar Caixa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {isOpen ? (
          <button
            onClick={onCloseRegister}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-warning/10 text-warning hover:bg-warning/20 transition-colors"
          >
            <Lock className="w-4 h-4" />
            <span className="hidden sm:block">Fechar</span>
          </button>
        ) : (
          <button
            onClick={onOpenRegister}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-success text-success-foreground hover:bg-success/90 transition-colors"
          >
            <DollarSign className="w-4 h-4" />
            <span className="hidden sm:block">Abrir Caixa</span>
          </button>
        )}
      </div>
    </div>
  );
}
