import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Users, 
  Settings,
  LogOut,
  Store
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
    <aside className="w-20 lg:w-64 h-screen bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-4 lg:p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-[hsl(250,83%,60%)] flex items-center justify-center">
            <Store className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="hidden lg:block">
            <h1 className="font-bold text-lg">PDV Pro</h1>
            <p className="text-xs text-muted-foreground">Sistema de Vendas</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-glow'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              <Icon className="w-5 h-5 shrink-0 mx-auto lg:mx-0" />
              <span className="hidden lg:block font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            <span className="text-sm font-medium">JD</span>
          </div>
          <div className="hidden lg:block flex-1 min-w-0">
            <p className="font-medium text-sm truncate">João da Silva</p>
            <p className="text-xs text-muted-foreground">Operador</p>
          </div>
          <button className="hidden lg:flex p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
