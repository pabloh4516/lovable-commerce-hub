import { useMemo } from 'react';
import { useProducts, useCategories, DbProduct, DbCategory } from '@/hooks/useProducts';
import { Product, Category } from '@/types/pos';

function toProduct(dbProduct: DbProduct): Product {
  return {
    id: dbProduct.id,
    code: dbProduct.code,
    barcode: dbProduct.barcode || undefined,
    name: dbProduct.name,
    category: dbProduct.category_id || '',
    price: Number(dbProduct.price),
    cost: Number(dbProduct.cost),
    stock: Number(dbProduct.stock),
    minStock: Number(dbProduct.min_stock),
    unit: dbProduct.unit,
    isWeighted: dbProduct.is_weighted,
  };
}

function toCategory(dbCategory: DbCategory): Category {
  return {
    id: dbCategory.id,
    name: dbCategory.name,
    icon: dbCategory.icon,
    color: dbCategory.color,
  };
}

export function usePOSProducts(selectedCategory: string | null = null) {
  const { data: dbProducts = [], isLoading: loadingProducts } = useProducts();
  const { data: dbCategories = [], isLoading: loadingCategories } = useCategories();

  const products = useMemo(() => dbProducts.map(toProduct), [dbProducts]);
  const categories = useMemo(() => dbCategories.map(toCategory), [dbCategories]);

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [selectedCategory, products]);

  const quickProducts = useMemo(() => products.slice(0, 8), [products]);

  return {
    products,
    categories,
    filteredProducts,
    quickProducts,
    isLoading: loadingProducts || loadingCategories,
  };
}
