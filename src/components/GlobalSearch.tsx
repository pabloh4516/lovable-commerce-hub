import { useState, useEffect, useCallback } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { 
  ShoppingCart, 
  LayoutDashboard, 
  Package, 
  Warehouse, 
  Tag, 
  Building2, 
  BarChart3, 
  FileText, 
  Users, 
  Settings,
  User,
  Receipt,
  Search,
} from 'lucide-react';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { Badge } from '@/components/ui/badge';

interface GlobalSearchProps {
  onNavigate: (page: string) => void;
  onSelectProduct?: (product: any) => void;
  onSelectCustomer?: (customer: any) => void;
  onSelectSale?: (sale: any) => void;
}

const iconMap: Record<string, any> = {
  ShoppingCart,
  LayoutDashboard,
  Package,
  Warehouse,
  Tag,
  Building2,
  BarChart3,
  FileText,
  Users,
  Settings,
  User,
  Receipt,
};

export function GlobalSearch({ 
  onNavigate, 
  onSelectProduct,
  onSelectCustomer,
  onSelectSale,
}: GlobalSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { results, isEmpty } = useGlobalSearch(query);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = useCallback((type: string, item: any) => {
    setOpen(false);
    setQuery('');

    switch (type) {
      case 'navigation':
        onNavigate(item.action);
        break;
      case 'product':
        if (onSelectProduct) {
          onSelectProduct(item.data);
        } else {
          onNavigate('products');
        }
        break;
      case 'customer':
        if (onSelectCustomer) {
          onSelectCustomer(item.data);
        }
        break;
      case 'sale':
        if (onSelectSale) {
          onSelectSale(item.data);
        } else {
          onNavigate('reports');
        }
        break;
    }
  }, [onNavigate, onSelectProduct, onSelectCustomer, onSelectSale]);

  return (
    <>
      {/* Search Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Buscar...</span>
        <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Buscar produtos, clientes, vendas, páginas..." 
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {isEmpty && query && (
            <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          )}

          {/* Navigation */}
          {results.navigation.length > 0 && (
            <CommandGroup heading="Navegação">
              {results.navigation.map((item) => {
                const Icon = iconMap[item.icon || 'Package'];
                return (
                  <CommandItem
                    key={item.id}
                    onSelect={() => handleSelect('navigation', item)}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">{item.title}</span>
                      <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}

          {/* Products */}
          {results.products.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Produtos">
                {results.products.map((item) => (
                  <CommandItem
                    key={item.id}
                    onSelect={() => handleSelect('product', item)}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-success/10">
                      <Package className="w-4 h-4 text-success" />
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="font-medium">{item.title}</span>
                      <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">Produto</Badge>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {/* Customers */}
          {results.customers.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Clientes">
                {results.customers.map((item) => (
                  <CommandItem
                    key={item.id}
                    onSelect={() => handleSelect('customer', item)}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-warning/10">
                      <User className="w-4 h-4 text-warning" />
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="font-medium">{item.title}</span>
                      <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">Cliente</Badge>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {/* Sales */}
          {results.sales.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Vendas">
                {results.sales.map((item) => (
                  <CommandItem
                    key={item.id}
                    onSelect={() => handleSelect('sale', item)}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                      <Receipt className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="font-medium">{item.title}</span>
                      <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">Venda</Badge>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
