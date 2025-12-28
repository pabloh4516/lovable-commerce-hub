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
    <div className="h-14 bg-card border-b border-border flex items-center justify-between px-5 gap-5">
      {/* Left - Register Status */}
      <div className="flex items-center gap-4">
        {isOpen ? (
          <>
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-success/10 text-success">
              <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
              <span className="font-semibold text-sm">Caixa #{register?.number}</span>
            </div>
            <span className="hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground tabular-nums bg-secondary px-3 py-1.5 rounded-lg">
              <DollarSign className="w-4 h-4" />
              {formatCurrency(register!.totalCash)}
            </span>
          </>
        ) : (
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-warning/10 text-warning">
            <Lock className="w-4 h-4" />
            <span className="font-semibold text-sm">Caixa Fechado</span>
          </div>
        )}
      </div>

      {/* Center - Sale number & Time */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span className="tabular-nums font-medium">{formatTime(currentTime)}</span>
        </div>
        <div className="flex items-center gap-2.5 px-4 py-2 bg-secondary rounded-xl">
          <span className="text-xs text-muted-foreground font-medium">Venda</span>
          <span className="font-bold tabular-nums text-base">{saleNumber.toString().padStart(6, '0')}</span>
        </div>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onPriceCheck}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium hover:bg-secondary transition-colors"
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:block">Consulta</span>
        </button>

        <button
          onClick={onShowShortcuts}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium hover:bg-secondary transition-colors"
        >
          <Keyboard className="w-4 h-4" />
          <span className="hidden sm:block">Atalhos</span>
        </button>

        {isOpen && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium hover:bg-secondary transition-colors">
                <DollarSign className="w-4 h-4" />
                <span className="hidden sm:block">Caixa</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onWithdrawal} className="gap-2.5 py-2.5">
                <ArrowDownCircle className="w-4 h-4 text-destructive" />
                Sangria
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDeposit} className="gap-2.5 py-2.5">
                <ArrowUpCircle className="w-4 h-4 text-success" />
                Suprimento
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onCloseRegister} className="gap-2.5 py-2.5">
                <Lock className="w-4 h-4 text-warning" />
                Fechar Caixa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {isOpen ? (
          <button
            onClick={onCloseRegister}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-warning/10 text-warning hover:bg-warning/20 transition-colors"
          >
            <Lock className="w-4 h-4" />
            <span className="hidden sm:block">Fechar</span>
          </button>
        ) : (
          <button
            onClick={onOpenRegister}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-success text-success-foreground hover:bg-success/90 transition-colors shadow-sm"
          >
            <DollarSign className="w-4 h-4" />
            <span className="hidden sm:block">Abrir Caixa</span>
          </button>
        )}
      </div>
    </div>
  );
}
