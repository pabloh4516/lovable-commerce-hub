import { Line, LineChart, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface SparklineProps {
  data: number[];
  color?: string;
  className?: string;
  height?: number;
  showGradient?: boolean;
  animated?: boolean;
}

export function Sparkline({ 
  data, 
  color = 'hsl(var(--primary))', 
  className,
  height = 40,
  showGradient = true,
  animated = true,
}: SparklineProps) {
  const gradientId = useMemo(() => `sparkline-gradient-${Math.random().toString(36).substr(2, 9)}`, []);
  
  const chartData = useMemo(() => 
    data.map((value, index) => ({ value, index })), 
    [data]
  );

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={showGradient ? 0.4 : 0} />
              <stop offset="50%" stopColor={color} stopOpacity={showGradient ? 0.15 : 0} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2.5}
            fill={`url(#${gradientId})`}
            isAnimationActive={animated}
            animationDuration={1500}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
