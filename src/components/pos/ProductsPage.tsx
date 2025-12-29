import { useState } from 'react';
import { Plus, Edit2, Trash2, Package, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProducts, useCategories, useProductMutations, DbProduct } from '@/hooks/useProducts';
import { ProductModal } from './ProductModal';
import { useAuth } from '@/hooks/useAuth';
import { ModernPageHeader, ModernStatCard, ModernSearchBar, ModernCard, ModernEmptyState } from './common';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DbProduct | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<DbProduct | null>(null);

  const { data: products = [], isLoading: loadingProducts } = useProducts();
  const { data: categories = [], isLoading: loadingCategories } = useCategories();
  const { createProduct, updateProduct, deleteProduct } = useProductMutations();
  const { isSupervisor } = useAuth();

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.code.includes(searchQuery) ||
      product.barcode?.includes(searchQuery);
    const matchesCategory = !selectedCategory || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return '-';
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || '-';
  };

  const handleSaveProduct = (productData: Omit<DbProduct, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingProduct) {
      updateProduct.mutate(
        { id: editingProduct.id, ...productData },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            setEditingProduct(null);
          },
        }
      );
    } else {
      createProduct.mutate(productData, {
        onSuccess: () => {
          setIsModalOpen(false);
        },
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (deletingProduct) {
      deleteProduct.mutate(deletingProduct.id, {
        onSuccess: () => {
          setDeletingProduct(null);
        },
      });
    }
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: DbProduct) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const lowStockCount = products.filter(p => Number(p.stock) <= Number(p.min_stock) && Number(p.stock) > 0).length;
  const outOfStockCount = products.filter(p => Number(p.stock) === 0).length;

  if (loadingProducts || loadingCategories) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in h-full overflow-auto">
      <ModernPageHeader
        title="Produtos"
        subtitle={`${products.length} produtos cadastrados`}
        icon={Package}
        actions={
          isSupervisor && (
            <Button onClick={handleOpenCreate} className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Produto
            </Button>
          )
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ModernStatCard
          title="Total de Produtos"
          value={products.length}
          icon={Package}
          variant="blue"
        />
        <ModernStatCard
          title="Ativos"
          value={products.filter(p => p.is_active).length}
          icon={Package}
          variant="green"
        />
        <ModernStatCard
          title="Estoque Baixo"
          value={lowStockCount}
          icon={Package}
          variant="amber"
        />
        <ModernStatCard
          title="Sem Estoque"
          value={outOfStockCount}
          icon={Package}
          variant="red"
        />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <ModernSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar por nome, código ou código de barras..."
          className="flex-1"
        />
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
          <Button
            variant={selectedCategory === null ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="shrink-0"
          >
            Todos
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className="shrink-0"
            >
              {cat.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <ModernCard noPadding>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-4 font-medium text-muted-foreground text-sm">Produto</th>
                <th className="text-left p-4 font-medium text-muted-foreground text-sm">Código</th>
                <th className="text-left p-4 font-medium text-muted-foreground text-sm">Categoria</th>
                <th className="text-right p-4 font-medium text-muted-foreground text-sm">Preço</th>
                <th className="text-right p-4 font-medium text-muted-foreground text-sm">Estoque</th>
                {isSupervisor && (
                  <th className="text-right p-4 font-medium text-muted-foreground text-sm">Ações</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product, index) => {
                const isLowStock = Number(product.stock) <= Number(product.min_stock);
                return (
                  <tr
                    key={product.id}
                    className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/10">
                          <Package className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.barcode || '-'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground font-mono text-sm">{product.code}</td>
                    <td className="p-4">
                      <Badge variant="secondary" className="font-normal">
                        {getCategoryName(product.category_id)}
                      </Badge>
                    </td>
                    <td className="p-4 text-right font-medium tabular-nums">
                      R$ {Number(product.price).toFixed(2).replace('.', ',')}
                    </td>
                    <td className="p-4 text-right">
                      <span
                        className={`font-medium tabular-nums ${
                          isLowStock ? 'text-destructive' : 'text-foreground'
                        }`}
                      >
                        {Number(product.stock).toFixed(product.is_weighted ? 3 : 0)} {product.unit}
                      </span>
                      {isLowStock && (
                        <p className="text-xs text-destructive">Estoque baixo</p>
                      )}
                    </td>
                    {isSupervisor && (
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-primary/10"
                            onClick={() => handleOpenEdit(product)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeletingProduct(product)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <ModernEmptyState
            icon={Package}
            title="Nenhum produto encontrado"
            description="Tente ajustar os filtros de busca"
          />
        )}
      </ModernCard>

      {/* Product Modal */}
      <ProductModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        product={editingProduct}
        isLoading={createProduct.isPending || updateProduct.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingProduct} onOpenChange={() => setDeletingProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o produto "{deletingProduct?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
