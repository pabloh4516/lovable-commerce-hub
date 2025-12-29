import { useState } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Users, 
  Settings,
  LogOut,
  Store,
  Warehouse,
  Tag,
  Building2,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Truck,
  Wrench,
  DollarSign,
  ShoppingBag,
  FileSpreadsheet,
  CreditCard,
  UserCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pos', label: 'Caixa (PDV)', icon: ShoppingCart },
  { id: 'products', label: 'Produtos', icon: Package },
  { id: 'stock', label: 'Estoque', icon: Warehouse },
  { id: 'customers', label: 'Clientes', icon: UserCircle },
  { id: 'suppliers', label: 'Fornecedores', icon: Truck },
  { id: 'quotes', label: 'Orçamentos', icon: FileSpreadsheet },
  { id: 'service-orders', label: 'Ordem de Serviço', icon: Wrench },
  { id: 'purchases', label: 'Compras', icon: ShoppingBag },
  { id: 'financial', label: 'Financeiro', icon: DollarSign },
  { id: 'promotions', label: 'Promoções', icon: Tag },
  { id: 'payment-methods', label: 'Formas de Pagamento', icon: CreditCard },
  { id: 'stores', label: 'Lojas', icon: Building2 },
  { id: 'reports', label: 'Relatórios', icon: BarChart3 },
  { id: 'audit', label: 'Auditoria', icon: FileText },
  { id: 'users', label: 'Usuários', icon: Users },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { profile, role, signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleLabel = (role: string | null) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'supervisor':
        return 'Supervisor';
      default:
        return 'Operador';
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside 
        className={cn(
          "h-screen bg-sidebar flex flex-col transition-all duration-300 ease-out relative shrink-0",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "absolute -right-3 top-6 w-6 h-6 rounded-full bg-sidebar-accent text-sidebar-foreground",
            "flex items-center justify-center shadow-md hover:bg-primary transition-colors z-10",
            "border border-sidebar-border"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Logo */}
        <div className={cn("p-4 border-b border-sidebar-border", isCollapsed && "px-2")}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "rounded-lg bg-primary flex items-center justify-center shrink-0",
              isCollapsed ? "w-10 h-10" : "w-10 h-10"
            )}>
              <Store className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className={cn(
              "transition-all duration-300 overflow-hidden",
              isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            )}>
              <h1 className="font-bold text-base text-sidebar-foreground whitespace-nowrap">PDV Express</h1>
              <p className="text-xs text-sidebar-foreground/60 whitespace-nowrap">Sistema de Vendas</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin">
          <div className="space-y-1 px-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              const button = (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent',
                    isActive && 'bg-sidebar-accent text-sidebar-foreground',
                    isCollapsed && 'justify-center px-0'
                  )}
                >
                  <Icon className={cn("w-5 h-5 shrink-0", isActive && "text-primary")} />
                  <span className={cn(
                    "transition-all duration-300 whitespace-nowrap flex-1 text-left",
                    isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
                  )}>
                    {item.label}
                  </span>
                  {!isCollapsed && (
                    <ChevronDown className={cn(
                      "w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity",
                      isActive && "opacity-50"
                    )} />
                  )}
                </button>
              );

              if (isCollapsed) {
                return (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>
                      {button}
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return button;
            })}
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-3 border-t border-sidebar-border">
          <div className={cn(
            "flex items-center gap-3 p-2 rounded-lg transition-all duration-200",
            isCollapsed && "justify-center p-2"
          )}>
            {/* Avatar */}
            <div className={cn(
              "relative shrink-0",
              isCollapsed ? "w-9 h-9" : "w-9 h-9"
            )}>
              <div className="w-full h-full rounded-lg flex items-center justify-center bg-primary">
                <span className="text-xs font-semibold text-primary-foreground">
                  {profile?.name ? getInitials(profile.name) : '??'}
                </span>
              </div>
              {/* Online indicator */}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-success rounded-full border-2 border-sidebar" />
            </div>
            
            {/* User Info */}
            <div className={cn(
              "flex-1 min-w-0 transition-all duration-300",
              isCollapsed ? "hidden" : "block"
            )}>
              <p className="font-medium text-sm truncate text-sidebar-foreground">
                {profile?.name || 'Carregando...'}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {getRoleLabel(role)}
              </p>
            </div>
            
            {/* Logout */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={handleLogout}
                  className={cn(
                    "p-2 rounded-lg text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors",
                    isCollapsed ? "hidden" : "flex"
                  )}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                Sair
              </TooltipContent>
            </Tooltip>
          </div>
          
          {/* Mobile Logout (collapsed) */}
          {isCollapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={handleLogout}
                  className="w-full mt-2 p-2 rounded-lg flex items-center justify-center text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                Sair
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}