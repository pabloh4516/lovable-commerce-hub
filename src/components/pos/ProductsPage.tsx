import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Package, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProducts, useCategories, useProductMutations, DbProduct } from '@/hooks/useProducts';
import { ProductModal } from './ProductModal';
import { useAuth } from '@/hooks/useAuth';
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

  if (loadingProducts || loadingCategories) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in h-full overflow-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Produtos</h1>
          <p className="text-muted-foreground">
            {products.length} produtos cadastrados
          </p>
        </div>
        {isSupervisor && (
          <Button variant="default" onClick={handleOpenCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </Button>
        )}
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
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
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
                {isSupervisor && (
                  <th className="text-right p-4 font-medium text-muted-foreground">Ações</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const isLowStock = Number(product.stock) <= Number(product.min_stock);
                return (
                  <tr
                    key={product.id}
                    className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                          <Package className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.barcode || '-'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground font-mono">{product.code}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-full bg-secondary text-sm">
                        {getCategoryName(product.category_id)}
                      </span>
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
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenEdit(product)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
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
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum produto encontrado</p>
          </div>
        )}
      </div>

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
