import { useState } from 'react';
import { Plus, Filter, ArrowUpDown, Package, AlertTriangle, TrendingUp, TrendingDown, Boxes } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProducts, DbProduct } from '@/hooks/useProducts';
import { useStockMovements } from '@/hooks/useStockMovements';
import { useStoreContext } from '@/contexts/StoreContext';
import { StockMovementModal } from './StockMovementModal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ModernPageHeader, ModernStatCard, ModernSearchBar, ModernCard, ModernEmptyState } from './common';

export function StockPage() {
  const { currentStore } = useStoreContext();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: movements = [], isLoading: movementsLoading } = useStockMovements({ storeId: currentStore?.id });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<DbProduct | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'movements'>('products');

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'low') return matchesSearch && product.stock <= product.min_stock;
    if (filterType === 'out') return matchesSearch && product.stock === 0;
    return matchesSearch;
  });

  // Stats
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= p.min_stock).length;
  const outOfStockProducts = products.filter(p => p.stock === 0).length;

  const handleAddMovement = (product?: DbProduct) => {
    setSelectedProduct(product || null);
    setShowMovementModal(true);
  };

  const getMovementTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'entrada': 'Entrada',
      'saida': 'Saída',
      'ajuste': 'Ajuste',
      'transferencia_entrada': 'Transf. Entrada',
      'transferencia_saida': 'Transf. Saída',
      'perda': 'Perda',
      'venda': 'Venda',
      'devolucao': 'Devolução',
      'inventario': 'Inventário',
    };
    return labels[type] || type;
  };

  const getMovementTypeColor = (type: string) => {
    if (['entrada', 'transferencia_entrada', 'devolucao'].includes(type)) {
      return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    }
    if (['saida', 'transferencia_saida', 'venda', 'perda'].includes(type)) {
      return 'bg-red-500/10 text-red-600 border-red-500/20';
    }
    return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
  };

  return (
    <div className="h-full flex flex-col bg-background animate-fade-in">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <ModernPageHeader
          title="Gestão de Estoque"
          subtitle="Controle de estoque e movimentações"
          icon={Boxes}
          actions={
            <Button onClick={() => handleAddMovement()} className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Movimentação
            </Button>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <ModernStatCard
            title="Produtos"
            value={totalProducts}
            icon={Package}
            variant="blue"
          />
          <ModernStatCard
            title="Estoque Baixo"
            value={lowStockProducts}
            icon={AlertTriangle}
            variant="amber"
          />
          <ModernStatCard
            title="Sem Estoque"
            value={outOfStockProducts}
            icon={TrendingDown}
            variant="red"
          />
          <ModernStatCard
            title="Movimentações"
            value={movements.length}
            icon={TrendingUp}
            variant="green"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4">
        <div className="flex gap-1 p-1 bg-muted/50 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'products' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Produtos
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'movements' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Movimentações
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 flex gap-4">
        <ModernSearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar produto..."
          className="flex-1 max-w-md"
        />
        {activeTab === 'products' && (
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="low">Estoque Baixo</SelectItem>
              <SelectItem value="out">Sem Estoque</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 pb-6">
        {activeTab === 'products' ? (
          <ModernCard noPadding>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-4 font-medium text-muted-foreground text-sm">Código</th>
                  <th className="text-left p-4 font-medium text-muted-foreground text-sm">Produto</th>
                  <th className="text-right p-4 font-medium text-muted-foreground text-sm">Estoque</th>
                  <th className="text-right p-4 font-medium text-muted-foreground text-sm">Mínimo</th>
                  <th className="text-left p-4 font-medium text-muted-foreground text-sm">Status</th>
                  <th className="text-right p-4 font-medium text-muted-foreground text-sm">Ações</th>
                </tr>
              </thead>
              <tbody>
                {productsLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      Carregando produtos...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <ModernEmptyState icon={Package} title="Nenhum produto encontrado" />
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product, index) => (
                    <tr 
                      key={product.id} 
                      className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                      style={{ animationDelay: `${index * 20}ms` }}
                    >
                      <td className="p-4 font-mono text-sm text-muted-foreground">{product.code}</td>
                      <td className="p-4 font-medium">{product.name}</td>
                      <td className="p-4 text-right font-mono tabular-nums">
                        {product.stock} {product.unit}
                      </td>
                      <td className="p-4 text-right font-mono tabular-nums text-muted-foreground">
                        {product.min_stock} {product.unit}
                      </td>
                      <td className="p-4">
                        {product.stock === 0 ? (
                          <Badge variant="destructive">Sem Estoque</Badge>
                        ) : product.stock <= product.min_stock ? (
                          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                            Estoque Baixo
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                            Normal
                          </Badge>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleAddMovement(product)}
                          className="gap-1"
                        >
                          <ArrowUpDown className="h-4 w-4" />
                          Movimentar
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </ModernCard>
        ) : (
          <ModernCard noPadding>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-4 font-medium text-muted-foreground text-sm">Data</th>
                  <th className="text-left p-4 font-medium text-muted-foreground text-sm">Produto</th>
                  <th className="text-left p-4 font-medium text-muted-foreground text-sm">Tipo</th>
                  <th className="text-right p-4 font-medium text-muted-foreground text-sm">Quantidade</th>
                  <th className="text-right p-4 font-medium text-muted-foreground text-sm">Anterior</th>
                  <th className="text-right p-4 font-medium text-muted-foreground text-sm">Novo</th>
                  <th className="text-left p-4 font-medium text-muted-foreground text-sm">Motivo</th>
                </tr>
              </thead>
              <tbody>
                {movementsLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">
                      Carregando movimentações...
                    </td>
                  </tr>
                ) : movements.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <ModernEmptyState icon={ArrowUpDown} title="Nenhuma movimentação encontrada" />
                    </td>
                  </tr>
                ) : (
                  movements.slice(0, 50).map((movement, index) => (
                    <tr 
                      key={movement.id} 
                      className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                      style={{ animationDelay: `${index * 20}ms` }}
                    >
                      <td className="p-4 text-sm text-muted-foreground">
                        {movement.created_at && format(new Date(movement.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </td>
                      <td className="p-4 font-medium">
                        {(movement as any).products?.name || 'Produto'}
                      </td>
                      <td className="p-4">
                        <Badge className={getMovementTypeColor(movement.type)}>
                          {getMovementTypeLabel(movement.type)}
                        </Badge>
                      </td>
                      <td className="p-4 text-right font-mono tabular-nums">
                        {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                      </td>
                      <td className="p-4 text-right font-mono tabular-nums text-muted-foreground">
                        {movement.previous_stock}
                      </td>
                      <td className="p-4 text-right font-mono tabular-nums">
                        {movement.new_stock}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground max-w-[200px] truncate">
                        {movement.reason || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </ModernCard>
        )}
      </div>

      {/* Movement Modal */}
      <StockMovementModal
        open={showMovementModal}
        onClose={() => {
          setShowMovementModal(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
      />
    </div>
  );
}
