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
  Users,
  Settings,
  ClipboardList,
  TrendingUp,
  ChevronDown,
  Sparkles,
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
    <header className="h-16 min-h-[64px] shrink-0 bg-card border-b border-border flex items-center px-4 lg:px-6 gap-3 lg:gap-4 shadow-sm sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2 lg:gap-3 pr-4 lg:pr-6 border-r border-border shrink-0">
        <div className="relative">
          <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-2xl bg-primary flex items-center justify-center shadow-md">
            <Store className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-success flex items-center justify-center">
            <Sparkles className="w-2.5 h-2.5 text-success-foreground" />
          </div>
        </div>
        <div className="hidden xl:block">
          <span className="font-bold text-base">PDV Express</span>
          <span className="text-xs text-primary font-semibold ml-2 px-2 py-0.5 rounded-full bg-primary/10">Pro</span>
        </div>
      </div>

      {/* Caixa Button */}
      <button
        onClick={() => onNavigate('pos')}
        className={cn(
          "group relative flex items-center gap-2 px-4 lg:px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 shrink-0",
          currentPage === 'pos'
            ? "bg-primary text-primary-foreground shadow-md"
            : "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
        )}
      >
        <ShoppingCart className="w-5 h-5" />
        <span className="hidden sm:inline text-sm">Abrir Caixa</span>
      </button>

      {/* Navigation Sections - Desktop */}
      <NavigationMenu className="hidden md:flex ml-2">
        <NavigationMenuList className="gap-1">
          {navigationSections.map((section) => (
            <NavigationMenuItem key={section.id}>
              <NavigationMenuTrigger 
                className={cn(
                  "bg-transparent h-11 px-4 text-sm font-medium rounded-xl data-[state=open]:bg-muted/50 hover:bg-muted/50 transition-all",
                  isSectionActive(section) && "text-primary bg-primary/5"
                )}
              >
                {section.label}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="w-72 p-3 bg-card border border-border rounded-2xl shadow-xl">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={cn(
                          "w-full flex items-start gap-4 p-4 rounded-xl text-left transition-all duration-200",
                          isItemActive(item.id)
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted/50"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                          isItemActive(item.id) ? "bg-primary/20" : "bg-muted"
                        )}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm">{item.label}</div>
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
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-muted/50 transition-colors ml-2">
            Menu
            <ChevronDown className="w-4 h-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-60 p-2">
          {navigationSections.map((section, sectionIndex) => (
            <div key={section.id}>
              <div className="px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {section.label}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <DropdownMenuItem
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={cn(
                      "gap-3 cursor-pointer rounded-lg py-3",
                      isItemActive(item.id) && "bg-primary/10 text-primary"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </DropdownMenuItem>
                );
              })}
              {sectionIndex < navigationSections.length - 1 && (
                <DropdownMenuSeparator className="my-2" />
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
      <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl bg-muted border border-border shrink-0">
        <Clock className="w-4 h-4 text-primary" />
        <span className="tabular-nums font-semibold text-sm">{formatTime(currentTime)}</span>
      </div>

      {/* Notifications */}
      <NotificationCenter />

      {/* Theme Selector */}
      <ThemeSelector />

      {/* Theme Toggle */}
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="hidden sm:flex w-10 h-10 rounded-xl items-center justify-center hover:bg-muted transition-colors border border-border shrink-0"
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 text-warning" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </button>

      {/* User Menu - Premium */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 lg:gap-3 pl-3 lg:pl-4 border-l border-border hover:bg-muted rounded-r-xl transition-colors py-2 pr-2 shrink-0">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-sm font-bold border border-primary/20">
                {profile?.name ? getInitials(profile.name) : <User className="w-5 h-5" />}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-success border-2 border-card" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold leading-none">{profile?.name || 'Usuário'}</p>
              <p className="text-xs text-muted-foreground mt-1.5">{profile?.code || 'Operador'}</p>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 p-2">
          <DropdownMenuItem onClick={() => onNavigate('settings')} className="gap-3 py-3 rounded-lg cursor-pointer">
            <Settings className="w-4 h-4" />
            Configurações
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-2" />
          <DropdownMenuItem onClick={signOut} className="gap-3 py-3 rounded-lg cursor-pointer text-destructive focus:text-destructive">
            <LogOut className="w-4 h-4" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
