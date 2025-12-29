import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModernStatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  variant?: 'blue' | 'green' | 'amber' | 'red' | 'purple';
  trend?: {
    value: number;
    label?: string;
  };
  className?: string;
}

const variantStyles = {
  blue: {
    gradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
    valueColor: 'text-blue-600 dark:text-blue-400',
  },
  green: {
    gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-500',
    valueColor: 'text-emerald-600 dark:text-emerald-400',
  },
  amber: {
    gradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
    valueColor: 'text-amber-600 dark:text-amber-400',
  },
  red: {
    gradient: 'from-red-500/10 via-red-500/5 to-transparent',
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-500',
    valueColor: 'text-red-600 dark:text-red-400',
  },
  purple: {
    gradient: 'from-purple-500/10 via-purple-500/5 to-transparent',
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-500',
    valueColor: 'text-purple-600 dark:text-purple-400',
  },
};

export function ModernStatCard({
  title,
  value,
  icon: Icon,
  variant = 'blue',
  trend,
  className,
}: ModernStatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border/50 bg-card p-5",
        "transition-all duration-300 hover:shadow-lg hover:border-border",
        "group",
        className
      )}
    >
      {/* Background gradient */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-50 transition-opacity group-hover:opacity-100",
          styles.gradient
        )}
      />

      {/* Content */}
      <div className="relative z-10 flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={cn("text-2xl font-bold tabular-nums", styles.valueColor)}>
            {value}
          </p>
          {trend && (
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "text-xs font-medium",
                  trend.value > 0
                    ? "text-emerald-500"
                    : trend.value < 0
                    ? "text-red-500"
                    : "text-muted-foreground"
                )}
              >
                {trend.value > 0 ? "+" : ""}
                {trend.value}%
              </span>
              {trend.label && (
                <span className="text-xs text-muted-foreground">{trend.label}</span>
              )}
            </div>
          )}
        </div>

        {Icon && (
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110",
              styles.iconBg
            )}
          >
            <Icon className={cn("w-5 h-5", styles.iconColor)} />
          </div>
        )}
      </div>

      {/* Decorative elements */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-gradient-to-br from-primary/5 to-transparent blur-2xl" />
    </div>
  );
}
