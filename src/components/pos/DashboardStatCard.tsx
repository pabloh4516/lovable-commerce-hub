import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedCounter } from './dashboard/AnimatedCounter';

interface DashboardStatCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: LucideIcon;
  variant: 'blue' | 'green' | 'orange' | 'pink';
  prefix?: string;
  decimals?: number;
}

const variantStyles = {
  blue: 'bg-stat-blue',
  green: 'bg-stat-green',
  orange: 'bg-stat-orange',
  pink: 'bg-stat-pink',
};

export function DashboardStatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  variant,
  prefix = '',
  decimals = 0
}: DashboardStatCardProps) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl p-5 text-white",
      variantStyles[variant]
    )}>
      {/* Background icon */}
      <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-20">
        <Icon className="w-16 h-16" />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <p className="text-sm font-medium text-white/80 mb-1">{title}</p>
        <p className="text-2xl font-bold">
          {prefix}
          <AnimatedCounter 
            value={value} 
            decimals={decimals}
          />
        </p>
        {subtitle && (
          <p className="text-xs text-white/70 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}