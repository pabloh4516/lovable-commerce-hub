import { useState } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { products, categories } from '@/data/mockData';
import { Product } from '@/types/pos';

export function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.code.includes(searchQuery) ||
      product.barcode?.includes(searchQuery);
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Produtos</h1>
          <p className="text-muted-foreground">
            {products.length} produtos cadastrados
          </p>
        </div>
        <Button variant="gradient">
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, código ou código de barras..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          <Button
            variant={selectedCategory === null ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            Todos
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.name ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setSelectedCategory(cat.name)}
              className="shrink-0"
            >
              <span className="mr-1">{cat.icon}</span>
              {cat.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left p-4 font-medium text-muted-foreground">Produto</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Código</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Categoria</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Preço</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Estoque</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product, index) => (
                <ProductRow key={product.id} product={product} index={index} />
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum produto encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductRow({ product, index }: { product: Product; index: number }) {
  const isLowStock = product.stock <= product.minStock;

  return (
    <tr
      className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors animate-slide-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-lg">
            {getCategoryEmoji(product.category)}
          </div>
          <div>
            <p className="font-medium">{product.name}</p>
            <p className="text-sm text-muted-foreground">{product.barcode || '-'}</p>
          </div>
        </div>
      </td>
      <td className="p-4 text-muted-foreground">{product.code}</td>
      <td className="p-4">
        <span className="px-2 py-1 rounded-full bg-secondary text-sm">
          {product.category}
        </span>
      </td>
      <td className="p-4 text-right font-medium">
        R$ {product.price.toFixed(2).replace('.', ',')}
      </td>
      <td className="p-4 text-right">
        <span
          className={`font-medium ${
            isLowStock ? 'text-destructive' : 'text-foreground'
          }`}
        >
          {product.stock} {product.unit}
        </span>
        {isLowStock && (
          <p className="text-xs text-destructive">Estoque baixo</p>
        )}
      </td>
      <td className="p-4">
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    Bebidas: '🥤',
    Alimentos: '🍔',
    Limpeza: '🧹',
    Higiene: '🧴',
    Doces: '🍫',
    Laticínios: '🥛',
    Padaria: '🥖',
    Outros: '📦',
  };
  return emojis[category] || '📦';
}
