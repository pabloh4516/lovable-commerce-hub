import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedCounter } from './dashboard/AnimatedCounter';
import { Sparkline } from './dashboard/Sparkline';

interface DashboardStatCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: LucideIcon;
  variant: 'blue' | 'green' | 'orange' | 'pink';
  prefix?: string;
  decimals?: number;
  trend?: number;
  sparklineData?: number[];
}

const variantStyles = {
  blue: {
    gradient: 'from-blue-500 to-indigo-600',
    iconBg: 'bg-white/20',
    glow: 'shadow-blue-500/25',
  },
  green: {
    gradient: 'from-emerald-500 to-teal-600',
    iconBg: 'bg-white/20',
    glow: 'shadow-emerald-500/25',
  },
  orange: {
    gradient: 'from-orange-500 to-amber-600',
    iconBg: 'bg-white/20',
    glow: 'shadow-orange-500/25',
  },
  pink: {
    gradient: 'from-pink-500 to-rose-600',
    iconBg: 'bg-white/20',
    glow: 'shadow-pink-500/25',
  },
};

export function DashboardStatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  variant,
  prefix = '',
  decimals = 0,
  trend,
  sparklineData
}: DashboardStatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl p-6 text-white transition-all duration-300 hover:-translate-y-1",
      "bg-gradient-to-br shadow-xl",
      styles.gradient,
      styles.glow
    )}>
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 1px)`,
        backgroundSize: '16px 16px'
      }} />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            styles.iconBg,
            "backdrop-blur-sm"
          )}>
            <Icon className="w-6 h-6" />
          </div>
          
          {trend !== undefined && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
              trend >= 0 ? "bg-white/20" : "bg-black/20"
            )}>
              <span>{trend >= 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        
        {/* Title */}
        <p className="text-sm font-medium text-white/80 mb-1">{title}</p>
        
        {/* Value */}
        <p className="text-3xl font-bold tracking-tight">
          {prefix}
          <AnimatedCounter 
            value={value} 
            decimals={decimals}
          />
        </p>
        
        {/* Subtitle or Sparkline */}
        {sparklineData ? (
          <div className="mt-3 h-8">
            <Sparkline data={sparklineData} color="rgba(255,255,255,0.6)" />
          </div>
        ) : subtitle ? (
          <p className="text-xs text-white/60 mt-2">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}
