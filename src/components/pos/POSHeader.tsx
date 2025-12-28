import { useState, useEffect } from 'react';
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
  Zap,
  ChevronDown,
  Wallet,
  Activity
} from 'lucide-react';
import { CashRegister } from '@/types/pos';
import { POSModeToggle } from './POSModeToggle';
import { POSMode } from '@/hooks/usePOSMode';
import { StoreSelector } from './StoreSelector';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
  const [currentTime, setCurrentTime] = useState(new Date());

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatTimeWithSeconds = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="h-16 bg-gradient-to-r from-card via-card to-card/95 backdrop-blur-xl border-b border-border/50 flex items-center justify-between px-4 gap-4 shadow-sm">
        {/* Left - Navigation, Store and Register status */}
        <div className="flex items-center gap-2">
          {/* Menu button (when sidebar is hidden) */}
          {isSidebarHidden && onOpenNav && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onOpenNav}
                  className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-secondary/80 transition-all duration-200 hover:scale-105"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Menu</TooltipContent>
            </Tooltip>
          )}

          {/* Sidebar toggle */}
          {onToggleSidebar && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onToggleSidebar}
                  className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-secondary/80 transition-all duration-200 hover:scale-105"
                >
                  {isSidebarHidden ? (
                    <PanelLeft className="h-5 w-5" />
                  ) : (
                    <PanelLeftClose className="h-5 w-5" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>{isSidebarHidden ? 'Mostrar sidebar' : 'Ocultar sidebar'}</TooltipContent>
            </Tooltip>
          )}

          {(isSidebarHidden || onToggleSidebar) && <div className="h-8 w-px bg-border/50" />}

          {/* Store Selector */}
          <StoreSelector />
          
          <div className="h-8 w-px bg-border/50" />

          {/* Mode Toggle */}
          <POSModeToggle mode={mode} onToggle={onToggleMode} />
          
          <div className="h-8 w-px bg-border/50 hidden md:block" />

          {/* Register Status */}
          {isOpen ? (
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-success/10 border border-success/20">
                <div className="relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-success" />
                  <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-success animate-ping opacity-50" />
                </div>
                <span className="text-sm font-semibold text-success">Caixa #{register?.number}</span>
              </div>
              
              <div className="hidden lg:flex items-center gap-1.5 text-sm text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-xl">
                <Clock className="h-3.5 w-3.5" />
                <span className="tabular-nums">{formatTime(register!.openedAt)}</span>
              </div>
              
              <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-success/10 to-success/5 border border-success/20">
                <Wallet className="h-4 w-4 text-success" />
                <span className="font-bold text-success tabular-nums">{formatCurrency(register!.totalCash)}</span>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-warning/10 border border-warning/20">
              <Lock className="h-4 w-4 text-warning" />
              <span className="font-semibold text-warning text-sm">Caixa Fechado</span>
            </div>
          )}
        </div>

        {/* Center - Sale number & Real-time clock */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gradient-to-r from-secondary/80 to-secondary/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-border/50 shadow-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-sm font-medium tabular-nums">{formatTimeWithSeconds(currentTime)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm px-5 py-2 rounded-xl border border-primary/20 shadow-sm">
            <Activity className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm text-muted-foreground">Venda</span>
            <span className="font-bold text-lg tabular-nums text-primary">{saleNumber.toString().padStart(6, '0')}</span>
          </div>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-1.5">
          {/* Price Check */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onPriceCheck}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm hover:bg-secondary/80 transition-all duration-200 hover:scale-105"
              >
                <Search className="h-4 w-4" />
                <span className="hidden lg:inline font-medium">Consulta</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>Consulta de preço (F6)</TooltipContent>
          </Tooltip>

          {/* Cash Operations Dropdown */}
          {isOpen && (
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <button className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm hover:bg-secondary/80 transition-all duration-200 hover:scale-105">
                      <DollarSign className="h-4 w-4" />
                      <span className="hidden lg:inline font-medium">Caixa</span>
                      <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                    </button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>Operações de caixa</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={onWithdrawal} className="gap-2 text-destructive focus:text-destructive">
                  <ArrowDownCircle className="h-4 w-4" />
                  Sangria
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDeposit} className="gap-2 text-success focus:text-success">
                  <ArrowUpCircle className="h-4 w-4" />
                  Suprimento
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onCloseRegister} className="gap-2 text-warning focus:text-warning">
                  <Lock className="h-4 w-4" />
                  Fechar Caixa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <div className="h-8 w-px bg-border/50" />

          {/* Shortcuts */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onShowShortcuts}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm hover:bg-secondary/80 transition-all duration-200 hover:scale-105"
              >
                <Keyboard className="h-4 w-4" />
                <span className="hidden lg:inline font-medium">Atalhos</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>Atalhos do teclado (F1)</TooltipContent>
          </Tooltip>

          {/* Fullscreen toggle */}
          {onToggleFullscreen && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onToggleFullscreen}
                  className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-secondary/80 transition-all duration-200 hover:scale-105"
                >
                  {isNativeFullscreen ? (
                    <Minimize className="h-4 w-4" />
                  ) : (
                    <Maximize className="h-4 w-4" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>{isNativeFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}</TooltipContent>
            </Tooltip>
          )}

          <div className="h-8 w-px bg-border/50" />

          {/* Open/Close Register Button */}
          {isOpen ? (
            <button
              onClick={onCloseRegister}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
                "bg-warning/10 text-warning hover:bg-warning/20 border border-warning/30",
                "hover:shadow-md hover:scale-[1.02]"
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
                "bg-gradient-to-r from-success to-success/80 text-success-foreground",
                "hover:shadow-lg hover:shadow-success/25 hover:scale-[1.02]",
                "border border-success/20"
              )}
            >
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Abrir Caixa</span>
            </button>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
