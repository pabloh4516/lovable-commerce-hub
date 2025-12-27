import { useState } from 'react';
import { Plus, Search, Filter, ArrowUpDown, Package, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useProducts, DbProduct } from '@/hooks/useProducts';
import { useStockMovements } from '@/hooks/useStockMovements';
import { useStoreContext } from '@/contexts/StoreContext';
import { StockMovementModal } from './StockMovementModal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
      return 'bg-emerald-500/10 text-emerald-500';
    }
    if (['saida', 'transferencia_saida', 'venda', 'perda'].includes(type)) {
      return 'bg-red-500/10 text-red-500';
    }
    return 'bg-blue-500/10 text-blue-500';
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Gestão de Estoque</h1>
            <p className="text-muted-foreground">Controle de estoque e movimentações</p>
          </div>
          <Button onClick={() => handleAddMovement()}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Movimentação
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalProducts}</p>
                  <p className="text-sm text-muted-foreground">Produtos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{lowStockProducts}</p>
                  <p className="text-sm text-muted-foreground">Estoque Baixo</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{outOfStockProducts}</p>
                  <p className="text-sm text-muted-foreground">Sem Estoque</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{movements.length}</p>
                  <p className="text-sm text-muted-foreground">Movimentações</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4">
        <div className="flex gap-2 border-b border-border">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'products' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Produtos
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'movements' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Movimentações
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
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
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-right">Estoque</TableHead>
                  <TableHead className="text-right">Mínimo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productsLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Carregando produtos...
                    </TableCell>
                  </TableRow>
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum produto encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-mono text-sm">{product.code}</TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-right font-mono">
                        {product.stock} {product.unit}
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {product.min_stock} {product.unit}
                      </TableCell>
                      <TableCell>
                        {product.stock === 0 ? (
                          <Badge variant="destructive">Sem Estoque</Badge>
                        ) : product.stock <= product.min_stock ? (
                          <Badge variant="outline" className="border-amber-500 text-amber-500">
                            Estoque Baixo
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-emerald-500 text-emerald-500">
                            Normal
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleAddMovement(product)}
                        >
                          <ArrowUpDown className="h-4 w-4 mr-1" />
                          Movimentar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                  <TableHead className="text-right">Anterior</TableHead>
                  <TableHead className="text-right">Novo</TableHead>
                  <TableHead>Motivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movementsLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Carregando movimentações...
                    </TableCell>
                  </TableRow>
                ) : movements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhuma movimentação encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  movements.slice(0, 50).map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell className="text-sm">
                        {movement.created_at && format(new Date(movement.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="font-medium">
                        {(movement as any).products?.name || 'Produto'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getMovementTypeColor(movement.type)}>
                          {getMovementTypeLabel(movement.type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {movement.previous_stock}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {movement.new_stock}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {movement.reason || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
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
