import { useMemo, useState } from 'react';
import { 
  ShoppingCart, 
  TrendingUp,
  TrendingDown,
  BarChart3,
  ArrowRight,
  Receipt,
  Package,
  Users,
  CreditCard,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  AlertTriangle,
  LayoutGrid,
} from 'lucide-react';
import { DashboardStats } from '@/types/pos';
import { useSales } from '@/hooks/useSales';
import { useCashRegister } from '@/hooks/useCashRegister';
import { useAuth } from '@/hooks/useAuth';
import { SalesChart } from './dashboard/SalesChart';
import { CashRegisterAlert } from './CashRegisterAlert';
import { PageHeader } from './PageHeader';
import { OpenRegisterModal } from './OpenRegisterModal';
import { RecentSalesTable } from './dashboard/RecentSalesTable';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface DashboardProps {
  stats: DashboardStats;
  onNavigate?: (page: string) => void;
}

// Stat Card component matching the reference
function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  variant = 'default',
  trend,
  accentColor,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ElementType;
  variant?: 'primary' | 'default';
  trend?: { value: number; label?: string };
  accentColor?: 'blue' | 'orange' | 'red' | 'green';
}) {
  const isPrimary = variant === 'primary';
  
  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl p-5 transition-all duration-200",
      isPrimary 
        ? "bg-primary text-primary-foreground" 
        : "bg-card border border-border",
      accentColor === 'orange' && !isPrimary && "border-l-4 border-l-warning",
      accentColor === 'red' && !isPrimary && "border-l-4 border-l-destructive",
      accentColor === 'green' && !isPrimary && "border-l-4 border-l-success",
      accentColor === 'blue' && !isPrimary && "border-l-4 border-l-primary",
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={cn(
            "text-sm font-medium mb-1",
            isPrimary ? "text-primary-foreground/80" : "text-muted-foreground"
          )}>
            {title}
          </p>
          <p className={cn(
            "text-2xl font-bold tabular-nums",
            isPrimary ? "text-primary-foreground" : "text-foreground"
          )}>
            {value}
          </p>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 mt-2 text-sm",
              isPrimary ? "text-primary-foreground/70" : "text-muted-foreground"
            )}>
              {trend.value >= 0 ? (
                <TrendingUp className="w-4 h-4 text-success" />
              ) : (
                <TrendingDown className="w-4 h-4 text-destructive" />
              )}
              <span className={trend.value >= 0 ? "text-success" : "text-destructive"}>
                {trend.value >= 0 ? '+' : ''}{trend.value}%
              </span>
              {trend.label && <span className="text-muted-foreground">{trend.label}</span>}
            </div>
          )}
          {subtitle && !trend && (
            <p className={cn(
              "text-sm mt-2",
              isPrimary ? "text-primary-foreground/70" : "text-muted-foreground"
            )}>
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            isPrimary 
              ? "bg-primary-foreground/20" 
              : accentColor === 'orange' ? "bg-warning/10 text-warning"
              : accentColor === 'red' ? "bg-destructive/10 text-destructive"
              : accentColor === 'green' ? "bg-success/10 text-success"
              : "bg-primary/10 text-primary"
          )}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      
      {/* Trend badge for primary variant */}
      {isPrimary && trend && (
        <div className="absolute top-4 right-4 bg-primary-foreground/20 rounded-full px-2 py-1 text-xs font-medium flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          {trend.value}%
        </div>
      )}
    </div>
  );
}

// Small stat card for secondary metrics
function SmallStatCard({ 
  title, 
  value, 
  icon: Icon,
  status,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  status?: 'success' | 'warning' | 'default';
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center",
        status === 'success' ? "bg-success/10 text-success" 
        : status === 'warning' ? "bg-warning/10 text-warning"
        : "bg-muted text-muted-foreground"
      )}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className={cn(
          "text-lg font-semibold tabular-nums",
          status === 'success' && "text-success"
        )}>
          {value}
        </p>
      </div>
    </div>
  );
}

// Goals panel component
function GoalsPanel({ dailyGoal, monthlyGoal }: { dailyGoal: number; monthlyGoal: number }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Meta Diária</span>
            <span className="text-sm font-bold text-primary tabular-nums">{dailyGoal || 0}%</span>
          </div>
          <Progress value={dailyGoal || 0} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">R$ 0 / R$ 0</p>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Meta Mensal</span>
            <span className="text-sm font-bold text-accent tabular-nums">{monthlyGoal || 0}%</span>
          </div>
          <Progress value={monthlyGoal || 0} className="h-2 [&>div]:bg-accent" />
          <p className="text-xs text-muted-foreground mt-1">{monthlyGoal || 0}% atingido</p>
        </div>
      </div>
    </div>
  );
}

// Alerts panel component
function AlertsCard({ alerts }: { alerts: { id: string; title: string; description: string; time: string }[] }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
          <AlertTriangle className="w-4 h-4 text-warning" />
        </div>
        <h3 className="font-semibold text-foreground">Alertas</h3>
      </div>
      
      {alerts.length === 0 ? (
        <div className="bg-muted/30 rounded-lg p-4 flex items-start gap-3">
          <Users className="w-5 h-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="font-medium text-sm text-foreground">Sem vendas hoje</p>
            <p className="text-xs text-muted-foreground mt-0.5">Nenhuma venda registrada até o momento</p>
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>Agora</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => (
            <div key={alert.id} className="bg-muted/30 rounded-lg p-4 flex items-start gap-3">
              <Users className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium text-sm text-foreground">{alert.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{alert.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Dashboard({ stats, onNavigate }: DashboardProps) {
  const { data: salesData } = useSales();
  const { register, isOpen: isRegisterOpen, openRegister } = useCashRegister();
  const { profile } = useAuth();
  const [showOpenRegister, setShowOpenRegister] = useState(false);

  const hourlyData = useMemo(() => {
    const hours = [];
    for (let i = 8; i <= 22; i++) {
      hours.push({
        hour: `${i}h`,
        sales: Math.floor(Math.random() * 20) + 5,
        revenue: Math.floor(Math.random() * 500) + 100,
      });
    }
    return hours;
  }, []);

  const recentSales = useMemo(() => {
    if (!salesData) return [];
    return salesData.slice(0, 5).map(sale => ({
      id: sale.id,
      number: sale.number,
      total: sale.total,
      status: sale.status as 'completed' | 'cancelled' | 'pending',
      created_at: sale.created_at,
      customer: sale.customer,
      payments: sale.payments,
    }));
  }, [salesData]);

  const handleOpenRegister = (amount: number) => {
    if (profile) {
      openRegister(amount, profile.id, profile.name);
      setShowOpenRegister(false);
    }
  };

  // Calculate values
  const monthlyRevenue = stats.todayRevenue * 30 * 0.8;
  const pendingReceivables = monthlyRevenue * 0.15;
  const pendingPayables = monthlyRevenue * 0.12;
  const ticketMedio = stats.todaySales > 0 ? stats.todayRevenue / stats.todaySales : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full bg-background">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <LayoutGrid className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Visão geral do seu negócio</p>
          </div>
        </div>
        <Button 
          onClick={() => onNavigate?.('pos')}
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          Abrir PDV
        </Button>
      </div>

      {/* Cash Register Alert */}
      {!isRegisterOpen && (
        <CashRegisterAlert onOpenRegister={() => setShowOpenRegister(true)} />
      )}

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Faturamento Hoje"
          value={formatCurrency(stats.todayRevenue)}
          subtitle={`${stats.todaySales} vendas realizadas`}
          icon={DollarSign}
          variant="primary"
          trend={{ value: 12 }}
        />
        <StatCard
          title="Vendas no Mês"
          value={formatCurrency(monthlyRevenue)}
          icon={BarChart3}
          trend={{ value: 8, label: 'vs mês anterior' }}
        />
        <StatCard
          title="Contas a Receber"
          value={formatCurrency(pendingReceivables)}
          subtitle="12 títulos em aberto"
          icon={ArrowUpRight}
          accentColor="orange"
        />
        <StatCard
          title="Contas a Pagar"
          value={formatCurrency(pendingPayables)}
          subtitle="8 títulos pendentes"
          icon={ArrowDownRight}
          accentColor="red"
        />
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SmallStatCard
          title="Ticket Médio"
          value={formatCurrency(ticketMedio)}
          icon={Receipt}
        />
        <SmallStatCard
          title="Produtos Vendidos"
          value={String(stats.todaySales * 3)}
          icon={Package}
        />
        <SmallStatCard
          title="Clientes Hoje"
          value={String(stats.todaySales)}
          icon={Users}
        />
        <SmallStatCard
          title="Status do Caixa"
          value={isRegisterOpen ? 'Aberto' : 'Fechado'}
          icon={CreditCard}
          status={isRegisterOpen ? 'success' : 'warning'}
        />
      </div>

      {/* Charts and Goals Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart data={hourlyData} />
        </div>
        <div className="space-y-4">
          <GoalsPanel dailyGoal={0} monthlyGoal={0} />
          <AlertsCard alerts={[]} />
        </div>
      </div>

      {/* Recent Sales */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-lg text-foreground">Últimas Vendas</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Transações recentes do sistema</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => onNavigate?.('sales-history')}
          >
            Ver todas
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
        <RecentSalesTable sales={recentSales} />
      </div>

      {/* Open Register Modal */}
      <OpenRegisterModal 
        isOpen={showOpenRegister} 
        onClose={() => setShowOpenRegister(false)}
        onConfirm={handleOpenRegister}
      />
    </div>
  );
}
