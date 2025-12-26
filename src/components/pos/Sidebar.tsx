import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Users, 
  Settings,
  LogOut,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const menuItems = [
  { id: 'pos', label: 'Caixa', icon: ShoppingCart },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Produtos', icon: Package },
  { id: 'reports', label: 'Relatórios', icon: BarChart3 },
  { id: 'users', label: 'Usuários', icon: Users },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  return (
    <aside className="w-20 lg:w-72 h-screen glass-card rounded-none border-r border-border/30 flex flex-col">
      {/* Logo */}
      <div className="p-4 lg:p-6 border-b border-border/30">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-glow animate-glow-pulse">
            <Zap className="w-6 h-6 text-white" />
            <div className="absolute inset-0 rounded-2xl gradient-primary opacity-50 blur-xl" />
          </div>
          <div className="hidden lg:block">
            <h1 className="font-bold text-xl tracking-tight gradient-text">PDV Pro</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Sistema de Vendas</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                'w-full sidebar-item',
                isActive && 'active'
              )}
            >
              <Icon className="w-5 h-5 shrink-0 mx-auto lg:mx-0" />
              <span className="hidden lg:block font-medium">{item.label}</span>
              {isActive && (
                <div className="hidden lg:block ml-auto w-2 h-2 rounded-full bg-white/80" />
              )}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-border/30">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-11 h-11 rounded-xl gradient-accent flex items-center justify-center shadow-glow-accent">
            <span className="text-sm font-bold text-accent-foreground">JD</span>
          </div>
          <div className="hidden lg:block flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">João da Silva</p>
            <p className="text-xs text-muted-foreground">Operador</p>
          </div>
          <button className="hidden lg:flex p-2.5 rounded-xl hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-all duration-200 hover:-translate-y-0.5">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
