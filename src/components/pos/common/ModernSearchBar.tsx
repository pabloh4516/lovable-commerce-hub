import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ModernSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function ModernSearchBar({
  value,
  onChange,
  placeholder = 'Buscar...',
  className,
}: ModernSearchBarProps) {
  return (
    <div className={cn("relative", className)}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
        <Search className="h-4 w-4 text-primary" />
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-14 h-11 bg-secondary/30 border-border/50 focus:bg-background transition-colors"
      />
    </div>
  );
}
