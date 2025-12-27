import { AppliedPromotion } from '@/hooks/usePromotions';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Percent, Tag, Gift, Clock, TrendingUp, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PromotionBadgeCartProps {
  promotion: AppliedPromotion;
  size?: 'sm' | 'md';
  showDiscount?: boolean;
  className?: string;
}

const promotionIcons = {
  percentage: Percent,
  fixed: Tag,
  buy_x_get_y: Gift,
  happy_hour: Clock,
  progressive: TrendingUp,
  combo: Sparkles,
};

const promotionColors = {
  percentage: 'from-emerald-500 to-green-600',
  fixed: 'from-blue-500 to-cyan-600',
  buy_x_get_y: 'from-purple-500 to-pink-600',
  happy_hour: 'from-orange-500 to-amber-600',
  progressive: 'from-indigo-500 to-violet-600',
  combo: 'from-rose-500 to-red-600',
};

export function PromotionBadgeCart({ 
  promotion, 
  size = 'sm', 
  showDiscount = true,
  className 
}: PromotionBadgeCartProps) {
  const Icon = promotionIcons[promotion.promotion.type] || Percent;
  const colorClass = promotionColors[promotion.promotion.type] || promotionColors.percentage;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            className={cn(
              'gap-1 cursor-help font-medium border-0 text-white shadow-sm',
              `bg-gradient-to-r ${colorClass}`,
              size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1',
              'animate-scale-in',
              className
            )}
          >
            <Icon className={cn(size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3')} />
            {showDiscount && (
              <span>-R$ {promotion.discount.toFixed(2).replace('.', ',')}</span>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold">{promotion.promotion.name}</p>
            <p className="text-xs text-muted-foreground">{promotion.description}</p>
            {promotion.promotion.description && (
              <p className="text-xs">{promotion.promotion.description}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Badge indicador de produto com promoção ativa
interface PromotionIndicatorProps {
  hasPromotion: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function PromotionIndicator({ hasPromotion, size = 'sm', className }: PromotionIndicatorProps) {
  if (!hasPromotion) return null;

  return (
    <div
      className={cn(
        'absolute -top-1 -right-1 bg-gradient-to-br from-success to-emerald-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg animate-pulse-glow',
        size === 'sm' ? 'w-5 h-5 text-[10px]' : 'w-6 h-6 text-xs',
        className
      )}
    >
      %
    </div>
  );
}

// Resumo de promoções aplicadas
interface PromotionsSummaryProps {
  totalDiscount: number;
  itemsCount: number;
  className?: string;
}

export function PromotionsSummary({ totalDiscount, itemsCount, className }: PromotionsSummaryProps) {
  if (totalDiscount <= 0) return null;

  return (
    <div
      className={cn(
        'flex items-center justify-between px-3 py-2 rounded-lg',
        'bg-gradient-to-r from-success/10 to-emerald-500/10 border border-success/20',
        'animate-fade-in',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-success/20 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-success" />
        </div>
        <div>
          <p className="text-xs font-medium text-success">
            {itemsCount} {itemsCount === 1 ? 'promoção aplicada' : 'promoções aplicadas'}
          </p>
        </div>
      </div>
      <p className="font-bold text-success tabular-nums">
        -R$ {totalDiscount.toFixed(2).replace('.', ',')}
      </p>
    </div>
  );
}
