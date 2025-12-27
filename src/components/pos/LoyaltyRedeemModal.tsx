import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Gift, Star, Coins, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CustomerPoints, LoyaltyProgram } from '@/hooks/useLoyalty';

interface LoyaltyRedeemModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerPoints: CustomerPoints | null;
  maxDiscount: number;
  onRedeem: (points: number, discountValue: number) => void;
}

export function LoyaltyRedeemModal({
  isOpen,
  onClose,
  customerPoints,
  maxDiscount,
  onRedeem,
}: LoyaltyRedeemModalProps) {
  const [pointsToRedeem, setPointsToRedeem] = useState(0);

  const program = customerPoints?.loyalty_programs as LoyaltyProgram | undefined;
  const availablePoints = customerPoints?.available_points || 0;
  const pointValue = program?.points_value || 0.01;
  const minPointsRedeem = program?.min_points_redeem || 100;

  // Máximo de pontos que podem ser resgatados (limitado pelo valor da compra)
  const maxPointsByValue = Math.floor(maxDiscount / pointValue);
  const maxRedeemable = Math.min(availablePoints, maxPointsByValue);

  const discountValue = pointsToRedeem * pointValue;
  const canRedeem = pointsToRedeem >= minPointsRedeem && pointsToRedeem <= maxRedeemable;

  const handleSliderChange = (value: number[]) => {
    setPointsToRedeem(value[0]);
  };

  const handleConfirm = () => {
    if (canRedeem) {
      onRedeem(pointsToRedeem, discountValue);
      setPointsToRedeem(0);
      onClose();
    }
  };

  const presetPercentages = [25, 50, 75, 100];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-amber-500" />
            Resgatar Pontos
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Saldo de Pontos */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg">
                <Star className="w-6 h-6 text-white fill-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pontos disponíveis</p>
                <p className="text-2xl font-bold text-amber-600 tabular-nums">
                  {availablePoints.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Valor máximo</p>
              <p className="font-semibold text-amber-600">
                R$ {(availablePoints * pointValue).toFixed(2).replace('.', ',')}
              </p>
            </div>
          </div>

          {/* Aviso de mínimo */}
          {availablePoints < minPointsRedeem && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="w-4 h-4" />
              Mínimo de {minPointsRedeem} pontos para resgate
            </div>
          )}

          {/* Slider de pontos */}
          {availablePoints >= minPointsRedeem && (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Quantos pontos resgatar?</Label>
                  <Input
                    type="number"
                    value={pointsToRedeem}
                    onChange={(e) => setPointsToRedeem(Math.min(maxRedeemable, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-24 text-right"
                  />
                </div>

                <Slider
                  value={[pointsToRedeem]}
                  onValueChange={handleSliderChange}
                  max={maxRedeemable}
                  min={0}
                  step={10}
                  className="py-4"
                />

                {/* Preset buttons */}
                <div className="flex gap-2">
                  {presetPercentages.map((pct) => {
                    const points = Math.floor((maxRedeemable * pct) / 100);
                    if (points < minPointsRedeem && pct !== 100) return null;
                    return (
                      <Button
                        key={pct}
                        variant={pointsToRedeem === points ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPointsToRedeem(points)}
                        className="flex-1"
                      >
                        {pct}%
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Resumo do resgate */}
              <div className="p-4 rounded-xl bg-muted/50 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pontos a resgatar</span>
                  <span className="font-semibold tabular-nums">{pointsToRedeem.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Valor por ponto</span>
                  <span className="tabular-nums">R$ {pointValue.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                  <span>Desconto</span>
                  <span className={cn(
                    "tabular-nums",
                    discountValue > 0 ? "text-success" : "text-muted-foreground"
                  )}>
                    R$ {discountValue.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            className="flex-1 gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700"
            onClick={handleConfirm}
            disabled={!canRedeem}
          >
            <Coins className="w-4 h-4" />
            Resgatar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
