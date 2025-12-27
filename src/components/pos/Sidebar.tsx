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
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ThemeToggle';

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
  const { profile, role, signOut } = useAuth();

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
    <aside className="w-20 lg:w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-4 lg:p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Store className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="hidden lg:block">
            <h1 className="font-semibold text-lg text-sidebar-foreground">PDV Express</h1>
            <p className="text-xs text-muted-foreground">Sistema de Vendas</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
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
              <span className="hidden lg:block">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Theme Toggle */}
      <div className="px-4 py-2 border-t border-sidebar-border flex justify-center lg:justify-start">
        <ThemeToggle />
        <span className="hidden lg:block ml-3 text-sm text-muted-foreground self-center">Tema</span>
      </div>

      {/* User */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-9 h-9 rounded-md bg-secondary flex items-center justify-center">
            <span className="text-sm font-medium text-secondary-foreground">
              {profile?.name ? getInitials(profile.name) : '??'}
            </span>
          </div>
          <div className="hidden lg:block flex-1 min-w-0">
            <p className="font-medium text-sm truncate text-sidebar-foreground">
              {profile?.name || 'Carregando...'}
            </p>
            <p className="text-xs text-muted-foreground">{getRoleLabel(role)}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="hidden lg:flex p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
