import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PaymentMethod } from '@/types/pos';
import { cn } from '@/lib/utils';
import { AnimatedCounter } from './AnimatedCounter';

interface PaymentMethodsChartProps {
  data: { method: PaymentMethod; total: number }[] | Record<string, number>;
  totalRevenue: number;
}

const methodConfig: Record<PaymentMethod, { label: string; color: string; bgColor: string }> = {
  pix: { label: 'PIX', color: 'hsl(var(--primary))', bgColor: 'bg-primary/10 text-primary' },
  credit: { label: 'Crédito', color: 'hsl(var(--success))', bgColor: 'bg-success/10 text-success' },
  debit: { label: 'Débito', color: 'hsl(var(--warning))', bgColor: 'bg-warning/10 text-warning' },
  cash: { label: 'Dinheiro', color: 'hsl(var(--muted-foreground))', bgColor: 'bg-muted text-muted-foreground' },
  fiado: { label: 'Fiado', color: 'hsl(var(--destructive))', bgColor: 'bg-destructive/10 text-destructive' },
};

export function PaymentMethodsChart({ data, totalRevenue }: PaymentMethodsChartProps) {
  // Normalize data to array format
  const normalizedData: { method: PaymentMethod; total: number }[] = Array.isArray(data) 
    ? data 
    : Object.entries(data).map(([method, total]) => ({ 
        method: method as PaymentMethod, 
        total: total as number 
      }));

  const chartData = normalizedData.map(item => ({
    name: methodConfig[item.method]?.label || item.method,
    value: item.total,
    color: methodConfig[item.method]?.color || 'hsl(var(--muted))',
    method: item.method,
  }));

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-5 animate-fade-in">
      <div className="mb-6">
        <h3 className="font-semibold text-lg">Formas de Pagamento</h3>
        <p className="text-sm text-muted-foreground">Distribuição das vendas</p>
      </div>

      <div className="flex items-center gap-6">
        {/* Pie Chart */}
        <div className="w-40 h-40 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    className="transition-opacity hover:opacity-80"
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`R$ ${value.toFixed(2).replace('.', ',')}`, '']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  padding: '8px 12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="text-sm font-bold">
              <AnimatedCounter value={totalRevenue} prefix="R$ " decimals={0} duration={1500} />
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-3">
          {normalizedData.map((item, index) => {
            const config = methodConfig[item.method];
            const percentage = totalRevenue > 0 ? (item.total / totalRevenue) * 100 : 0;
            
            return (
              <div 
                key={item.method}
                className="flex items-center gap-3 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={cn('px-2.5 py-1 rounded-lg text-xs font-semibold', config?.bgColor)}>
                  {config?.label}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">
                      R$ {item.total.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: config?.color,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
