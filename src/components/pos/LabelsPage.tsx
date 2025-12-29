import { useState } from 'react';
import { Tag, Search, Printer, Plus, Minus, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useProducts } from '@/hooks/useProducts';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

interface LabelItem {
  productId: string;
  quantity: number;
}

export function LabelsPage() {
  const { products, isLoading } = useProducts();
  const [search, setSearch] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<LabelItem[]>([]);

  const filtered = products?.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase()) ||
    p.barcode?.includes(search)
  ) || [];

  const toggleProduct = (productId: string) => {
    setSelectedLabels(prev => {
      const exists = prev.find(l => l.productId === productId);
      if (exists) {
        return prev.filter(l => l.productId !== productId);
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setSelectedLabels(prev =>
      prev.map(l => {
        if (l.productId === productId) {
          const newQty = Math.max(1, l.quantity + delta);
          return { ...l, quantity: newQty };
        }
        return l;
      })
    );
  };

  const getQuantity = (productId: string) => {
    return selectedLabels.find(l => l.productId === productId)?.quantity || 0;
  };

  const isSelected = (productId: string) => {
    return selectedLabels.some(l => l.productId === productId);
  };

  const totalLabels = selectedLabels.reduce((sum, l) => sum + l.quantity, 0);

  const handlePrint = () => {
    if (selectedLabels.length === 0) {
      toast.error('Selecione pelo menos um produto');
      return;
    }
    toast.success(`Preparando impressão de ${totalLabels} etiquetas`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Tag className="h-7 w-7" />
            Etiquetas
          </h1>
          <p className="text-muted-foreground">Imprima etiquetas de preço e código de barras</p>
        </div>
        <Button onClick={handlePrint} disabled={selectedLabels.length === 0}>
          <Printer className="h-4 w-4 mr-2" />
          Imprimir ({totalLabels})
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Produtos Selecionados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedLabels.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Etiquetas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLabels}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Modelo de Etiqueta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">Padrão (40x25mm)</div>
          </CardContent>
        </Card>
      </div>

      {/* Preview */}
      {selectedLabels.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Prévia da Etiqueta</CardTitle>
            <CardDescription>Modelo de como ficará a etiqueta impressa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="inline-block border-2 border-dashed rounded-lg p-4 bg-white">
              <div className="text-xs text-muted-foreground mb-1">EXEMPLO</div>
              <div className="font-bold text-sm truncate max-w-[150px]">Nome do Produto</div>
              <div className="text-xs text-muted-foreground">Cód: 001</div>
              <div className="my-2">
                <div className="flex gap-0.5">
                  {[...Array(40)].map((_, i) => (
                    <div key={i} className={`w-0.5 h-6 ${i % 3 === 0 ? 'bg-black' : 'bg-white'}`} />
                  ))}
                </div>
                <div className="text-[10px] text-center font-mono">7891234567890</div>
              </div>
              <div className="text-xl font-bold">R$ 99,90</div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Código de Barras</TableHead>
                <TableHead className="text-right">Preço</TableHead>
                <TableHead className="text-center">Quantidade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum produto encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Checkbox
                        checked={isSelected(product.id)}
                        onCheckedChange={() => toggleProduct(product.id)}
                      />
                    </TableCell>
                    <TableCell className="font-mono">{product.code}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{product.barcode || '-'}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(product.price)}</TableCell>
                    <TableCell>
                      {isSelected(product.id) && (
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(product.id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{getQuantity(product.id)}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(product.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
