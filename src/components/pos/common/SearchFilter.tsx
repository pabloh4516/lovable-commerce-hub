import { ReactNode } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  filters?: ReactNode;
  className?: string;
}

export function SearchFilter({ 
  value, 
  onChange, 
  placeholder = 'Buscar...', 
  filters,
  className 
}: SearchFilterProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row gap-3", className)}>
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-9 pr-9"
        />
        {value && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => onChange('')}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>
      {filters}
    </div>
  );
}
