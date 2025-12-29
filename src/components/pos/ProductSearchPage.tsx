import { useState } from 'react';
import { Search, Package, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useProducts } from '@/hooks/useProducts';
import { formatCurrency } from '@/lib/utils';

export function ProductSearchPage() {
  const { products, isLoading } = useProducts();
  const [search, setSearch] = useState('');

  const filtered = products?.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase()) ||
    p.barcode?.includes(search)
  ) || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Search className="h-7 w-7" />
            Consulta de Produtos
          </h1>
          <p className="text-muted-foreground">Pesquise produtos por nome, código ou código de barras</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Digite o nome, código ou código de barras do produto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-12 text-lg"
                autoFocus
              />
            </div>
          </div>

          {search.length > 0 && (
            <div className="mb-4 text-sm text-muted-foreground">
              {filtered.length} produto(s) encontrado(s)
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Código de Barras</TableHead>
                <TableHead className="text-right">Estoque</TableHead>
                <TableHead className="text-right">Custo</TableHead>
                <TableHead className="text-right">Preço</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {search.length > 0 ? 'Nenhum produto encontrado' : 'Digite para buscar produtos'}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.slice(0, 50).map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono">{product.code}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{product.barcode || '-'}</TableCell>
                    <TableCell className={`text-right font-medium ${
                      product.stock <= product.min_stock ? 'text-red-600' : ''
                    }`}>
                      {product.stock} {product.unit}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(product.cost)}</TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {formatCurrency(product.price)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={product.is_active ? "default" : "secondary"}>
                        {product.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {filtered.length > 50 && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Mostrando 50 de {filtered.length} resultados. Refine sua busca para ver mais.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
