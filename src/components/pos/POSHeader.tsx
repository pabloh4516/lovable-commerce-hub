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
  PanelLeft
} from 'lucide-react';
import { CashRegister } from '@/types/pos';
import { POSModeToggle } from './POSModeToggle';
import { POSMode } from '@/hooks/usePOSMode';
import { StoreSelector } from './StoreSelector';

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
  // Fullscreen props
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
    <div className="h-14 bg-card border-b border-border flex items-center justify-between px-4">
      {/* Left - Navigation, Store and Register status */}
      <div className="flex items-center gap-4">
        {/* Menu button (when sidebar is hidden) */}
        {isSidebarHidden && onOpenNav && (
          <button
            onClick={onOpenNav}
            className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-secondary transition-colors"
            title="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {/* Sidebar toggle */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-secondary transition-colors"
            title={isSidebarHidden ? 'Mostrar sidebar (Ctrl+B)' : 'Ocultar sidebar (Ctrl+B)'}
          >
            {isSidebarHidden ? (
              <PanelLeft className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </button>
        )}

        {(isSidebarHidden || onToggleSidebar) && <div className="h-4 w-px bg-border" />}

        {/* Store Selector */}
        <StoreSelector />
        
        <div className="h-4 w-px bg-border" />

        {/* Mode Toggle */}
        <POSModeToggle mode={mode} onToggle={onToggleMode} />
        
        <div className="h-4 w-px bg-border" />

        {isOpen ? (
          <>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm font-medium">Caixa #{register?.number}</span>
            </div>
            <div className="h-4 w-px bg-border hidden md:block" />
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Aberto às {formatTime(register!.openedAt)}
            </div>
            <div className="h-4 w-px bg-border hidden lg:block" />
            <div className="hidden lg:flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-success" />
              <span className="text-muted-foreground">Em caixa:</span>
              <span className="font-medium text-success">{formatCurrency(register!.totalCash)}</span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 text-warning">
            <Lock className="h-4 w-4" />
            <span className="font-medium">Caixa Fechado</span>
          </div>
        )}
      </div>

      {/* Center - Sale number */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <div className="bg-secondary px-4 py-1.5 rounded-full">
          <span className="text-sm text-muted-foreground">Venda #</span>
          <span className="font-bold text-lg ml-1">{saleNumber.toString().padStart(6, '0')}</span>
        </div>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPriceCheck}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm hover:bg-secondary transition-colors"
        >
          <Search className="h-4 w-4" />
          <span className="hidden md:inline">Consulta (F2)</span>
        </button>

        {isOpen && (
          <>
            <button
              onClick={onWithdrawal}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <ArrowDownCircle className="h-4 w-4" />
              <span className="hidden xl:inline">Sangria (F10)</span>
            </button>
            <button
              onClick={onDeposit}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-success hover:bg-success/10 transition-colors"
            >
              <ArrowUpCircle className="h-4 w-4" />
              <span className="hidden xl:inline">Suprimento (F11)</span>
            </button>
          </>
        )}

        <div className="h-4 w-px bg-border" />

        <button
          onClick={onShowShortcuts}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm hover:bg-secondary transition-colors"
        >
          <Keyboard className="h-4 w-4" />
          <span className="hidden md:inline">Atalhos (F1)</span>
        </button>

        {/* Fullscreen toggle */}
        {onToggleFullscreen && (
          <>
            <div className="h-4 w-px bg-border" />
            <button
              onClick={onToggleFullscreen}
              className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-secondary transition-colors"
              title={isNativeFullscreen ? 'Sair da tela cheia (F11)' : 'Tela cheia (F11)'}
            >
              {isNativeFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </button>
          </>
        )}

        <div className="h-4 w-px bg-border" />

        {isOpen ? (
          <button
            onClick={onCloseRegister}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm bg-warning/10 text-warning hover:bg-warning/20 transition-colors font-medium"
          >
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Fechar Caixa</span>
          </button>
        ) : (
          <button
            onClick={onOpenRegister}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm bg-success text-success-foreground hover:bg-success/90 transition-colors font-medium"
          >
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Abrir Caixa</span>
          </button>
        )}
      </div>
    </div>
  );
}
