import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: number;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  variant = 'default',
  className 
}: StatCardProps) {
  const variantStyles = {
    default: 'text-muted-foreground',
    success: 'text-success',
    warning: 'text-warning',
    destructive: 'text-destructive',
  };

  return (
    <Card className={cn("transition-all hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && <Icon className={cn("w-4 h-4", variantStyles[variant])} />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(subtitle || trend !== undefined) && (
          <div className="flex items-center gap-2 mt-1">
            {trend !== undefined && (
              <span className={cn(
                "text-xs font-medium",
                trend > 0 ? "text-success" : trend < 0 ? "text-destructive" : "text-muted-foreground"
              )}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
            )}
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
