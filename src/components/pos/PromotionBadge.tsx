import { Tag, Percent, Gift, Clock, Layers } from 'lucide-react';
import { AppliedPromotion, PromotionType } from '@/hooks/usePromotions';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PromotionBadgeProps {
  promotion: AppliedPromotion;
  size?: 'sm' | 'md' | 'lg';
  showDiscount?: boolean;
  className?: string;
}

const typeIcons: Record<PromotionType, typeof Tag> = {
  percentage: Percent,
  fixed: Tag,
  buy_x_get_y: Gift,
  combo: Layers,
  progressive: Layers,
  happy_hour: Clock,
};

const typeColors: Record<PromotionType, string> = {
  percentage: 'bg-success/10 text-success border-success/20',
  fixed: 'bg-primary/10 text-primary border-primary/20',
  buy_x_get_y: 'bg-warning/10 text-warning border-warning/20',
  combo: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  progressive: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  happy_hour: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
};

export function PromotionBadge({
  promotion,
  size = 'sm',
  showDiscount = true,
  className,
}: PromotionBadgeProps) {
  const Icon = typeIcons[promotion.promotion.type] || Tag;
  const colorClass = typeColors[promotion.promotion.type] || typeColors.percentage;

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5 gap-1',
    md: 'text-sm px-2 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              'inline-flex items-center font-medium rounded border',
              colorClass,
              sizeClasses[size],
              className
            )}
          >
            <Icon className={iconSizes[size]} />
            {showDiscount && (
              <span>-R$ {promotion.discount.toFixed(2)}</span>
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <div className="font-medium">{promotion.promotion.name}</div>
            <div className="text-muted-foreground">{promotion.description}</div>
            {promotion.promotion.description && (
              <div className="text-xs mt-1 text-muted-foreground">
                {promotion.promotion.description}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface PromotionIndicatorProps {
  hasPromotion: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function PromotionIndicator({
  hasPromotion,
  size = 'sm',
  className,
}: PromotionIndicatorProps) {
  if (!hasPromotion) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-success text-success-foreground font-bold',
        size === 'sm' ? 'w-4 h-4 text-[10px]' : 'w-5 h-5 text-xs',
        className
      )}
    >
      %
    </span>
  );
}
