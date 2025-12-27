import { 
  Clock, 
  DollarSign, 
  ArrowDownCircle, 
  ArrowUpCircle,
  Lock,
  Keyboard,
  Search,
  Menu,
  Maximize,
  Minimize,
  PanelLeftClose,
  PanelLeft,
  Zap
} from 'lucide-react';
import { CashRegister } from '@/types/pos';
import { POSModeToggle } from './POSModeToggle';
import { POSMode } from '@/hooks/usePOSMode';
import { StoreSelector } from './StoreSelector';
import { cn } from '@/lib/utils';

interface POSHeaderProps {
  register: CashRegister | null;
  saleNumber: number;
  mode: POSMode;
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
  mode,
  onToggleMode,
  onOpenRegister,
  onCloseRegister,
  onWithdrawal,
  onDeposit,
  onPriceCheck,
  onShowShortcuts,
  isSidebarHidden = false,
  isNativeFullscreen = false,
  onToggleSidebar,
  onToggleFullscreen,
  onOpenNav,
}: POSHeaderProps) {
  const isOpen = register?.status === 'open';

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;

  return (
    <div className="h-16 bg-card/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-4 gap-4">
      {/* Left - Navigation, Store and Register status */}
      <div className="flex items-center gap-3">
        {/* Menu button (when sidebar is hidden) */}
        {isSidebarHidden && onOpenNav && (
          <button
            onClick={onOpenNav}
            className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-secondary transition-all duration-200"
            title="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {/* Sidebar toggle */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-secondary transition-all duration-200"
            title={isSidebarHidden ? 'Mostrar sidebar (Ctrl+B)' : 'Ocultar sidebar (Ctrl+B)'}
          >
            {isSidebarHidden ? (
              <PanelLeft className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </button>
        )}

        {(isSidebarHidden || onToggleSidebar) && <div className="h-6 w-px bg-border" />}

        {/* Store Selector */}
        <StoreSelector />
        
        <div className="h-6 w-px bg-border" />

        {/* Mode Toggle */}
        <POSModeToggle mode={mode} onToggle={onToggleMode} />
        
        <div className="h-6 w-px bg-border hidden md:block" />

        {isOpen ? (
          <>
            <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-success/10">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm font-semibold text-success">Caixa #{register?.number}</span>
            </div>
            <div className="h-6 w-px bg-border hidden lg:block" />
            <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Aberto às {formatTime(register!.openedAt)}
            </div>
            <div className="h-6 w-px bg-border hidden xl:block" />
            <div className="hidden xl:flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-success" />
              <span className="text-muted-foreground">Em caixa:</span>
              <span className="font-bold text-success">{formatCurrency(register!.totalCash)}</span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-warning/10">
            <Lock className="h-4 w-4 text-warning" />
            <span className="font-semibold text-warning text-sm">Caixa Fechado</span>
          </div>
        )}
      </div>

      {/* Center - Sale number */}
      <div className="absolute left-1/2 -translate-x-1/2 hidden sm:block">
        <div className="flex items-center gap-2 bg-secondary/80 backdrop-blur px-5 py-2 rounded-full border border-border/50">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">Venda</span>
          <span className="font-bold text-lg tabular-nums">{saleNumber.toString().padStart(6, '0')}</span>
        </div>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPriceCheck}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm hover:bg-secondary transition-all duration-200"
        >
          <Search className="h-4 w-4" />
          <span className="hidden md:inline font-medium">Consulta</span>
        </button>

        {isOpen && (
          <>
            <button
              onClick={onWithdrawal}
              className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-all duration-200"
            >
              <ArrowDownCircle className="h-4 w-4" />
              <span className="hidden xl:inline font-medium">Sangria</span>
            </button>
            <button
              onClick={onDeposit}
              className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-success hover:bg-success/10 transition-all duration-200"
            >
              <ArrowUpCircle className="h-4 w-4" />
              <span className="hidden xl:inline font-medium">Suprimento</span>
            </button>
          </>
        )}

        <div className="h-6 w-px bg-border" />

        <button
          onClick={onShowShortcuts}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm hover:bg-secondary transition-all duration-200"
        >
          <Keyboard className="h-4 w-4" />
          <span className="hidden md:inline font-medium">Atalhos</span>
        </button>

        {/* Fullscreen toggle */}
        {onToggleFullscreen && (
          <>
            <div className="h-6 w-px bg-border" />
            <button
              onClick={onToggleFullscreen}
              className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-secondary transition-all duration-200"
              title={isNativeFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
            >
              {isNativeFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </button>
          </>
        )}

        <div className="h-6 w-px bg-border" />

        {isOpen ? (
          <button
            onClick={onCloseRegister}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
              "bg-warning/10 text-warning hover:bg-warning/20 border border-warning/20"
            )}
          >
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Fechar</span>
          </button>
        ) : (
          <button
            onClick={onOpenRegister}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
              "bg-gradient-to-r from-success to-success/90 text-success-foreground hover:shadow-lg hover:scale-[1.02]"
            )}
          >
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Abrir Caixa</span>
          </button>
        )}
      </div>
    </div>
  );
}
