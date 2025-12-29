import { useMemo, useState } from 'react';
import { 
  ShoppingCart, 
  TrendingUp,
  TrendingDown,
  BarChart3,
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
    <div className="p-6 space-y-6 overflow-y-auto h-full scrollbar-thin bg-background">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardStatCard
          title="Vendas Hoje"
          value={stats.todayRevenue}
          subtitle={`${stats.todaySales} vendas realizadas`}
          icon={ShoppingCart}
          variant="blue"
          prefix="R$ "
          decimals={2}
        />
        <DashboardStatCard
          title="Vendas no Mês"
          value={monthlyRevenue}
          subtitle={`${Math.floor(stats.todaySales * 25)} vendas no mês`}
          icon={BarChart3}
          variant="green"
          prefix="R$ "
          decimals={2}
        />
        <DashboardStatCard
          title="A Receber"
          value={pendingReceivables}
          subtitle="Pendente"
          icon={TrendingUp}
          variant="orange"
          prefix="R$ "
          decimals={2}
        />
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <SalesChart data={hourlyData} />
        </div>
        <AlertsPanel alerts={alerts} />
      </div>

      {/* Recent Sales */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-semibold text-foreground mb-4">Últimas Vendas</h3>
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