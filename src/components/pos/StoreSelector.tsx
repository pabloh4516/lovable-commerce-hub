import { useState } from 'react';
import { Building2, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useStoreContext } from '@/contexts/StoreContext';
import { cn } from '@/lib/utils';

interface StoreSelectorProps {
  className?: string;
  compact?: boolean;
}

export function StoreSelector({ className, compact = false }: StoreSelectorProps) {
  const { currentStore, userStores, switchStore, isLoading } = useStoreContext();
  const [open, setOpen] = useState(false);

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled className={className}>
        <Building2 className="w-4 h-4 mr-2" />
        Carregando...
      </Button>
    );
  }

  if (!userStores.length) {
    return (
      <Button variant="ghost" size="sm" disabled className={className}>
        <Building2 className="w-4 h-4 mr-2" />
        Sem loja
      </Button>
    );
  }

  if (userStores.length === 1) {
    return (
      <div className={cn("flex items-center gap-2 px-3 py-1.5 text-sm", className)}>
        <Building2 className="w-4 h-4 text-primary" />
        <span className="font-medium">{currentStore?.name || userStores[0].name}</span>
      </div>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={cn("gap-2", className)}>
          <Building2 className="w-4 h-4 text-primary" />
          {!compact && (
            <span className="max-w-[150px] truncate">
              {currentStore?.name || 'Selecionar Loja'}
            </span>
          )}
          <ChevronDown className="w-4 h-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {userStores.map((store) => (
          <DropdownMenuItem
            key={store.id}
            onClick={() => {
              switchStore(store.id);
              setOpen(false);
            }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <div>
                <div className="font-medium">{store.name}</div>
                <div className="text-xs text-muted-foreground">{store.code}</div>
              </div>
            </div>
            {currentStore?.id === store.id && (
              <Check className="w-4 h-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
