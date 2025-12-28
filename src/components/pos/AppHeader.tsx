import { useState, useEffect } from 'react';
import { 
  Store, 
  ShoppingCart,
  LayoutDashboard,
  Package,
  Boxes,
  Tags,
  MoreHorizontal,
  User,
  Moon,
  Sun,
  LogOut,
  Clock,
  Building2,
  FileText,
  Users,
  Settings,
  ClipboardList
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
import { StoreSelector } from './StoreSelector';

interface AppHeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const mainTabs = [
  { id: 'pos', label: 'Caixa', icon: ShoppingCart },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Produtos', icon: Package },
  { id: 'stock', label: 'Estoque', icon: Boxes },
  { id: 'promotions', label: 'Promoções', icon: Tags },
];

const moreTabs = [
  { id: 'stores', label: 'Lojas', icon: Building2 },
  { id: 'reports', label: 'Relatórios', icon: FileText },
  { id: 'audit', label: 'Auditoria', icon: ClipboardList },
  { id: 'users', label: 'Usuários', icon: Users },
  { id: 'settings', label: 'Configurações', icon: Settings },
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

  const isMoreActive = moreTabs.some(tab => tab.id === currentPage);

  return (
    <header className="h-14 bg-card border-b border-border flex items-center px-4 gap-6">
      {/* Logo */}
      <div className="flex items-center gap-2.5 pr-4 border-r border-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Store className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-semibold text-sm hidden sm:block">PDV Express</span>
      </div>

      {/* Main Tabs */}
      <nav className="flex items-center gap-1">
        {mainTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              currentPage === tab.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden md:block">{tab.label}</span>
          </button>
        ))}

        {/* More Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isMoreActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <MoreHorizontal className="w-4 h-4" />
              <span className="hidden md:block">Mais</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {moreTabs.map((tab) => (
              <DropdownMenuItem 
                key={tab.id} 
                onClick={() => onNavigate(tab.id)}
                className={cn(
                  "gap-2",
                  currentPage === tab.id && "bg-secondary"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Store Selector */}
      <div className="hidden lg:block">
        <StoreSelector />
      </div>

      {/* Time */}
      <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground">
        <Clock className="w-3.5 h-3.5" />
        <span className="tabular-nums">{formatTime(currentTime)}</span>
      </div>

      {/* Theme Toggle */}
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
      >
        {theme === 'dark' ? (
          <Sun className="w-4 h-4" />
        ) : (
          <Moon className="w-4 h-4" />
        )}
      </button>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 pl-3 border-l border-border">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
              {profile?.name ? getInitials(profile.name) : <User className="w-4 h-4" />}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium leading-none">{profile?.name || 'Usuário'}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{profile?.code || ''}</p>
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
