import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useCategories, DbProduct } from '@/hooks/useProducts';
import { Loader2 } from 'lucide-react';

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (product: Omit<DbProduct, 'id' | 'created_at' | 'updated_at'>) => void;
  product?: DbProduct | null;
  isLoading?: boolean;
}

export function ProductModal({ open, onClose, onSave, product, isLoading }: ProductModalProps) {
  const { data: categories = [] } = useCategories();
  
  const [formData, setFormData] = useState({
    code: '',
    barcode: '',
    name: '',
    category_id: '',
    price: '',
    cost: '',
    stock: '',
    min_stock: '',
    unit: 'un',
    is_weighted: false,
    is_active: true,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        code: product.code,
        barcode: product.barcode || '',
        name: product.name,
        category_id: product.category_id || '',
        price: product.price.toString(),
        cost: product.cost.toString(),
        stock: product.stock.toString(),
        min_stock: product.min_stock.toString(),
        unit: product.unit,
        is_weighted: product.is_weighted,
        is_active: product.is_active,
      });
    } else {
      setFormData({
        code: '',
        barcode: '',
        name: '',
        category_id: '',
        price: '',
        cost: '',
        stock: '',
        min_stock: '',
        unit: 'un',
        is_weighted: false,
        is_active: true,
      });
    }
  }, [product, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSave({
      code: formData.code,
      barcode: formData.barcode || null,
      name: formData.name,
      category_id: formData.category_id || null,
      price: parseFloat(formData.price) || 0,
      cost: parseFloat(formData.cost) || 0,
      stock: parseFloat(formData.stock) || 0,
      min_stock: parseFloat(formData.min_stock) || 0,
      unit: formData.is_weighted ? 'kg' : formData.unit,
      is_weighted: formData.is_weighted,
      is_active: formData.is_active,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{product ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="barcode">Código de Barras</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="7891234567890"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Coca-Cola 2L"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => setFormData({ ...formData, category_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="9.99"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Custo (R$)</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                min="0"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                placeholder="5.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Estoque</Label>
              <Input
                id="stock"
                type="number"
                step="0.001"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="min_stock">Estoque Mínimo</Label>
              <Input
                id="min_stock"
                type="number"
                step="0.001"
                min="0"
                value={formData.min_stock}
                onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
                placeholder="10"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                id="is_weighted"
                checked={formData.is_weighted}
                onCheckedChange={(checked) => setFormData({ ...formData, is_weighted: checked, unit: checked ? 'kg' : 'un' })}
              />
              <Label htmlFor="is_weighted">Produto pesável (kg)</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
