import { 
  TrendingUp, 
  ShoppingCart, 
  DollarSign, 
  Package,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { DashboardStats } from '@/types/pos';

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
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Faturamento',
      value: `R$ ${stats.todayRevenue.toFixed(2).replace('.', ',')}`,
      change: '+8.5%',
      positive: true,
      icon: DollarSign,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Ticket Médio',
      value: `R$ ${stats.averageTicket.toFixed(2).replace('.', ',')}`,
      change: '-2.3%',
      positive: false,
      icon: TrendingUp,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Produtos Vendidos',
      value: '142',
      change: '+15%',
      positive: true,
      icon: Package,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do seu negócio</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="stat-card animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm ${
                    stat.positive ? 'text-success' : 'text-destructive'
                  }`}
                >
                  {stat.positive ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {stat.change}
                </div>
              </div>
              <p className="text-2xl font-bold mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="stat-card">
          <h3 className="font-semibold mb-4">Produtos Mais Vendidos</h3>
          <div className="space-y-3">
            {stats.topProducts.map((item, index) => (
              <div
                key={item.product.id}
                className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg"
              >
                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    R$ {item.product.price.toFixed(2).replace('.', ',')}
                  </p>
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  {item.quantity} un
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sales by Payment Method */}
        <div className="stat-card">
          <h3 className="font-semibold mb-4">Vendas por Forma de Pagamento</h3>
          <div className="space-y-4">
            {stats.salesByPaymentMethod.map((item) => {
              const percentage = (item.total / stats.todayRevenue) * 100;
              const methodLabels = {
                pix: { label: 'PIX', color: 'bg-primary' },
                credit: { label: 'Crédito', color: 'bg-success' },
                debit: { label: 'Débito', color: 'bg-warning' },
                cash: { label: 'Dinheiro', color: 'bg-muted-foreground' },
              };
              const { label, color } = methodLabels[item.method];

              return (
                <div key={item.method}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{label}</span>
                    <span className="text-sm text-muted-foreground">
                      R$ {item.total.toFixed(2).replace('.', ',')} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full transition-all duration-500`}
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
