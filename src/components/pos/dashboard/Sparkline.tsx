import { Line, LineChart, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

interface SparklineProps {
  data: number[];
  color?: string;
  className?: string;
  height?: number;
  showGradient?: boolean;
}

export function Sparkline({ 
  data, 
  color = 'hsl(var(--primary))', 
  className,
  height = 40,
  showGradient = true,
}: SparklineProps) {
  const chartData = data.map((value, index) => ({ value, index }));
  const gradientId = `sparkline-gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <defs>
            {showGradient && (
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            )}
          </defs>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            fill={showGradient ? `url(#${gradientId})` : 'none'}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
