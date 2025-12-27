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
  FileText
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
  { id: 'stock', label: 'Estoque', icon: Warehouse },
  { id: 'promotions', label: 'Promoções', icon: Tag },
  { id: 'stores', label: 'Lojas', icon: Building2 },
  { id: 'reports', label: 'Relatórios', icon: BarChart3 },
  { id: 'audit', label: 'Auditoria', icon: FileText },
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
    <aside className="w-20 lg:w-64 h-screen bg-sidebar flex flex-col">
      {/* Logo */}
      <div className="p-4 lg:p-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-glow">
            <Store className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="hidden lg:block">
            <h1 className="font-bold text-lg text-sidebar-foreground">PDV Express</h1>
            <p className="text-xs text-sidebar-foreground/50">Sistema de Vendas</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto scrollbar-thin">
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
      <div className="px-4 py-3 border-t border-sidebar-border flex justify-center lg:justify-start items-center gap-3">
        <ThemeToggle />
        <span className="hidden lg:block text-sm text-sidebar-foreground/60">Tema</span>
      </div>

      {/* User */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sidebar-accent to-sidebar-accent/80 flex items-center justify-center">
            <span className="text-sm font-semibold text-sidebar-foreground">
              {profile?.name ? getInitials(profile.name) : '??'}
            </span>
          </div>
          <div className="hidden lg:block flex-1 min-w-0">
            <p className="font-medium text-sm truncate text-sidebar-foreground">
              {profile?.name || 'Carregando...'}
            </p>
            <p className="text-xs text-sidebar-foreground/50">{getRoleLabel(role)}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="hidden lg:flex p-2.5 rounded-xl hover:bg-sidebar-accent text-sidebar-foreground/60 hover:text-sidebar-foreground transition-all duration-200"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
