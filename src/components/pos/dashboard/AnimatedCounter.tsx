import { useCountUp } from '@/hooks/useCountUp';
import { cn } from '@/lib/utils';

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  delay?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 2000,
  delay = 0,
  className,
}: AnimatedCounterProps) {
  const { formattedValue, isAnimating } = useCountUp({
    end: value,
    prefix,
    suffix,
    decimals,
    duration,
    delay,
  });

  return (
    <span className={cn('tabular-nums transition-opacity', className, isAnimating && 'opacity-90')}>
      {formattedValue}
    </span>
  );
}
