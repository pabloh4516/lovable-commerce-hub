import { useState } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Settings,
  LogOut,
  Store,
  Warehouse,
  Building2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  DollarSign,
  Wrench,
  Users,
  ClipboardList,
  FileText,
  RotateCcw,
  Tags,
  ArrowLeftRight,
  Receipt,
  CreditCard,
  Wallet
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  badge?: number;
  children?: MenuItem[];
}

// Menu simplificado com ícones únicos
const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pos', label: 'Caixa (PDV)', icon: ShoppingCart, badge: 0 },
  { 
    id: 'cadastros', 
    label: 'Cadastros', 
    icon: ClipboardList,
    children: [
      { id: 'customers', label: 'Clientes', icon: Users },
      { id: 'products', label: 'Produtos', icon: Package },
      { id: 'categories', label: 'Categorias', icon: Tags },
      { id: 'suppliers', label: 'Fornecedores', icon: Building2 },
    ]
  },
  { 
    id: 'vendas', 
    label: 'Vendas', 
    icon: Receipt,
    children: [
      { id: 'sales-history', label: 'Histórico', icon: ClipboardList },
      { id: 'quotes', label: 'Orçamentos', icon: FileText },
      { id: 'returns', label: 'Devoluções', icon: RotateCcw },
    ]
  },
  { 
    id: 'estoque', 
    label: 'Estoque', 
    icon: Warehouse,
    children: [
      { id: 'stock', label: 'Controle', icon: Package },
      { id: 'stock-movements', label: 'Movimentações', icon: ArrowLeftRight },
      { id: 'labels', label: 'Etiquetas', icon: Tags },
    ]
  },
  { id: 'service-orders', label: 'Ordem de Serviço', icon: Wrench },
  { 
    id: 'financeiro', 
    label: 'Financeiro', 
    icon: Wallet,
    children: [
      { id: 'cash-management', label: 'Caixa', icon: DollarSign },
      { id: 'accounts-payable', label: 'Contas a Pagar', icon: CreditCard },
      { id: 'accounts-receivable', label: 'Contas a Receber', icon: Receipt },
    ]
  },
  { id: 'reports', label: 'Relatórios', icon: BarChart3 },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { profile, role, signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>(['cadastros']);

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const isChildActive = (item: MenuItem) => {
    if (!item.children) return false;
    return item.children.some(child => child.id === currentPage);
  };

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

  const renderMenuItem = (item: MenuItem, isChild = false) => {
    const Icon = item.icon;
    const isActive = currentPage === item.id;
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openGroups.includes(item.id);
    const hasActiveChild = isChildActive(item);

    if (hasChildren && !isCollapsed) {
      return (
        <Collapsible
          key={item.id}
          open={isOpen}
          onOpenChange={() => toggleGroup(item.id)}
        >
          <CollapsibleTrigger asChild>
            <button
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent',
                hasActiveChild && 'bg-sidebar-accent/50 text-sidebar-foreground'
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0",
                hasActiveChild ? "bg-primary/20 text-primary" : "bg-sidebar-accent"
              )}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="flex-1 text-left whitespace-nowrap">{item.label}</span>
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform duration-200 text-sidebar-foreground/40",
                isOpen && "rotate-180"
              )} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
            <div className="pl-11 mt-1 space-y-0.5">
              {item.children?.map(child => renderMenuItem(child, true))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      );
    }

    const button = (
      <button
        onClick={() => onNavigate(item.id)}
        className={cn(
          'relative w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200',
          'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent',
          isActive && 'bg-sidebar-accent text-sidebar-foreground',
          isChild && 'py-2 text-[13px]',
          isCollapsed && 'justify-center px-2'
        )}
      >
        {/* Active indicator */}
        {isActive && !isChild && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-primary" />
        )}
        
        {!isChild ? (
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0",
            isActive ? "bg-primary text-primary-foreground" : "bg-sidebar-accent"
          )}>
            <Icon className="w-4 h-4" />
          </div>
        ) : (
          <div className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0 transition-colors",
            isActive ? "bg-primary" : "bg-sidebar-foreground/30"
          )} />
        )}
        
        <span className={cn(
          "transition-all duration-200 whitespace-nowrap flex-1 text-left",
          isCollapsed && !isChild ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
        )}>
          {item.label}
        </span>

        {/* Badge */}
        {item.badge !== undefined && item.badge > 0 && !isCollapsed && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary text-primary-foreground">
            {item.badge}
          </span>
        )}
      </button>
    );

    if (isCollapsed && !isChild) {
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

    return <div key={item.id}>{button}</div>;
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside 
        className={cn(
          "h-screen bg-sidebar flex flex-col transition-all duration-300 ease-out relative shrink-0",
          isCollapsed ? "w-[72px]" : "w-60"
        )}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "absolute -right-3 top-7 w-6 h-6 rounded-full bg-card text-muted-foreground",
            "flex items-center justify-center shadow-md hover:bg-primary hover:text-primary-foreground transition-all z-20",
            "border border-border"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Logo */}
        <div className={cn("p-4 border-b border-sidebar-border relative", isCollapsed && "px-3")}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shrink-0 shadow-lg shadow-primary/20",
              isCollapsed ? "w-10 h-10" : "w-11 h-11"
            )}>
              <Store className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className={cn(
              "transition-all duration-200 overflow-hidden",
              isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            )}>
              <h1 className="font-bold text-base text-sidebar-foreground whitespace-nowrap">PDV Express</h1>
              <p className="text-[11px] text-sidebar-foreground/50 whitespace-nowrap">Sistema de Vendas</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin relative">
          <div className="space-y-1 px-3">
            {menuItems.map((item) => renderMenuItem(item))}
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-3 border-t border-sidebar-border relative">
          <div className={cn(
            "flex items-center gap-3 p-2 rounded-xl transition-all duration-200",
            isCollapsed && "justify-center p-2"
          )}>
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className={cn(
                "rounded-xl flex items-center justify-center bg-gradient-to-br from-primary to-primary/80 shadow-md",
                isCollapsed ? "w-9 h-9" : "w-10 h-10"
              )}>
                <span className="text-xs font-semibold text-primary-foreground">
                  {profile?.name ? getInitials(profile.name) : '??'}
                </span>
              </div>
              {/* Online indicator */}
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-sidebar" />
            </div>
            
            {/* User Info */}
            <div className={cn(
              "flex-1 min-w-0 transition-all duration-200",
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
                    "p-2 rounded-lg text-sidebar-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all",
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
                  className="w-full mt-2 p-2 rounded-lg flex items-center justify-center text-sidebar-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all"
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
