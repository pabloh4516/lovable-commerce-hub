import { useState, useEffect } from 'react';
import { 
  Store, 
  ShoppingCart,
  LayoutDashboard,
  Package,
  Boxes,
  Tags,
  User,
  Moon,
  Sun,
  LogOut,
  Clock,
  Building2,
  FileText,
  Users,
  Settings,
  ClipboardList,
  TrendingUp,
  ChevronDown,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { StoreSelector } from './StoreSelector';
import { GlobalSearch } from '@/components/GlobalSearch';
import { NotificationCenter } from '@/components/NotificationCenter';
import { ThemeSelector } from '@/components/ThemeSelector';

interface AppHeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navigationSections = [
  {
    id: 'vendas',
    label: 'Vendas',
    items: [
      { id: 'dashboard', label: 'Dashboard', description: 'Visão geral do dia', icon: LayoutDashboard },
    ]
  },
  {
    id: 'catalogo',
    label: 'Catálogo',
    items: [
      { id: 'products', label: 'Produtos', description: 'Gerenciar produtos', icon: Package },
      { id: 'promotions', label: 'Promoções', description: 'Ofertas e descontos', icon: Tags },
    ]
  },
  {
    id: 'gestao',
    label: 'Gestão',
    items: [
      { id: 'stock', label: 'Estoque', description: 'Status e movimentações', icon: Boxes },
    ]
  },
  {
    id: 'relatorios',
    label: 'Relatórios',
    items: [
      { id: 'reports', label: 'Vendas', description: 'Relatório de vendas', icon: TrendingUp },
      { id: 'audit', label: 'Auditoria', description: 'Log de ações', icon: ClipboardList },
    ]
  },
  {
    id: 'admin',
    label: 'Admin',
    items: [
      { id: 'stores', label: 'Lojas', description: 'Gerenciar lojas', icon: Building2 },
      { id: 'users', label: 'Usuários', description: 'Gerenciar equipe', icon: Users },
      { id: 'settings', label: 'Configurações', description: 'Sistema', icon: Settings },
    ]
  },
];

export function AppHeader({ currentPage, onNavigate }: AppHeaderProps) {
  const { theme, setTheme } = useTheme();
  const { profile, signOut } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const isItemActive = (itemId: string) => currentPage === itemId;

  const isSectionActive = (section: typeof navigationSections[0]) => {
    return section.items.some(item => item.id === currentPage);
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center px-5 gap-3">
      {/* Logo */}
      <div className="flex items-center gap-3 pr-5 border-r border-border">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
          <Store className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="font-semibold text-base hidden lg:block">PDV Express</span>
      </div>

      {/* Caixa Button - Highlighted */}
      <button
        onClick={() => onNavigate('pos')}
        className={cn(
          "flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ml-2",
          currentPage === 'pos'
            ? "bg-primary text-primary-foreground shadow-md"
            : "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
        )}
      >
        <ShoppingCart className="w-5 h-5" />
        <span className="text-sm">Caixa</span>
      </button>

      {/* Navigation Sections - Desktop */}
      <NavigationMenu className="hidden md:flex ml-2">
        <NavigationMenuList className="gap-0">
          {navigationSections.map((section) => (
            <NavigationMenuItem key={section.id}>
              <NavigationMenuTrigger 
                className={cn(
                  "bg-transparent h-10 px-4 text-sm font-medium data-[state=open]:bg-secondary",
                  isSectionActive(section) && "text-primary"
                )}
              >
                {section.label}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="w-64 p-2">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={cn(
                          "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors",
                          isItemActive(item.id)
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-secondary"
                        )}
                      >
                        <Icon className="w-5 h-5 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{item.label}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {item.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>

      {/* Mobile Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="md:hidden">
          <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-secondary transition-colors ml-2">
            Menu
            <ChevronDown className="w-4 h-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {navigationSections.map((section, sectionIndex) => (
            <div key={section.id}>
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {section.label}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <DropdownMenuItem
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={cn(
                      "gap-2 cursor-pointer",
                      isItemActive(item.id) && "bg-primary/10 text-primary"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </DropdownMenuItem>
                );
              })}
              {sectionIndex < navigationSections.length - 1 && (
                <DropdownMenuSeparator />
              )}
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Global Search */}
      <GlobalSearch onNavigate={onNavigate} />

      {/* Store Selector */}
      <div className="hidden lg:block">
        <StoreSelector />
      </div>

      {/* Time */}
      <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground px-2">
        <Clock className="w-4 h-4" />
        <span className="tabular-nums font-medium">{formatTime(currentTime)}</span>
      </div>

      {/* Notifications */}
      <NotificationCenter />

      {/* Theme Selector */}
      <ThemeSelector />

      {/* Theme Toggle */}
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-secondary transition-colors"
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </button>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-3 pl-4 border-l border-border">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
              {profile?.name ? getInitials(profile.name) : <User className="w-5 h-5" />}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium leading-none">{profile?.name || 'Usuário'}</p>
              <p className="text-xs text-muted-foreground mt-1">{profile?.code || ''}</p>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => onNavigate('settings')} className="gap-2">
            <Settings className="w-4 h-4" />
            Configurações
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut} className="gap-2 text-destructive focus:text-destructive">
            <LogOut className="w-4 h-4" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
