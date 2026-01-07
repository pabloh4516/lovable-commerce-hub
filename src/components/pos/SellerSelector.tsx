import { useState } from 'react';
import { Check, ChevronDown, Search, User, Target, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSellers, useSellerStats, Seller } from '@/hooks/useSellers';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

interface SellerSelectorProps {
  selectedSeller: Seller | null;
  onSelectSeller: (seller: Seller | null) => void;
  disabled?: boolean;
  showStats?: boolean;
}

export function SellerSelector({ 
  selectedSeller, 
  onSelectSeller, 
  disabled = false,
  showStats = true,
}: SellerSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { data: sellers = [], isLoading } = useSellers();
  const { data: stats } = useSellerStats(selectedSeller?.user_id);

  const filteredSellers = sellers.filter(
    (seller) =>
      seller.name.toLowerCase().includes(search.toLowerCase()) ||
      seller.code.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (value: number) => 
    `R$ ${value.toFixed(2).replace('.', ',')}`;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const dailyProgress = selectedSeller?.daily_goal && stats
    ? Math.min((stats.dailyTotal / selectedSeller.daily_goal) * 100, 100)
    : 0;

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            disabled={disabled}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-accent transition-colors w-full",
              disabled && "opacity-50 cursor-not-allowed",
              !selectedSeller && "text-muted-foreground"
            )}
          >
            {selectedSeller ? (
              <>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={selectedSeller.image_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {getInitials(selectedSeller.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <div className="font-medium text-sm">{selectedSeller.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {selectedSeller.code} • {selectedSeller.commission_percent || 0}% comissão
                  </div>
                </div>
              </>
            ) : (
              <>
                <User className="h-5 w-5" />
                <span className="flex-1 text-left text-sm">Selecionar Vendedor</span>
              </>
            )}
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar vendedor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto p-2">
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : filteredSellers.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Nenhum vendedor encontrado
              </div>
            ) : (
              <div className="space-y-1">
                {/* Option to clear selection */}
                <button
                  onClick={() => {
                    onSelectSeller(null);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors",
                    !selectedSeller && "bg-accent"
                  )}
                >
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm text-muted-foreground">Sem vendedor</span>
                  {!selectedSeller && <Check className="h-4 w-4 ml-auto text-primary" />}
                </button>

                {filteredSellers.map((seller) => (
                  <button
                    key={seller.id}
                    onClick={() => {
                      onSelectSeller(seller);
                      setOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors",
                      selectedSeller?.id === seller.id && "bg-accent"
                    )}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={seller.image_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(seller.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">{seller.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {seller.code} • {seller.commission_percent || 0}%
                      </div>
                    </div>
                    {selectedSeller?.id === seller.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Seller Stats */}
      {showStats && selectedSeller && stats && (
        <div className="p-3 rounded-xl bg-secondary/50 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Vendas Hoje
            </span>
            <span className="font-medium">
              {stats.dailySalesCount} vendas • {formatCurrency(stats.dailyTotal)}
            </span>
          </div>
          
          {selectedSeller.daily_goal && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  Meta Diária
                </span>
                <span className="font-medium">
                  {dailyProgress.toFixed(0)}%
                </span>
              </div>
              <Progress value={dailyProgress} className="h-1.5" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
