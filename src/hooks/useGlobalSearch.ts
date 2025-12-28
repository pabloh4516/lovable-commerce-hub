import { useMemo } from 'react';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { useSales } from '@/hooks/useSales';

export interface SearchResult {
  id: string;
  type: 'product' | 'customer' | 'sale' | 'navigation';
  title: string;
  subtitle?: string;
  icon?: string;
  action?: string;
  data?: any;
}

const navigationItems = [
  { id: 'nav-pos', title: 'Caixa (PDV)', subtitle: 'Abrir ponto de venda', action: 'pos', icon: 'ShoppingCart' },
  { id: 'nav-dashboard', title: 'Dashboard', subtitle: 'Visualizar métricas', action: 'dashboard', icon: 'LayoutDashboard' },
  { id: 'nav-products', title: 'Produtos', subtitle: 'Gerenciar catálogo', action: 'products', icon: 'Package' },
  { id: 'nav-stock', title: 'Estoque', subtitle: 'Controle de estoque', action: 'stock', icon: 'Warehouse' },
  { id: 'nav-promotions', title: 'Promoções', subtitle: 'Gerenciar ofertas', action: 'promotions', icon: 'Tag' },
  { id: 'nav-stores', title: 'Lojas', subtitle: 'Multi-loja', action: 'stores', icon: 'Building2' },
  { id: 'nav-reports', title: 'Relatórios', subtitle: 'Análises e gráficos', action: 'reports', icon: 'BarChart3' },
  { id: 'nav-audit', title: 'Auditoria', subtitle: 'Logs do sistema', action: 'audit', icon: 'FileText' },
  { id: 'nav-users', title: 'Usuários', subtitle: 'Gerenciar equipe', action: 'users', icon: 'Users' },
  { id: 'nav-settings', title: 'Configurações', subtitle: 'Ajustes do sistema', action: 'settings', icon: 'Settings' },
];

export function useGlobalSearch(query: string) {
  const { data: products } = useProducts();
  const { data: customers } = useCustomers();
  const { data: sales } = useSales();
  const { data: categories } = useCategories();

  const results = useMemo(() => {
    if (!query.trim()) {
      return {
        navigation: navigationItems.map(item => ({
          ...item,
          type: 'navigation' as const,
        })),
        products: [],
        customers: [],
        sales: [],
      };
    }

    const lowerQuery = query.toLowerCase();

    // Filter navigation
    const filteredNavigation = navigationItems
      .filter(item => 
        item.title.toLowerCase().includes(lowerQuery) ||
        item.subtitle.toLowerCase().includes(lowerQuery)
      )
      .map(item => ({
        ...item,
        type: 'navigation' as const,
      }));

    // Filter products
    const filteredProducts = (products || [])
      .filter(product =>
        product.name.toLowerCase().includes(lowerQuery) ||
        product.code.toLowerCase().includes(lowerQuery) ||
        product.barcode?.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 5)
      .map(product => {
        const category = categories?.find(c => c.id === product.category_id);
        return {
          id: product.id,
          type: 'product' as const,
          title: product.name,
          subtitle: `${product.code} • R$ ${product.price.toFixed(2)} • ${category?.name || 'Sem categoria'}`,
          icon: 'Package',
          data: product,
        };
      });

    // Filter customers
    const filteredCustomers = (customers || [])
      .filter(customer =>
        customer.name.toLowerCase().includes(lowerQuery) ||
        customer.cpf?.toLowerCase().includes(lowerQuery) ||
        customer.phone?.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 5)
      .map(customer => ({
        id: customer.id,
        type: 'customer' as const,
        title: customer.name,
        subtitle: customer.cpf || customer.phone || customer.email || 'Cliente',
        icon: 'User',
        data: customer,
      }));

    // Filter sales
    const filteredSales = (sales || [])
      .filter(sale =>
        sale.number.toString().includes(query) ||
        sale.customer?.name?.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 5)
      .map(sale => ({
        id: sale.id,
        type: 'sale' as const,
        title: `Venda #${sale.number.toString().padStart(6, '0')}`,
        subtitle: `R$ ${sale.total.toFixed(2)} • ${sale.customer?.name || 'Cliente avulso'}`,
        icon: 'Receipt',
        data: sale,
      }));

    return {
      navigation: filteredNavigation,
      products: filteredProducts,
      customers: filteredCustomers,
      sales: filteredSales,
    };
  }, [query, products, customers, sales, categories]);

  const totalResults = 
    results.navigation.length + 
    results.products.length + 
    results.customers.length + 
    results.sales.length;

  return {
    results,
    totalResults,
    isEmpty: totalResults === 0,
  };
}
