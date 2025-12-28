import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedCounter } from './AnimatedCounter';
import { Sparkline } from './Sparkline';

interface StatCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  sparklineData?: number[];
  delay?: number;
  className?: string;
}

export function StatCard({
  title,
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  change,
  changeLabel,
  icon: Icon,
  iconColor = 'text-primary',
  sparklineData,
  delay = 0,
  className,
}: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-5',
        'hover:border-primary/30 hover:shadow-glow transition-all duration-300',
        'animate-scale-in',
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={cn(
            'w-11 h-11 rounded-xl flex items-center justify-center',
            'bg-primary/10 group-hover:bg-primary/20 transition-colors'
          )}>
            <Icon className={cn('w-5 h-5', iconColor)} />
          </div>
          
          {change !== undefined && (
            <div className={cn(
              'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold',
              isPositive 
                ? 'bg-success/10 text-success' 
                : 'bg-destructive/10 text-destructive'
            )}>
              {isPositive ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              {Math.abs(change).toFixed(1)}%
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mb-1">
          <AnimatedCounter
            value={value}
            prefix={prefix}
            suffix={suffix}
            decimals={decimals}
            delay={delay + 200}
            className="text-3xl font-bold"
          />
        </div>

        {/* Title */}
        <p className="text-sm text-muted-foreground mb-3">{title}</p>

        {/* Sparkline */}
        {sparklineData && sparklineData.length > 0 && (
          <div className="pt-2 border-t border-border/50">
            <Sparkline 
              data={sparklineData} 
              height={32}
              color={isPositive ? 'hsl(var(--success))' : 'hsl(var(--destructive))'}
            />
          </div>
        )}

        {/* Change label */}
        {changeLabel && (
          <p className="text-xs text-muted-foreground mt-2">{changeLabel}</p>
        )}
      </div>
    </div>
  );
}
