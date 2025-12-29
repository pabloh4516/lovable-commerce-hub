import { useMemo, useState } from 'react';
import { 
  ShoppingCart, 
  TrendingUp,
  TrendingDown,
  BarChart3,
  ArrowRight,
} from 'lucide-react';
import { DashboardStats } from '@/types/pos';
import { useSales } from '@/hooks/useSales';
import { useCashRegister } from '@/hooks/useCashRegister';
import { useAuth } from '@/hooks/useAuth';
import { SalesChart } from './dashboard/SalesChart';
import { AlertsPanel } from './AlertsPanel';
import { CashRegisterAlert } from './CashRegisterAlert';
import { DashboardStatCard } from './DashboardStatCard';
import { PageHeader } from './PageHeader';
import { OpenRegisterModal } from './OpenRegisterModal';
import { RecentSalesTable } from './dashboard/RecentSalesTable';
import { Button } from '@/components/ui/button';

interface DashboardProps {
  stats: DashboardStats;
  onNavigate?: (page: string) => void;
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

  // Sparkline data for each card
  const salesSparkline = useMemo(() => {
    return Array.from({ length: 7 }, () => Math.floor(Math.random() * 100) + 50);
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

  // Sample alerts for demonstration
  const alerts = useMemo(() => {
    const sampleAlerts = [];
    
    // Add a sample alert if there are no recent sales
    if (stats.todaySales === 0) {
      sampleAlerts.push({
        id: '1',
        type: 'info' as const,
        title: 'Sem vendas hoje',
        description: 'Nenhuma venda registrada até o momento',
        time: 'Agora'
      });
    }
    
    return sampleAlerts;
  }, [stats]);

  const handleOpenRegister = (amount: number) => {
    if (profile) {
      openRegister(amount, profile.id, profile.name);
      setShowOpenRegister(false);
    }
  };

  // Calculate monthly values (sample calculation)
  const monthlyRevenue = stats.todayRevenue * 30 * 0.8;
  const pendingReceivables = monthlyRevenue * 0.15;
  const pendingPayables = monthlyRevenue * 0.12;

  return (
    <div className="p-6 lg:p-8 space-y-8 overflow-y-auto h-full scrollbar-thin bg-background">
      {/* Page Header */}
      <PageHeader 
        title="Dashboard" 
        subtitle="Visão geral do seu negócio"
        onOpenPDV={() => onNavigate?.('pos')}
      />

      {/* Cash Register Alert */}
      {!isRegisterOpen && (
        <CashRegisterAlert onOpenRegister={() => setShowOpenRegister(true)} />
      )}

      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="animate-slide-up stagger-1 opacity-0" style={{ animationFillMode: 'forwards' }}>
          <DashboardStatCard
            title="Vendas Hoje"
            value={stats.todayRevenue}
            subtitle={`${stats.todaySales} vendas realizadas`}
            icon={ShoppingCart}
            variant="blue"
            prefix="R$ "
            decimals={2}
            trend={12}
          />
        </div>
        <div className="animate-slide-up stagger-2 opacity-0" style={{ animationFillMode: 'forwards' }}>
          <DashboardStatCard
            title="Vendas no Mês"
            value={monthlyRevenue}
            subtitle={`${Math.floor(stats.todaySales * 25)} vendas no mês`}
            icon={BarChart3}
            variant="green"
            prefix="R$ "
            decimals={2}
            trend={8}
          />
        </div>
        <div className="animate-slide-up stagger-3 opacity-0" style={{ animationFillMode: 'forwards' }}>
          <DashboardStatCard
            title="A Receber"
            value={pendingReceivables}
            subtitle="Pendente"
            icon={TrendingUp}
            variant="orange"
            prefix="R$ "
            decimals={2}
          />
        </div>
        <div className="animate-slide-up stagger-4 opacity-0" style={{ animationFillMode: 'forwards' }}>
          <DashboardStatCard
            title="A Pagar"
            value={pendingPayables}
            subtitle="Pendente"
            icon={TrendingDown}
            variant="pink"
            prefix="R$ "
            decimals={2}
          />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart data={hourlyData} />
        </div>
        <AlertsPanel alerts={alerts} />
      </div>

      {/* Recent Sales */}
      <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm">
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
