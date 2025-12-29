import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LucideIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataCardProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  children: ReactNode;
  isLoading?: boolean;
  className?: string;
  contentClassName?: string;
}

export function DataCard({ 
  title, 
  description, 
  icon: Icon,
  actions,
  children, 
  isLoading,
  className,
  contentClassName
}: DataCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      {(title || actions) && (
        <CardHeader className="flex flex-row items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-primary" />
              </div>
            )}
            <div>
              {title && <CardTitle className="text-base">{title}</CardTitle>}
              {description && <CardDescription>{description}</CardDescription>}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </CardHeader>
      )}
      <CardContent className={cn("p-0", contentClassName)}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
