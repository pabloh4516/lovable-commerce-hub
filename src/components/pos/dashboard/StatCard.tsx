import { LucideIcon, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
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
  iconBgColor?: string;
  sparklineData?: number[];
  delay?: number;
  className?: string;
  variant?: 'default' | 'gradient' | 'glass';
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
  iconBgColor = 'bg-primary/10',
  sparklineData,
  delay = 0,
  className,
  variant = 'default',
}: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;

  const variantClasses = {
    default: 'bg-card border border-border/50',
    gradient: 'bg-gradient-to-br from-card via-card to-primary/5 border border-border/50',
    glass: 'bg-card/80 backdrop-blur-xl border border-border/30',
  };

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl p-6',
        'shadow-md hover:shadow-glow transition-all duration-500',
        'hover:-translate-y-1 hover:border-primary/40',
        variantClasses[variant],
        'animate-scale-in',
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Animated background gradient on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
      </div>
      
      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
      </div>
      
      <div className="relative z-10">
        {/* Header with icon and badge */}
        <div className="flex items-start justify-between mb-5">
          <div className={cn(
            'relative w-14 h-14 rounded-2xl flex items-center justify-center',
            'transition-all duration-300 group-hover:scale-110',
            iconBgColor
          )}>
            <Icon className={cn('w-6 h-6 transition-transform duration-300 group-hover:scale-110', iconColor)} />
            {/* Icon glow */}
            <div className={cn(
              'absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500',
              'blur-xl',
              iconBgColor
            )} />
          </div>
          
          {change !== undefined && (
            <div className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold',
              'transition-all duration-300 group-hover:scale-105',
              isPositive 
                ? 'bg-success/15 text-success border border-success/20' 
                : 'bg-destructive/15 text-destructive border border-destructive/20'
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

        {/* Value with animated counter */}
        <div className="mb-2">
          <AnimatedCounter
            value={value}
            prefix={prefix}
            suffix={suffix}
            decimals={decimals}
            delay={delay + 200}
            className="text-4xl font-bold tracking-tight"
          />
        </div>

        {/* Title and change label */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {changeLabel && (
            <p className="text-xs text-muted-foreground/70 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {changeLabel}
            </p>
          )}
        </div>

        {/* Sparkline */}
        {sparklineData && sparklineData.length > 0 && (
          <div className="pt-4 border-t border-border/30">
            <Sparkline 
              data={sparklineData} 
              height={40}
              color={isPositive ? 'hsl(var(--success))' : 'hsl(var(--destructive))'}
              showGradient
            />
          </div>
        )}
      </div>
    </div>
  );
}
