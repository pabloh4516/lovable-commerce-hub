import { 
  Area, 
  AreaChart, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  ResponsiveContainer,
  Bar,
  BarChart,
  Line,
  ComposedChart,
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { TrendingUp, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface SalesChartProps {
  data: { hour: string; sales: number; revenue: number }[];
}

const chartConfig = {
  sales: {
    label: 'Vendas',
    color: 'hsl(var(--chart-1))',
  },
  revenue: {
    label: 'Faturamento',
    color: 'hsl(var(--chart-2))',
  },
};

type ChartType = 'area' | 'bar' | 'composed';

export function SalesChart({ data }: SalesChartProps) {
  const [chartType, setChartType] = useState<ChartType>('area');

  const totalSales = data.reduce((sum, item) => sum + item.sales, 0);
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const avgSales = totalSales / data.length;

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={1} />
                <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/20" vertical={false} />
            <XAxis 
              dataKey="hour" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            />
            <Tooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="sales"
              fill="url(#barGradient)"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        );
      case 'composed':
        return (
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="composedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/20" vertical={false} />
            <XAxis 
              dataKey="hour" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            />
            <Tooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="revenue"
              fill="url(#composedGradient)"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="hsl(var(--chart-2))"
              strokeWidth={3}
              dot={false}
            />
          </ComposedChart>
        );
      default:
        return (
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4} />
                <stop offset="50%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
                <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.4} />
                <stop offset="50%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1} />
                <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/20" vertical={false} />
            <XAxis 
              dataKey="hour" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2.5}
              fill="url(#salesGradient)"
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2.5}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        );
    }
  };

  return (
    <div className="group rounded-2xl border border-border/50 bg-card p-6 shadow-md hover:shadow-glow transition-all duration-500 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Vendas por Hora</h3>
              <p className="text-xs text-muted-foreground">Desempenho ao longo do dia</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Chart type toggle */}
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
            <button
              onClick={() => setChartType('area')}
              className={cn(
                'p-2 rounded-md transition-all',
                chartType === 'area' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              )}
            >
              <TrendingUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={cn(
                'p-2 rounded-md transition-all',
                chartType === 'bar' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              )}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-3 rounded-xl bg-muted/30 border border-border/30">
          <p className="text-xs text-muted-foreground mb-1">Total Vendas</p>
          <p className="text-lg font-bold">{totalSales}</p>
        </div>
        <div className="p-3 rounded-xl bg-muted/30 border border-border/30">
          <p className="text-xs text-muted-foreground mb-1">Faturamento</p>
          <p className="text-lg font-bold text-success">R$ {totalRevenue.toFixed(0)}</p>
        </div>
        <div className="p-3 rounded-xl bg-muted/30 border border-border/30">
          <p className="text-xs text-muted-foreground mb-1">Média/Hora</p>
          <p className="text-lg font-bold">{avgSales.toFixed(1)}</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-chart-1 shadow-sm" />
          <span className="text-xs font-medium text-muted-foreground">Vendas</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-chart-2 shadow-sm" />
          <span className="text-xs font-medium text-muted-foreground">Faturamento</span>
        </div>
      </div>
      
      <ChartContainer config={chartConfig} className="h-[280px] w-full">
        {renderChart()}
      </ChartContainer>
    </div>
  );
}
