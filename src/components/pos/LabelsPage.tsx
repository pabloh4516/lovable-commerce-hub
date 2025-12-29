import { useState, useMemo } from 'react';
import { Tag, Search, Printer, Plus, Minus, Package, X, Settings2, Barcode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useProducts } from '@/hooks/useProducts';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

interface LabelItem {
  productId: string;
  quantity: number;
}

interface LabelFormat {
  id: string;
  name: string;
  description: string;
  width: number;
  height: number;
  columns: number;
  rows: number;
}

const LABEL_FORMATS: LabelFormat[] = [
  { id: 'pimaco-33', name: 'Pimaco 33 etiquetas', description: 'A4356 - 11cm x 3cm', width: 110, height: 30, columns: 3, rows: 11 },
  { id: 'pimaco-65', name: 'Pimaco 65 etiquetas', description: 'A4451 - 4.5cm x 2.2cm', width: 45, height: 22, columns: 5, rows: 13 },
  { id: 'pimaco-80', name: 'Pimaco 80 etiquetas', description: '6187 - 5.2cm x 2.4cm', width: 52, height: 24, columns: 4, rows: 20 },
  { id: 'pimaco-126', name: 'Pimaco 126 etiquetas', description: '6285 - 2.2cm x 1.7cm', width: 22, height: 17, columns: 7, rows: 18 },
  { id: 'bematech-lb1000', name: 'Bematech LB 1000', description: 'Térmica 40mm x 25mm', width: 40, height: 25, columns: 1, rows: 1 },
  { id: 'zebra-gc420t', name: 'Zebra GC420t', description: 'Térmica 50mm x 30mm', width: 50, height: 30, columns: 1, rows: 1 },
];

export function LabelsPage() {
  const { products, isLoading } = useProducts();
  const [search, setSearch] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<LabelItem[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<string>('pimaco-33');
  const [skipLabels, setSkipLabels] = useState(0);

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

  const setQuantity = (productId: string, qty: number) => {
    setSelectedLabels(prev =>
      prev.map(l => l.productId === productId ? { ...l, quantity: Math.max(1, qty) } : l)
    );
  };

  const removeLabel = (productId: string) => {
    setSelectedLabels(prev => prev.filter(l => l.productId !== productId));
  };

  const getQuantity = (productId: string) => {
    return selectedLabels.find(l => l.productId === productId)?.quantity || 0;
  };

  const isSelected = (productId: string) => {
    return selectedLabels.some(l => l.productId === productId);
  };

  const totalLabels = selectedLabels.reduce((sum, l) => sum + l.quantity, 0);
  const currentFormat = LABEL_FORMATS.find(f => f.id === selectedFormat);

  const addAllProducts = () => {
    const newLabels = filtered.map(p => ({ productId: p.id, quantity: 1 }));
    setSelectedLabels(newLabels);
    toast.success(`${newLabels.length} produtos adicionados`);
  };

  const clearList = () => {
    setSelectedLabels([]);
  };

  const handlePrint = () => {
    if (selectedLabels.length === 0) {
      toast.error('Selecione pelo menos um produto');
      return;
    }
    toast.success(`Preparando impressão de ${totalLabels} etiquetas no formato ${currentFormat?.name}`);
  };

  // Get product details for print list
  const printList = useMemo(() => {
    return selectedLabels.map(label => {
      const product = products?.find(p => p.id === label.productId);
      return { ...label, product };
    }).filter(l => l.product);
  }, [selectedLabels, products]);

  // Generate barcode visualization
  const renderBarcode = (code: string = '7891234567890') => {
    return (
      <div className="flex justify-center gap-px">
        {code.split('').map((char, i) => (
          <div 
            key={i} 
            className={`h-8 ${parseInt(char) % 2 === 0 ? 'w-0.5 bg-foreground' : 'w-1 bg-foreground'}`}
            style={{ width: parseInt(char) % 3 === 0 ? '1px' : parseInt(char) % 2 === 0 ? '2px' : '1.5px' }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Tag className="h-7 w-7" />
            Etiquetas
          </h1>
          <p className="text-muted-foreground">Imprima etiquetas de preço e código de barras</p>
        </div>
        <Button onClick={handlePrint} disabled={selectedLabels.length === 0} size="lg">
          <Printer className="h-4 w-4 mr-2" />
          Imprimir ({totalLabels} etiquetas)
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Product Selection */}
        <div className="lg:col-span-2 space-y-4">
          {/* Stats & Format */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="icon-box">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{selectedLabels.length}</p>
                    <p className="text-sm text-muted-foreground">Produtos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="icon-box-success">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalLabels}</p>
                    <p className="text-sm text-muted-foreground">Total Etiquetas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <Label className="text-xs text-muted-foreground">Formato</Label>
                <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LABEL_FORMATS.map(format => (
                      <SelectItem key={format.id} value={format.id}>
                        <div className="flex flex-col">
                          <span>{format.name}</span>
                          <span className="text-xs text-muted-foreground">{format.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>

          {/* Product Table */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Selecionar Produtos</CardTitle>
                <Button variant="outline" size="sm" onClick={addAllProducts}>
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar Todos
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por código, nome ou código de barras..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Cód. Barras</TableHead>
                      <TableHead className="text-right">Preço</TableHead>
                      <TableHead className="text-center w-32">Qtde</TableHead>
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
                        <TableRow key={product.id} className={isSelected(product.id) ? 'bg-primary/5' : ''}>
                          <TableCell>
                            <Checkbox
                              checked={isSelected(product.id)}
                              onCheckedChange={() => toggleProduct(product.id)}
                            />
                          </TableCell>
                          <TableCell className="font-mono text-sm">{product.code}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                                <Package className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <span className="font-medium truncate max-w-[200px]">{product.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{product.barcode || '-'}</TableCell>
                          <TableCell className="text-right font-bold">{formatCurrency(product.price)}</TableCell>
                          <TableCell>
                            {isSelected(product.id) && (
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => updateQuantity(product.id, -1)}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <Input
                                  className="w-14 h-7 text-center"
                                  type="number"
                                  min={1}
                                  value={getQuantity(product.id)}
                                  onChange={(e) => setQuantity(product.id, parseInt(e.target.value) || 1)}
                                />
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
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right: Print List & Preview */}
        <div className="space-y-4">
          {/* Print List */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Lista de Impressão</CardTitle>
                {selectedLabels.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearList}>
                    Limpar
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {printList.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Selecione produtos para imprimir
                </p>
              ) : (
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {printList.map(item => (
                      <div key={item.productId} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.product?.name}</p>
                          <p className="text-xs text-muted-foreground">{formatCurrency(item.product?.price || 0)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{item.quantity}x</Badge>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeLabel(item.productId)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Skip Labels */}
          <Card>
            <CardContent className="p-4">
              <Label className="text-sm">Pular etiquetas</Label>
              <p className="text-xs text-muted-foreground mb-2">Quantidade de etiquetas já usadas na folha</p>
              <Input
                type="number"
                min={0}
                value={skipLabels}
                onChange={(e) => setSkipLabels(parseInt(e.target.value) || 0)}
                className="w-full"
              />
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Barcode className="h-5 w-5" />
                Prévia da Etiqueta
              </CardTitle>
              <CardDescription>Formato: {currentFormat?.name}</CardDescription>
            </CardHeader>
            <CardContent>
              {printList.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {printList.slice(0, 4).map((item, index) => (
                    <div 
                      key={item.productId} 
                      className="border-2 border-dashed rounded-lg p-3 bg-white dark:bg-card text-foreground"
                      style={{ 
                        aspectRatio: `${currentFormat?.width || 40}/${currentFormat?.height || 25}` 
                      }}
                    >
                      <div className="h-full flex flex-col justify-between">
                        <div>
                          <p className="font-bold text-xs truncate">{item.product?.name}</p>
                          <p className="text-[10px] text-muted-foreground">Cód: {item.product?.code}</p>
                        </div>
                        <div className="my-1">
                          {renderBarcode(item.product?.barcode)}
                          <p className="text-[8px] text-center font-mono">{item.product?.barcode || '0000000000000'}</p>
                        </div>
                        <p className="text-lg font-bold text-center">{formatCurrency(item.product?.price || 0)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-4 bg-muted/30">
                  <div className="text-center text-muted-foreground">
                    <Barcode className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Selecione produtos para ver a prévia</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
