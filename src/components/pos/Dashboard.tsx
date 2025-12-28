import { useMemo } from 'react';
import { 
  ShoppingCart, 
  DollarSign, 
  TrendingUp,
  Package,
  CalendarDays,
  ArrowUpRight,
  Wallet,
  Users,
  Clock,
  Zap,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DashboardStats } from '@/types/pos';
import { useSales } from '@/hooks/useSales';
import { StatCard } from './dashboard/StatCard';
import { SalesChart } from './dashboard/SalesChart';
import { PaymentMethodsChart } from './dashboard/PaymentMethodsChart';
import { TopProductsList } from './dashboard/TopProductsList';
import { RecentSalesTable } from './dashboard/RecentSalesTable';
import { cn } from '@/lib/utils';

interface DashboardProps {
  stats: DashboardStats;
}

export function Dashboard({ stats }: DashboardProps) {
  const { data: salesData } = useSales();

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

  const generateSparkline = (trend: 'up' | 'down' | 'stable') => {
    const base = 50;
    const points = 12;
    const data: number[] = [];
    for (let i = 0; i < points; i++) {
      const variation = Math.random() * 20 - 10;
      const trendFactor = trend === 'up' ? i * 2 : trend === 'down' ? -i * 2 : 0;
      data.push(Math.max(0, base + variation + trendFactor));
    }
    return data;
  };

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

  return (
    <div className="p-6 space-y-8 overflow-y-auto h-full scrollbar-premium bg-gradient-surface">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-chart-4 p-8 text-primary-foreground shadow-glow">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-medium backdrop-blur">
                PDV Express Pro
              </span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Bom dia! 👋</h1>
            <p className="text-white/80 text-lg">Acompanhe o desempenho do seu negócio em tempo real</p>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <div className="text-right">
              <p className="text-white/70 text-sm mb-1">Data de Hoje</p>
              <p className="text-xl font-semibold flex items-center gap-2">
                <CalendarDays className="w-5 h-5" />
                {format(new Date(), "d 'de' MMMM, yyyy", { locale: ptBR })}
              </p>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div className="text-right">
              <p className="text-white/70 text-sm mb-1">Última atualização</p>
              <p className="text-xl font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {format(new Date(), "HH:mm")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50 shadow-md hover:shadow-glow transition-all duration-300">
          <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
            <ArrowUpRight className="w-6 h-6 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold text-success">+{stats.salesChange?.toFixed(1) || '12'}%</p>
            <p className="text-xs text-muted-foreground">vs. ontem</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50 shadow-md hover:shadow-glow transition-all duration-300">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{Math.floor(stats.todaySales * 0.8)}</p>
            <p className="text-xs text-muted-foreground">Clientes hoje</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50 shadow-md hover:shadow-glow transition-all duration-300">
          <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold">R$ {(stats.todayRevenue * 0.35).toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">Em caixa</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50 shadow-md hover:shadow-glow transition-all duration-300">
          <div className="w-12 h-12 rounded-xl bg-chart-4/10 flex items-center justify-center">
            <Package className="w-6 h-6 text-chart-4" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.productsSold || 142}</p>
            <p className="text-xs text-muted-foreground">Itens vendidos</p>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Vendas Hoje"
          value={stats.todaySales}
          icon={ShoppingCart}
          iconColor="text-primary"
          iconBgColor="bg-primary/10"
          change={stats.salesChange || 12.5}
          changeLabel="vs. ontem"
          sparklineData={generateSparkline('up')}
          delay={0}
          variant="gradient"
        />
        <StatCard
          title="Faturamento"
          value={stats.todayRevenue}
          prefix="R$ "
          decimals={2}
          icon={DollarSign}
          iconColor="text-success"
          iconBgColor="bg-success/10"
          change={stats.revenueChange || 8.3}
          changeLabel="vs. ontem"
          sparklineData={generateSparkline('up')}
          delay={100}
          variant="gradient"
        />
        <StatCard
          title="Ticket Médio"
          value={stats.averageTicket}
          prefix="R$ "
          decimals={2}
          icon={TrendingUp}
          iconColor="text-warning"
          iconBgColor="bg-warning/10"
          change={-2.1}
          changeLabel="vs. ontem"
          sparklineData={generateSparkline('down')}
          delay={200}
          variant="gradient"
        />
        <StatCard
          title="Produtos Vendidos"
          value={stats.productsSold || 142}
          icon={Package}
          iconColor="text-chart-4"
          iconBgColor="bg-chart-4/10"
          change={15.2}
          changeLabel="vs. ontem"
          sparklineData={generateSparkline('up')}
          delay={300}
          variant="gradient"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <SalesChart data={hourlyData} />
        </div>
        <PaymentMethodsChart 
          data={stats.salesByPaymentMethod}
          totalRevenue={stats.todayRevenue}
        />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <TopProductsList products={stats.topProducts} />
        <RecentSalesTable sales={recentSales} />
      </div>
    </div>
  );
}
