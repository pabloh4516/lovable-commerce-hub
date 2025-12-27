import { Star, Gift, TrendingUp, Coins } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { CustomerPoints, LoyaltyProgram } from '@/hooks/useLoyalty';

interface LoyaltyBadgeProps {
  points: CustomerPoints | null;
  earnablePoints: number;
  onRedeem?: () => void;
  className?: string;
}

export function LoyaltyBadge({ points, earnablePoints, onRedeem, className }: LoyaltyBadgeProps) {
  const program = points?.loyalty_programs as LoyaltyProgram | undefined;
  const availablePoints = points?.available_points || 0;
  const canRedeem = program && availablePoints >= program.min_points_redeem;

  return (
    <div className={cn('space-y-2', className)}>
      {/* Pontos acumulados */}
      {points && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg">
              <Star className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pontos disponíveis</p>
              <p className="font-bold text-amber-600 tabular-nums">{availablePoints.toLocaleString()}</p>
            </div>
          </div>
          {canRedeem && onRedeem && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                    onClick={onRedeem}
                  >
                    <Gift className="w-3.5 h-3.5" />
                    Resgatar
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mínimo: {program?.min_points_redeem} pontos</p>
                  <p>Valor: R$ {((program?.points_value || 0.01) * availablePoints).toFixed(2)}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}

      {/* Pontos que serão ganhos */}
      {earnablePoints > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-success/5 border border-success/10">
          <TrendingUp className="w-4 h-4 text-success" />
          <p className="text-xs">
            <span className="text-muted-foreground">Nesta compra:</span>
            <span className="font-bold text-success ml-1">+{earnablePoints} pontos</span>
          </p>
        </div>
      )}
    </div>
  );
}

// Badge compacto para exibir no header ou card de cliente
interface LoyaltyBadgeCompactProps {
  points: number;
  className?: string;
}

export function LoyaltyBadgeCompact({ points, className }: LoyaltyBadgeCompactProps) {
  if (points <= 0) return null;

  return (
    <Badge
      className={cn(
        'gap-1 bg-gradient-to-r from-amber-500 to-yellow-600 text-white border-0 shadow-sm',
        className
      )}
    >
      <Star className="w-3 h-3 fill-white" />
      {points.toLocaleString()}
    </Badge>
  );
}

// Desconto de fidelidade aplicado
interface LoyaltyDiscountAppliedProps {
  pointsUsed: number;
  discountValue: number;
  onRemove?: () => void;
  className?: string;
}

export function LoyaltyDiscountApplied({ 
  pointsUsed, 
  discountValue, 
  onRemove,
  className 
}: LoyaltyDiscountAppliedProps) {
  if (discountValue <= 0) return null;

  return (
    <div
      className={cn(
        'flex items-center justify-between px-3 py-2.5 rounded-xl',
        'bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center">
          <Coins className="w-4 h-4 text-amber-600" />
        </div>
        <div>
          <p className="text-xs font-medium text-amber-600">
            {pointsUsed.toLocaleString()} pontos resgatados
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <p className="font-bold text-amber-600 tabular-nums">
          -R$ {discountValue.toFixed(2).replace('.', ',')}
        </p>
        {onRemove && (
          <button
            onClick={onRemove}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
