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
  UserCircle,
  ClipboardList,
  FileSpreadsheet
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
  children?: MenuItem[];
}

// Menu simplificado: ~15 itens organizados
const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pos', label: 'Caixa (PDV)', icon: ShoppingCart },
  { 
    id: 'cadastros', 
    label: 'Cadastros', 
    icon: ClipboardList,
    children: [
      { id: 'customers', label: 'Clientes', icon: UserCircle },
      { id: 'products', label: 'Produtos', icon: Package },
      { id: 'categories', label: 'Categorias', icon: Package },
      { id: 'suppliers', label: 'Fornecedores', icon: Building2 },
    ]
  },
  { 
    id: 'vendas', 
    label: 'Vendas', 
    icon: ShoppingCart,
    children: [
      { id: 'sales-history', label: 'Histórico', icon: ClipboardList },
      { id: 'quotes', label: 'Orçamentos', icon: FileSpreadsheet },
      { id: 'returns', label: 'Devoluções', icon: Package },
    ]
  },
  { 
    id: 'estoque', 
    label: 'Estoque', 
    icon: Warehouse,
    children: [
      { id: 'stock', label: 'Controle', icon: Warehouse },
      { id: 'stock-movements', label: 'Movimentações', icon: Package },
      { id: 'labels', label: 'Etiquetas', icon: Package },
    ]
  },
  { id: 'service-orders', label: 'Ordem de Serviço', icon: Wrench },
  { 
    id: 'financeiro', 
    label: 'Financeiro', 
    icon: DollarSign,
    children: [
      { id: 'cash-management', label: 'Caixa', icon: DollarSign },
      { id: 'accounts-payable', label: 'Contas a Pagar', icon: DollarSign },
      { id: 'accounts-receivable', label: 'Contas a Receber', icon: DollarSign },
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
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent',
                hasActiveChild && 'bg-sidebar-accent/50 text-sidebar-foreground'
              )}
            >
              <Icon className={cn("w-5 h-5 shrink-0", hasActiveChild && "text-primary")} />
              <span className="flex-1 text-left whitespace-nowrap">{item.label}</span>
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform duration-200",
                isOpen && "rotate-180"
              )} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
            <div className="pl-4 mt-1 space-y-1 border-l-2 border-sidebar-border ml-5">
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
          'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent',
          isActive && 'bg-sidebar-accent text-sidebar-foreground',
          isChild && 'py-1.5 text-xs',
          isCollapsed && 'justify-center px-0'
        )}
      >
        <Icon className={cn(
          "shrink-0", 
          isActive && "text-primary",
          isChild ? "w-4 h-4" : "w-5 h-5"
        )} />
        <span className={cn(
          "transition-all duration-300 whitespace-nowrap flex-1 text-left",
          isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
        )}>
          {item.label}
        </span>
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
          isCollapsed ? "w-16" : "w-56"
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
            {menuItems.map((item) => renderMenuItem(item))}
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
