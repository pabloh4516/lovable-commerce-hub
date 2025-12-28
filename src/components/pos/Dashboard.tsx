import { useMemo } from 'react';
import { 
  ShoppingCart, 
  DollarSign, 
  TrendingUp,
  Package,
  CalendarDays,
  LayoutDashboard
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

interface DashboardProps {
  stats: DashboardStats;
}

export function Dashboard({ stats }: DashboardProps) {
  const { data: salesData } = useSales();

  // Generate mock hourly data for chart
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

  // Generate sparkline data
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

  // Recent sales for table
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
    <div className="p-6 lg:p-8 space-y-8 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-glow">
            <LayoutDashboard className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Visão geral do seu negócio em tempo real
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/50 border border-border/50">
          <CalendarDays className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Vendas Hoje"
          value={stats.todaySales}
          icon={ShoppingCart}
          iconColor="text-primary"
          change={12.5}
          changeLabel="vs. ontem"
          sparklineData={generateSparkline('up')}
          delay={0}
        />
        <StatCard
          title="Faturamento"
          value={stats.todayRevenue}
          prefix="R$ "
          decimals={2}
          icon={DollarSign}
          iconColor="text-success"
          change={8.3}
          changeLabel="vs. ontem"
          sparklineData={generateSparkline('up')}
          delay={100}
        />
        <StatCard
          title="Ticket Médio"
          value={stats.averageTicket}
          prefix="R$ "
          decimals={2}
          icon={TrendingUp}
          iconColor="text-warning"
          change={-2.1}
          changeLabel="vs. ontem"
          sparklineData={generateSparkline('down')}
          delay={200}
        />
        <StatCard
          title="Produtos Vendidos"
          value={142}
          icon={Package}
          iconColor="text-primary"
          change={15.2}
          changeLabel="vs. ontem"
          sparklineData={generateSparkline('up')}
          delay={300}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart data={hourlyData} />
        </div>
        <PaymentMethodsChart 
          data={stats.salesByPaymentMethod}
          totalRevenue={stats.todayRevenue}
        />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopProductsList products={stats.topProducts} />
        <RecentSalesTable sales={recentSales} />
      </div>
    </div>
  );
}
