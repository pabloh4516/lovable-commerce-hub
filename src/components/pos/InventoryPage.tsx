import { useState } from 'react';
import { ClipboardList, Plus, Package, AlertTriangle, CheckCircle, Boxes } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProducts } from '@/hooks/useProducts';
import { formatCurrency } from '@/lib/utils';
import { ModernPageHeader, ModernStatCard, ModernSearchBar, ModernCard, ModernEmptyState } from './common';

export function InventoryPage() {
  const { products, isLoading } = useProducts();
  const [search, setSearch] = useState('');

  const filtered = products?.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase()) ||
    p.barcode?.includes(search)
  ) || [];

  const totalValue = filtered.reduce((sum, p) => sum + (p.cost * p.stock), 0);
  const lowStock = filtered.filter(p => p.stock <= p.min_stock && p.stock > 0).length;
  const noStock = filtered.filter(p => p.stock === 0).length;

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { label: 'Sem Estoque', className: 'bg-red-500/10 text-red-600 border-red-500/20', icon: AlertTriangle };
    if (stock <= minStock) return { label: 'Estoque Baixo', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: AlertTriangle };
    return { label: 'OK', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: CheckCircle };
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in h-full overflow-auto">
      <ModernPageHeader
        title="Inventário"
        subtitle="Conferência e controle de estoque"
        icon={ClipboardList}
        actions={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Inventário
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ModernStatCard
          title="Total de Produtos"
          value={filtered.length}
          icon={Package}
          variant="blue"
        />
        <ModernStatCard
          title="Valor em Estoque"
          value={formatCurrency(totalValue)}
          icon={Boxes}
          variant="green"
        />
        <ModernStatCard
          title="Estoque Baixo"
          value={lowStock}
          icon={AlertTriangle}
          variant="amber"
        />
        <ModernStatCard
          title="Sem Estoque"
          value={noStock}
          icon={AlertTriangle}
          variant="red"
        />
      </div>

      {/* Search */}
      <ModernSearchBar
        value={search}
        onChange={setSearch}
        placeholder="Buscar por nome, código ou código de barras..."
        className="max-w-md"
      />

      {/* Table */}
      <ModernCard noPadding>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-4 font-medium text-muted-foreground text-sm">Código</th>
                <th className="text-left p-4 font-medium text-muted-foreground text-sm">Produto</th>
                <th className="text-left p-4 font-medium text-muted-foreground text-sm">Código de Barras</th>
                <th className="text-right p-4 font-medium text-muted-foreground text-sm">Est. Mínimo</th>
                <th className="text-right p-4 font-medium text-muted-foreground text-sm">Est. Atual</th>
                <th className="text-right p-4 font-medium text-muted-foreground text-sm">Custo Unit.</th>
                <th className="text-right p-4 font-medium text-muted-foreground text-sm">Valor Total</th>
                <th className="text-center p-4 font-medium text-muted-foreground text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-muted-foreground">
                    Carregando...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <ModernEmptyState
                      icon={Package}
                      title="Nenhum produto encontrado"
                      description="Tente ajustar os filtros de busca"
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((product, index) => {
                  const status = getStockStatus(product.stock, product.min_stock);
                  const StatusIcon = status.icon;
                  return (
                    <tr 
                      key={product.id} 
                      className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <td className="p-4 font-mono text-sm text-muted-foreground">{product.code}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/10">
                            <Package className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-sm text-muted-foreground">{product.barcode || '-'}</td>
                      <td className="p-4 text-right tabular-nums text-muted-foreground">{product.min_stock}</td>
                      <td className="p-4 text-right font-medium tabular-nums">{product.stock}</td>
                      <td className="p-4 text-right tabular-nums">{formatCurrency(product.cost)}</td>
                      <td className="p-4 text-right font-medium tabular-nums">
                        {formatCurrency(product.cost * product.stock)}
                      </td>
                      <td className="p-4 text-center">
                        <Badge className={status.className}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </ModernCard>
    </div>
  );
}
