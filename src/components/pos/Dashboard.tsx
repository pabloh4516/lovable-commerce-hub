import { 
  TrendingUp, 
  ShoppingCart, 
  DollarSign, 
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles
} from 'lucide-react';
import { DashboardStats } from '@/types/pos';
import { cn } from '@/lib/utils';

interface DashboardProps {
  stats: DashboardStats;
}

export function Dashboard({ stats }: DashboardProps) {
  const statCards = [
    {
      title: 'Vendas Hoje',
      value: stats.todaySales.toString(),
      change: '+12%',
      positive: true,
      icon: ShoppingCart,
      gradient: 'from-primary to-primary/80',
    },
    {
      title: 'Faturamento',
      value: `R$ ${stats.todayRevenue.toFixed(2).replace('.', ',')}`,
      change: '+8.5%',
      positive: true,
      icon: DollarSign,
      gradient: 'from-success to-success/80',
    },
    {
      title: 'Ticket Médio',
      value: `R$ ${stats.averageTicket.toFixed(2).replace('.', ',')}`,
      change: '-2.3%',
      positive: false,
      icon: TrendingUp,
      gradient: 'from-warning to-warning/80',
    },
    {
      title: 'Produtos Vendidos',
      value: '142',
      change: '+15%',
      positive: true,
      icon: Package,
      gradient: 'from-primary to-primary/80',
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fade-in overflow-y-auto h-full">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
          </div>
          <p className="text-muted-foreground">Visão geral do seu negócio em tempo real</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="stat-card hover-lift animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  `bg-gradient-to-br ${stat.gradient}`
                )}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1 text-sm font-semibold px-2.5 py-1 rounded-full",
                    stat.positive 
                      ? 'text-success bg-success/10' 
                      : 'text-destructive bg-destructive/10'
                  )}
                >
                  {stat.positive ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  )}
                  {stat.change}
                </div>
              </div>
              <p className="text-3xl font-bold mb-1 tabular-nums">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-bold text-lg">Produtos Mais Vendidos</h3>
          </div>
          <div className="space-y-3">
            {stats.topProducts.map((item, index) => (
              <div
                key={item.product.id}
                className="flex items-center gap-4 p-3 bg-secondary/50 rounded-xl transition-all duration-200 hover:bg-secondary animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold",
                  index === 0 ? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-white" :
                  index === 1 ? "bg-gradient-to-br from-gray-300 to-gray-400 text-white" :
                  index === 2 ? "bg-gradient-to-br from-amber-600 to-amber-700 text-white" :
                  "bg-muted text-muted-foreground"
                )}>
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{item.product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    R$ {item.product.price.toFixed(2).replace('.', ',')}
                  </p>
                </div>
                <span className="text-sm font-bold text-primary tabular-nums">
                  {item.quantity} un
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sales by Payment Method */}
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-success" />
            </div>
            <h3 className="font-bold text-lg">Vendas por Forma de Pagamento</h3>
          </div>
          <div className="space-y-5">
            {stats.salesByPaymentMethod.map((item, index) => {
              const percentage = (item.total / stats.todayRevenue) * 100;
              const methodLabels: Record<string, { label: string; color: string; bg: string }> = {
                pix: { label: 'PIX', color: 'bg-primary', bg: 'bg-primary/10 text-primary' },
                credit: { label: 'Crédito', color: 'bg-success', bg: 'bg-success/10 text-success' },
                debit: { label: 'Débito', color: 'bg-warning', bg: 'bg-warning/10 text-warning' },
                cash: { label: 'Dinheiro', color: 'bg-muted-foreground', bg: 'bg-muted text-muted-foreground' },
              };
              const config = methodLabels[item.method] || methodLabels.cash;

              return (
                <div 
                  key={item.method}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={cn("px-2.5 py-1 rounded-lg text-xs font-semibold", config.bg)}>
                        {config.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold tabular-nums">
                        R$ {item.total.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-xs text-muted-foreground w-10 text-right tabular-nums">
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700 ease-out", config.color)}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
