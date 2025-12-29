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
  Moon,
  Sun,
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
import { useTheme } from 'next-themes';
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
  { id: 'pos', label: 'Caixa', icon: ShoppingCart },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
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
  const { theme, setTheme } = useTheme();
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

  const getRoleColor = (role: string | null) => {
    switch (role) {
      case 'admin':
        return 'from-primary to-primary/80';
      case 'supervisor':
        return 'from-warning to-warning/80';
      default:
        return 'from-success to-success/80';
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside 
        className={cn(
          "h-screen bg-sidebar flex flex-col transition-all duration-300 ease-out relative",
          isCollapsed ? "w-20" : "w-72"
        )}
      >
        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "absolute -right-3 top-8 w-6 h-6 rounded-full bg-primary text-primary-foreground",
            "flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10",
            "border-2 border-background"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Logo */}
        <div className={cn("p-5 transition-all duration-300", isCollapsed && "px-3")}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-glow transition-all duration-300",
              isCollapsed ? "w-12 h-12" : "w-12 h-12"
            )}>
              <Store className={cn("text-primary-foreground transition-all", isCollapsed ? "w-6 h-6" : "w-6 h-6")} />
            </div>
            <div className={cn(
              "transition-all duration-300 overflow-hidden",
              isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            )}>
              <h1 className="font-bold text-lg text-sidebar-foreground whitespace-nowrap">PDV Express</h1>
              <p className="text-xs text-sidebar-foreground/50 whitespace-nowrap">Sistema de Vendas</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto scrollbar-thin">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            const button = (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  'w-full sidebar-item',
                  isActive && 'active',
                  isCollapsed && 'justify-center px-0'
                )}
              >
                <Icon className={cn("w-5 h-5 shrink-0", isCollapsed && "mx-0")} />
                <span className={cn(
                  "transition-all duration-300 whitespace-nowrap",
                  isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
                )}>
                  {item.label}
                </span>
                {isActive && !isCollapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground" />
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
        </nav>

        {/* Theme Toggle */}
        <div className={cn(
          "px-3 py-3 border-t border-sidebar-border",
          isCollapsed && "flex justify-center"
        )}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggleTheme}
                className={cn(
                  "flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200",
                  "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                  isCollapsed && "w-12 px-0 justify-center"
                )}
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
                <span className={cn(
                  "text-sm font-medium transition-all duration-300",
                  isCollapsed ? "hidden" : "block"
                )}>
                  {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
                </span>
              </button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">
                {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
              </TooltipContent>
            )}
          </Tooltip>
        </div>

        {/* User Profile */}
        <div className="p-3 border-t border-sidebar-border">
          <div className={cn(
            "flex items-center gap-3 p-3 rounded-xl bg-sidebar-accent/50 transition-all duration-200",
            isCollapsed && "justify-center p-2"
          )}>
            {/* Avatar */}
            <div className={cn(
              "relative shrink-0",
              isCollapsed ? "w-10 h-10" : "w-11 h-11"
            )}>
              <div className={cn(
                "w-full h-full rounded-xl flex items-center justify-center bg-gradient-to-br",
                getRoleColor(role)
              )}>
                <span className={cn(
                  "font-semibold text-white",
                  isCollapsed ? "text-xs" : "text-sm"
                )}>
                  {profile?.name ? getInitials(profile.name) : '??'}
                </span>
              </div>
              {/* Online indicator */}
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-sidebar" />
            </div>
            
            {/* User Info */}
            <div className={cn(
              "flex-1 min-w-0 transition-all duration-300",
              isCollapsed ? "hidden" : "block"
            )}>
              <p className="font-medium text-sm truncate text-sidebar-foreground">
                {profile?.name || 'Carregando...'}
              </p>
              <p className="text-xs text-sidebar-foreground/50 truncate">
                {getRoleLabel(role)}
              </p>
            </div>
            
            {/* Logout */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={handleLogout}
                  className={cn(
                    "p-2.5 rounded-xl text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-all duration-200",
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
                  className="w-full mt-2 p-2.5 rounded-xl flex items-center justify-center text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
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
